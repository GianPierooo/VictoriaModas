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
// ============================================================
export const PHONE_COUNTRIES = [
  { code: '+51', iso: 'PE', name: 'Perú' },

  { code: '+49', iso: 'DE', name: 'Alemania' },
  { code: '+54', iso: 'AR', name: 'Argentina' },
  { code: '+61', iso: 'AU', name: 'Australia' },
  { code: '+43', iso: 'AT', name: 'Austria' },
  { code: '+32', iso: 'BE', name: 'Bélgica' },
  { code: '+591', iso: 'BO', name: 'Bolivia' },
  { code: '+55', iso: 'BR', name: 'Brasil' },
  { code: '+56', iso: 'CL', name: 'Chile' },
  { code: '+86', iso: 'CN', name: 'China' },
  { code: '+57', iso: 'CO', name: 'Colombia' },
  { code: '+82', iso: 'KR', name: 'Corea del Sur' },
  { code: '+506', iso: 'CR', name: 'Costa Rica' },
  { code: '+53', iso: 'CU', name: 'Cuba' },
  { code: '+45', iso: 'DK', name: 'Dinamarca' },
  { code: '+593', iso: 'EC', name: 'Ecuador' },
  { code: '+20', iso: 'EG', name: 'Egipto' },
  { code: '+503', iso: 'SV', name: 'El Salvador' },
  { code: '+971', iso: 'AE', name: 'Emiratos Árabes Unidos' },
  { code: '+34', iso: 'ES', name: 'España' },
  { code: '+1', iso: 'US', name: 'Estados Unidos / Canadá' },
  { code: '+63', iso: 'PH', name: 'Filipinas' },
  { code: '+358', iso: 'FI', name: 'Finlandia' },
  { code: '+33', iso: 'FR', name: 'Francia' },
  { code: '+30', iso: 'GR', name: 'Grecia' },
  { code: '+502', iso: 'GT', name: 'Guatemala' },
  { code: '+504', iso: 'HN', name: 'Honduras' },
  { code: '+91', iso: 'IN', name: 'India' },
  { code: '+62', iso: 'ID', name: 'Indonesia' },
  { code: '+353', iso: 'IE', name: 'Irlanda' },
  { code: '+972', iso: 'IL', name: 'Israel' },
  { code: '+39', iso: 'IT', name: 'Italia' },
  { code: '+81', iso: 'JP', name: 'Japón' },
  { code: '+60', iso: 'MY', name: 'Malasia' },
  { code: '+52', iso: 'MX', name: 'México' },
  { code: '+505', iso: 'NI', name: 'Nicaragua' },
  { code: '+234', iso: 'NG', name: 'Nigeria' },
  { code: '+47', iso: 'NO', name: 'Noruega' },
  { code: '+64', iso: 'NZ', name: 'Nueva Zelanda' },
  { code: '+31', iso: 'NL', name: 'Países Bajos' },
  { code: '+92', iso: 'PK', name: 'Pakistán' },
  { code: '+507', iso: 'PA', name: 'Panamá' },
  { code: '+595', iso: 'PY', name: 'Paraguay' },
  { code: '+48', iso: 'PL', name: 'Polonia' },
  { code: '+351', iso: 'PT', name: 'Portugal' },
  { code: '+44', iso: 'GB', name: 'Reino Unido' },
  { code: '+7', iso: 'RU', name: 'Rusia' },
  { code: '+65', iso: 'SG', name: 'Singapur' },
  { code: '+27', iso: 'ZA', name: 'Sudáfrica' },
  { code: '+46', iso: 'SE', name: 'Suecia' },
  { code: '+41', iso: 'CH', name: 'Suiza' },
  { code: '+66', iso: 'TH', name: 'Tailandia' },
  { code: '+90', iso: 'TR', name: 'Turquía' },
  { code: '+380', iso: 'UA', name: 'Ucrania' },
  { code: '+598', iso: 'UY', name: 'Uruguay' },
  { code: '+58', iso: 'VE', name: 'Venezuela' },
  { code: '+84', iso: 'VN', name: 'Vietnam' },
]

export const DEFAULT_PHONE_COUNTRY = PHONE_COUNTRIES[0] // Perú
