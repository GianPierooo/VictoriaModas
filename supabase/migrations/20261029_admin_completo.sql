-- ============================================================
-- 2026-10-29 — Panel admin completo + cierre de escalada de privilegios.
-- Todo aditivo: no borra datos ni cambia columnas que use la web pública.
-- Aplicado en producción vía Management API el mismo día.
-- ============================================================

-- ---------- 0) SEGURIDAD: cualquier usuario podía cambiarse el rol a admin ----------
-- (política UPDATE sin with_check + GRANT UPDATE en todas las columnas).
revoke update on public.perfiles from anon, authenticated;
revoke insert, delete, truncate on public.perfiles from anon, authenticated;
grant update (nombre, telefono, updated_at, codigo_referido) on public.perfiles to authenticated;
drop policy if exists perfiles_update_propio on public.perfiles;
create policy perfiles_update_propio on public.perfiles for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Helper: ¿quien llama es staff / admin?
create or replace function public.es_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from perfiles where user_id = auth.uid() and rol in ('admin','vendedor'))
$$;
create or replace function public.es_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from perfiles where user_id = auth.uid() and rol = 'admin')
$$;

-- ---------- 1) Códigos cortos legibles ----------
create sequence if not exists public.ventas_codigo_seq;
create sequence if not exists public.clientes_codigo_seq;
create sequence if not exists public.variantes_codigo_seq;

alter table public.ventas add column if not exists codigo text;
alter table public.clientes add column if not exists codigo text;
alter table public.producto_variantes add column if not exists codigo text;
alter table public.categorias add column if not exists codigo text;
alter table public.tallas add column if not exists codigo text;
alter table public.colores add column if not exists codigo text;

-- Backfill por orden de creación.
with o as (select id, row_number() over (order by created_at, id) n from public.ventas where codigo is null)
update public.ventas v set codigo = 'VTA-' || lpad(o.n::text, 5, '0') from o where v.id = o.id;
with o as (select id, row_number() over (order by created_at, id) n from public.clientes where codigo is null)
update public.clientes c set codigo = 'CLI-' || lpad(o.n::text, 5, '0') from o where c.id = o.id;
with o as (select v.id, row_number() over (order by p.created_at, v.producto_id, v.id) n
           from public.producto_variantes v join public.productos p on p.id = v.producto_id where v.codigo is null)
update public.producto_variantes v set codigo = 'VAR-' || lpad(o.n::text, 5, '0') from o where v.id = o.id;
with o as (select id, row_number() over (order by orden, nombre) n from public.categorias where codigo is null)
update public.categorias x set codigo = 'CAT-' || lpad(o.n::text, 2, '0') from o where x.id = o.id;
with o as (select id, row_number() over (order by orden, nombre) n from public.tallas where codigo is null)
update public.tallas x set codigo = 'TAL-' || lpad(o.n::text, 2, '0') from o where x.id = o.id;
with o as (select id, row_number() over (order by orden, nombre) n from public.colores where codigo is null)
update public.colores x set codigo = 'COL-' || lpad(o.n::text, 2, '0') from o where x.id = o.id;

select setval('public.ventas_codigo_seq', greatest(1, (select count(*) from public.ventas)), (select count(*) > 0 from public.ventas));
select setval('public.clientes_codigo_seq', greatest(1, (select count(*) from public.clientes)), (select count(*) > 0 from public.clientes));
select setval('public.variantes_codigo_seq', greatest(1, (select count(*) from public.producto_variantes)), (select count(*) > 0 from public.producto_variantes));

alter table public.ventas alter column codigo set default 'VTA-' || lpad(nextval('public.ventas_codigo_seq')::text, 5, '0');
alter table public.clientes alter column codigo set default 'CLI-' || lpad(nextval('public.clientes_codigo_seq')::text, 5, '0');
alter table public.producto_variantes alter column codigo set default 'VAR-' || lpad(nextval('public.variantes_codigo_seq')::text, 5, '0');

