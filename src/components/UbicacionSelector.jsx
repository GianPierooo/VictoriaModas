import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { DEPARTAMENTOS, getProvincias, getDistritos } from '../data/ubigeoPeru.js'

// ============================================================
// UbicacionSelector — Departamento / Provincia / Distrito en cascada.
// ------------------------------------------------------------
// Reemplaza el campo de texto libre "Ciudad/Distrito" del checkout por
// el mismo patrón que usan las tiendas grandes en Perú (Falabella,
// Ripley, Mercado Libre): 3 selects en cascada, con datos reales de
// UBIGEO (ver src/data/ubigeoPeru.js) — nunca texto libre ni distritos
// inventados.
//
// <select> nativo (no Headless UI Listbox como PhoneField): son listas
// largas (hasta ~50 distritos en un mismo select) donde el <select> del
// sistema es más rápido de usar (búsqueda por teclado nativa) que un
// listbox propio, y en móvil abre el picker nativo del SO.
//
// Al cambiar departamento se limpia provincia+distrito; al cambiar
// provincia se limpia distrito — evita quedar con una combinación que
// ya no existe (ej. una provincia de otro departamento).
// ============================================================
export default function UbicacionSelector({
  departamento,
  provincia,
  distrito,
  onDepartamentoChange,
  onProvinciaChange,
  onDistritoChange,
  hasError = false,
}) {
  const provincias = getProvincias(departamento)
  const distritos = getDistritos(departamento, provincia)

  const selectClass = `w-full appearance-none border-b bg-transparent py-2.5 pr-6 text-ink font-light focus:outline-none transition-colors disabled:cursor-not-allowed disabled:text-ink-muted/50 ${
    hasError ? 'border-red-300 focus:border-red-400' : 'border-ink/20 focus:border-clay'
  }`
  const labelClass = 'mb-2 block text-[10px] uppercase tracking-luxe text-ink-muted'

  return (
    <div className="grid grid-cols-1 gap-7 sm:grid-cols-3">
      <div>
        <label htmlFor="ubicacion-departamento" className={labelClass}>Departamento *</label>
        <div className="relative">
          <select
            id="ubicacion-departamento"
            value={departamento}
            onChange={(e) => {
              onDepartamentoChange(e.target.value)
              onProvinciaChange('')
              onDistritoChange('')
            }}
            className={selectClass}
          >
            <option value="">Selecciona</option>
            {DEPARTAMENTOS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
        </div>
      </div>

      <div>
        <label htmlFor="ubicacion-provincia" className={labelClass}>Provincia *</label>
        <div className="relative">
          <select
            id="ubicacion-provincia"
            value={provincia}
            onChange={(e) => {
              onProvinciaChange(e.target.value)
              onDistritoChange('')
            }}
            disabled={!departamento}
            className={selectClass}
          >
            <option value="">{departamento ? 'Selecciona' : '—'}</option>
            {provincias.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
        </div>
      </div>

      <div>
        <label htmlFor="ubicacion-distrito" className={labelClass}>Distrito *</label>
        <div className="relative">
          <select
            id="ubicacion-distrito"
            value={distrito}
            onChange={(e) => onDistritoChange(e.target.value)}
            disabled={!provincia}
            className={selectClass}
          >
            <option value="">{provincia ? 'Selecciona' : '—'}</option>
            {distritos.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}
