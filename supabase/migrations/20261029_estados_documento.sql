-- Sprint 3: estado "en_preparacion" en ventas y documento (DNI/RUC/CE) en clientes.
-- Estados visibles: pendiente → confirmado (Pagado) → en_preparacion → enviado
-- (Despachado) → entregado, más cancelado.

alter table public.ventas drop constraint if exists ventas_estado_check;
alter table public.ventas add constraint ventas_estado_check
  check (estado in ('pendiente', 'confirmado', 'en_preparacion', 'enviado', 'entregado', 'cancelado'));

alter table public.clientes
  add column if not exists tipo_documento text,
  add column if not exists documento text;

alter table public.clientes drop constraint if exists clientes_documento_check;
alter table public.clientes add constraint clientes_documento_check check (
  (documento is null and tipo_documento is null)
  or (tipo_documento = 'DNI' and documento ~ '^[0-9]{8}$')
  or (tipo_documento = 'RUC' and documento ~ '^(10|15|17|20)[0-9]{9}$')
  or (tipo_documento = 'CE' and documento ~ '^[A-Z0-9]{8,12}$')
);

-- Un documento no puede repetirse entre clientes (CA-02 de HU-02).
create unique index if not exists clientes_documento_uniq on public.clientes (documento) where documento is not null;