-- Catálogo base: el siguiente número se calcula al insertar (tablas chicas).
create or replace function public.asignar_codigo_lookup() returns trigger
language plpgsql as $$
declare pref text; n int;
begin
  if new.codigo is not null and new.codigo <> '' then return new; end if;
  pref := case tg_table_name when 'categorias' then 'CAT-' when 'tallas' then 'TAL-' else 'COL-' end;
  execute format('select coalesce(max(nullif(regexp_replace(codigo, ''\D'', '''', ''g''), '''')::int), 0) + 1 from public.%I', tg_table_name) into n;
  new.codigo := pref || lpad(n::text, 2, '0');
  return new;
end $$;
drop trigger if exists trg_codigo_categorias on public.categorias;
drop trigger if exists trg_codigo_tallas on public.tallas;
drop trigger if exists trg_codigo_colores on public.colores;
create trigger trg_codigo_categorias before insert on public.categorias for each row execute function public.asignar_codigo_lookup();
create trigger trg_codigo_tallas before insert on public.tallas for each row execute function public.asignar_codigo_lookup();
create trigger trg_codigo_colores before insert on public.colores for each row execute function public.asignar_codigo_lookup();

create unique index if not exists ventas_codigo_key on public.ventas(codigo);
create unique index if not exists clientes_codigo_key on public.clientes(codigo);
create unique index if not exists producto_variantes_codigo_key on public.producto_variantes(codigo);

-- ---------- 2) Historial de stock (kardex) ----------
create table if not exists public.stock_movimientos (
  id uuid primary key default gen_random_uuid(),
  variante_id uuid not null references public.producto_variantes(id) on delete cascade,
  stock_anterior integer not null,
  stock_nuevo integer not null,
  delta integer not null,
  motivo text not null,
  venta_id uuid references public.ventas(id) on delete set null,
  user_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists stock_movimientos_variante_idx on public.stock_movimientos(variante_id, created_at desc);
alter table public.stock_movimientos enable row level security;
drop policy if exists stock_movimientos_select_staff on public.stock_movimientos;
create policy stock_movimientos_select_staff on public.stock_movimientos for select to authenticated using (public.es_staff());
revoke insert, update, delete, truncate on public.stock_movimientos from anon, authenticated;

-- Registra TODO cambio de stock, venga de donde venga (panel, Culqi, SQL).
-- Motivo: el que fije la función que hizo el cambio (vm.motivo); si no hay,
-- 'venta_web' cuando no hay usuario (llave de servicio = /api/culqi-cobrar)
-- o 'ajuste' cuando lo hizo alguien del equipo.
create or replace function public.log_stock_movimiento() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.stock is distinct from old.stock then
    insert into stock_movimientos (variante_id, stock_anterior, stock_nuevo, delta, motivo, venta_id, user_id)
    values (
      new.id, old.stock, new.stock, new.stock - old.stock,
      coalesce(nullif(current_setting('vm.motivo', true), ''), case when auth.uid() is null then 'venta_web' else 'ajuste' end),
      nullif(current_setting('vm.venta_id', true), '')::uuid,
      auth.uid()
    );
  end if;
  return new;
end $$;
drop trigger if exists trg_log_stock on public.producto_variantes;
create trigger trg_log_stock after update of stock on public.producto_variantes
  for each row execute function public.log_stock_movimiento();

-- ---------- 3) Ventas: descontar / cancelar de forma atómica ----------
create or replace function public.descontar_stock_venta(p_venta uuid) returns void
language plpgsql security definer set search_path = public as $$
declare it record;
begin
  if not public.es_staff() then raise exception 'No autorizado'; end if;
  perform set_config('vm.motivo', 'venta', true);
  perform set_config('vm.venta_id', p_venta::text, true);
  for it in select producto_variante_id, cantidad from venta_items where venta_id = p_venta loop
    update producto_variantes set stock = stock - it.cantidad
      where id = it.producto_variante_id and stock >= it.cantidad;
    if not found then raise exception 'No hay stock suficiente para uno de los productos.'; end if;
  end loop;
end $$;

