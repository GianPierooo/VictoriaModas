import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { PHONE_COUNTRIES, DEFAULT_PHONE_COUNTRY } from '../utils/phoneCountries.js'

// ============================================================
// PhoneField — selector de prefijo + número, en un solo campo visual.
// ------------------------------------------------------------
// Patrón tomado de cómo lo resuelven tiendas grandes (Mango, Shein, etc.):
// un selector de código de país junto al número, en vez de pedir el
// teléfono completo en un solo texto libre.
//
// Desplegable propio (Headless UI Listbox, no <select> nativo): el <select>
// del navegador se ve distinto según el sistema operativo y no soporta
// mostrar el nombre del país junto al código sin verse tosco. Cerrado
// muestra solo el código ("+51"); abierto, lista con nombre + código.
//
// Uso: <PhoneField id="telefono" prefix={prefix} onPrefixChange={...}
//        number={numero} onNumberChange={...} hasError={...} />
// El valor combinado (ej. "+51 999888777") lo arma quien lo use.
// ============================================================
export default function PhoneField({
  id,
  label,
  prefix,
  onPrefixChange,
  number,
  onNumberChange,
  placeholder = '999 999 999',
  hasError = false,
  required = false,
}) {
  const selected = PHONE_COUNTRIES.find((c) => c.code === prefix) || DEFAULT_PHONE_COUNTRY

  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-2 block text-[10px] uppercase tracking-luxe text-ink-muted">
          {label}
          {required && ' *'}
        </label>
      )}
      <div className="flex items-stretch gap-3">
        <Listbox
          value={selected.iso}
          onChange={(iso) => {
            const country = PHONE_COUNTRIES.find((c) => c.iso === iso)
            if (country) onPrefixChange(country.code)
          }}
        >
          <div className="relative shrink-0">
            <Listbox.Button
              className="flex h-full items-center gap-1.5 border-b border-ink/20 bg-transparent py-2.5 pr-1 text-ink font-light transition-colors focus:border-clay focus:outline-none"
              aria-label="Prefijo telefónico"
            >
              <span>{selected.code}</span>
              <ChevronDownIcon className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
            </Listbox.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-150"
              enterFrom="opacity-0 -translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 -translate-y-1"
            >
              <Listbox.Options className="absolute left-0 top-full z-20 mt-2 max-h-72 w-64 overflow-auto rounded-xl bg-cream p-1.5 shadow-soft ring-1 ring-ink/10 focus:outline-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {PHONE_COUNTRIES.map((c) => (
                  <Listbox.Option key={c.iso} value={c.iso} as={Fragment}>
                    {({ active, selected: isSelected }) => (
                      <li
                        className={`flex cursor-pointer items-center justify-between gap-4 rounded-lg px-3.5 py-2.5 text-sm font-light transition-colors ${
                          active ? 'bg-cream-dark text-ink' : isSelected ? 'text-ink' : 'text-ink-soft'
                        }`}
                      >
                        <span className="truncate">{c.name}</span>
                        <span className={`shrink-0 text-xs ${isSelected ? 'text-clay' : 'text-ink-muted'}`}>{c.code}</span>
                      </li>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
        <input
          type="tel"
          id={id}
          name={id}
          autoComplete="tel-national"
          value={number}
          onChange={(e) => onNumberChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full border-b bg-transparent py-2.5 text-ink font-light placeholder:text-ink-muted/50 focus:outline-none transition-colors ${
            hasError ? 'border-red-300 focus:border-red-400' : 'border-ink/20 focus:border-clay'
          }`}
        />
      </div>
    </div>
  )
}
