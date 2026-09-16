// ============================================================
// Prefijos telefónicos — Victoria Modas
// ------------------------------------------------------------
// Perú primero (el grueso de la clientela y valor por defecto); el resto,
// alfabético por nombre en español, para que sea fácil de ubicar en la
// lista. Cubre Latinoamérica completa + los mercados más comunes de la fase
// de crecimiento internacional (ver CLAUDE.md).
//
// Nota: EE.UU. y Canadá comparten el mismo código de país (+1) en el plan
// de numeración norteamericano (NANP), igual que varios países del Caribe
// (Puerto Rico, Rep. Dominicana, etc.) — se agrupan bajo una sola entrada
// para no repetir "+1" con nombres distintos.
//
// `length`: cantidad de dígitos del número nacional (sin el código de
// país) que PhoneField usa para limitar cuánto se puede escribir — bug
// real corregido: antes se podía escribir cualquier cantidad de dígitos
// sin importar el país (ej. más de 9 con +51 Perú). Son las longitudes
// típicas de número móvil de cada país (no una validación E.164 completa
// vía librería — decisión consciente de no sumar una dependencia grande
// solo para esto); unos pocos países tienen longitud variable en la vida
// real, acá se usa la más común.
// ============================================================
export const PHONE_COUNTRIES = [
  { code: '+51', iso: 'PE', name: 'Perú', length: 9 },

  { code: '+49', iso: 'DE', name: 'Alemania', length: 11 },
  { code: '+54', iso: 'AR', name: 'Argentina', length: 10 },
  { code: '+61', iso: 'AU', name: 'Australia', length: 9 },
  { code: '+43', iso: 'AT', name: 'Austria', length: 11 },
  { code: '+32', iso: 'BE', name: 'Bélgica', length: 9 },
  { code: '+591', iso: 'BO', name: 'Bolivia', length: 8 },
  { code: '+55', iso: 'BR', name: 'Brasil', length: 11 },
  { code: '+56', iso: 'CL', name: 'Chile', length: 9 },
  { code: '+86', iso: 'CN', name: 'China', length: 11 },
  { code: '+57', iso: 'CO', name: 'Colombia', length: 10 },
  { code: '+82', iso: 'KR', name: 'Corea del Sur', length: 10 },
  { code: '+506', iso: 'CR', name: 'Costa Rica', length: 8 },
  { code: '+53', iso: 'CU', name: 'Cuba', length: 8 },
  { code: '+45', iso: 'DK', name: 'Dinamarca', length: 8 },
  { code: '+593', iso: 'EC', name: 'Ecuador', length: 9 },
  { code: '+20', iso: 'EG', name: 'Egipto', length: 10 },
  { code: '+503', iso: 'SV', name: 'El Salvador', length: 8 },
  { code: '+971', iso: 'AE', name: 'Emiratos Árabes Unidos', length: 9 },
  { code: '+34', iso: 'ES', name: 'España', length: 9 },
  { code: '+1', iso: 'US', name: 'Estados Unidos / Canadá', length: 10 },
  { code: '+63', iso: 'PH', name: 'Filipinas', length: 10 },
  { code: '+358', iso: 'FI', name: 'Finlandia', length: 9 },
  { code: '+33', iso: 'FR', name: 'Francia', length: 9 },
  { code: '+30', iso: 'GR', name: 'Grecia', length: 10 },
  { code: '+502', iso: 'GT', name: 'Guatemala', length: 8 },
  { code: '+504', iso: 'HN', name: 'Honduras', length: 8 },
  { code: '+91', iso: 'IN', name: 'India', length: 10 },
  { code: '+62', iso: 'ID', name: 'Indonesia', length: 11 },
  { code: '+353', iso: 'IE', name: 'Irlanda', length: 9 },
  { code: '+972', iso: 'IL', name: 'Israel', length: 9 },
  { code: '+39', iso: 'IT', name: 'Italia', length: 10 },
  { code: '+81', iso: 'JP', name: 'Japón', length: 10 },
  { code: '+60', iso: 'MY', name: 'Malasia', length: 9 },
  { code: '+52', iso: 'MX', name: 'México', length: 10 },
  { code: '+505', iso: 'NI', name: 'Nicaragua', length: 8 },
  { code: '+234', iso: 'NG', name: 'Nigeria', length: 10 },
  { code: '+47', iso: 'NO', name: 'Noruega', length: 8 },
  { code: '+64', iso: 'NZ', name: 'Nueva Zelanda', length: 9 },
  { code: '+31', iso: 'NL', name: 'Países Bajos', length: 9 },
  { code: '+92', iso: 'PK', name: 'Pakistán', length: 10 },
  { code: '+507', iso: 'PA', name: 'Panamá', length: 8 },
  { code: '+595', iso: 'PY', name: 'Paraguay', length: 9 },
  { code: '+48', iso: 'PL', name: 'Polonia', length: 9 },
  { code: '+351', iso: 'PT', name: 'Portugal', length: 9 },
  { code: '+44', iso: 'GB', name: 'Reino Unido', length: 10 },
  { code: '+7', iso: 'RU', name: 'Rusia', length: 10 },
  { code: '+65', iso: 'SG', name: 'Singapur', length: 8 },
  { code: '+27', iso: 'ZA', name: 'Sudáfrica', length: 9 },
  { code: '+46', iso: 'SE', name: 'Suecia', length: 9 },
  { code: '+41', iso: 'CH', name: 'Suiza', length: 9 },
  { code: '+66', iso: 'TH', name: 'Tailandia', length: 9 },
  { code: '+90', iso: 'TR', name: 'Turquía', length: 10 },
  { code: '+380', iso: 'UA', name: 'Ucrania', length: 9 },
  { code: '+598', iso: 'UY', name: 'Uruguay', length: 9 },
  { code: '+58', iso: 'VE', name: 'Venezuela', length: 10 },
  { code: '+84', iso: 'VN', name: 'Vietnam', length: 9 },
]

export const DEFAULT_PHONE_COUNTRY = PHONE_COUNTRIES[0] // Perú

// ¿El número tiene la cantidad de dígitos esperada para ese país? (no solo
// "no vacío" — un número a medio escribir tampoco debería pasar). Si el
// país no tiene `length` conocida, no se puede afirmar que esté mal, así
// que no bloquea (fallback permisivo, mismo criterio del resto del sitio).
export function telefonoTieneLongitudValida(prefix, numero) {
  const pais = PHONE_COUNTRIES.find((c) => c.code === prefix)
  if (!pais?.length) return true
  return numero.trim().length === pais.length
}