-- Cancela una venta: devuelve el stock, libera el uso del cupón y deja nota.
create or replace function public.cancelar_venta(p_venta uuid, p_motivo text default null) returns void
language plpgsql security definer set search_path = public as $$
declare v record; it record;
begin
  if not public.es_staff() then raise exception 'No autorizado'; end if;
  select * into v from ventas where id = p_venta for update;
  if not found then raise exception 'Venta no encontrada'; end if;
  if v.estado = 'cancelado' then return; end if;

  perform set_config('vm.motivo', 'cancelacion', true);
  perform set_config('vm.venta_id', p_venta::text, true);
  for it in select producto_variante_id, cantidad from venta_items where venta_id = p_venta and producto_variante_id is not null loop
    update producto_variantes set stock = stock + it.cantidad where id = it.producto_variante_id;
  end loop;

  if v.cupon_id is not null then
    delete from cupones_usados where venta_id = p_venta;
    update cupones set usos_actuales = greatest(0, usos_actuales - 1) where id = v.cupon_id;
  end if;

  update ventas set estado = 'cancelado', updated_at = now(),
    notas = concat_ws(E'\n', nullif(notas, ''), case when coalesce(p_motivo, '') <> '' then '[Cancelada] ' || p_motivo end)
  where id = p_venta;
end $$;

-- Ajuste manual de stock desde /admin/stock con motivo legible.
create or replace function public.ajustar_stock(p_variante uuid, p_stock integer, p_motivo text default 'ajuste') returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.es_staff() then raise exception 'No autorizado'; end if;
  perform set_config('vm.motivo', coalesce(nullif(p_motivo, ''), 'ajuste'), true);
  update producto_variantes set stock = greatest(0, p_stock) where id = p_variante;
end $$;

-- ---------- 4) Reclamos de prueba ----------
alter table public.reclamaciones add column if not exists es_prueba boolean not null default false;
alter table public.reclamaciones add column if not exists notas_internas text;

-- ---------- 5) Equipo (gestión de roles, solo admin) ----------
create or replace function public.admin_listar_equipo()
returns table (user_id uuid, email text, nombre text, telefono text, rol text, created_at timestamptz, ultimo_acceso timestamptz)
language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public.es_admin() then raise exception 'No autorizado'; end if;
  return query
    select p.user_id, u.email::text, p.nombre, p.telefono, p.rol, p.created_at, u.last_sign_in_at
    from perfiles p join auth.users u on u.id = p.user_id
    order by case p.rol when 'admin' then 0 when 'vendedor' then 1 else 2 end, p.created_at desc;
end $$;

create or replace function public.admin_set_rol(p_user uuid, p_rol text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.es_admin() then raise exception 'No autorizado'; end if;
  if p_rol not in ('admin','vendedor','cliente') then raise exception 'Rol inválido'; end if;
  if p_user = auth.uid() and p_rol <> 'admin' then raise exception 'No puedes quitarte tu propio rol de admin.'; end if;
  update perfiles set rol = p_rol, updated_at = now() where user_id = p_user;
end $$;

-- ---------- 6) Ajustes editables (anuncios de la barra superior) ----------
create table if not exists public.ajustes (
  clave text primary key,
  valor jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);
alter table public.ajustes enable row level security;
drop policy if exists ajustes_select_publico on public.ajustes;
create policy ajustes_select_publico on public.ajustes for select using (true);
drop policy if exists ajustes_admin_write on public.ajustes;
create policy ajustes_admin_write on public.ajustes for all to authenticated using (public.es_admin()) with check (public.es_admin());
insert into public.ajustes (clave, valor) values
  ('anuncios', '["Envío gratis en compras mayores a S/ 60", "Nueva colección disponible", "Atención personalizada por WhatsApp"]'::jsonb)
on conflict (clave) do nothing;

-- Permisos de ejecución de las funciones.
revoke execute on function public.descontar_stock_venta(uuid), public.cancelar_venta(uuid, text),
  public.ajustar_stock(uuid, integer, text), public.admin_listar_equipo(), public.admin_set_rol(uuid, text) from anon, public;
grant execute on function public.descontar_stock_venta(uuid), public.cancelar_venta(uuid, text),
  public.ajustar_stock(uuid, integer, text), public.admin_listar_equipo(), public.admin_set_rol(uuid, text),
  public.es_staff(), public.es_admin() to authenticated;
