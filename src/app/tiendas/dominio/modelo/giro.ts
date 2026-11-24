/**
 * Giro del negocio (tipo de comercio). Es solo una etiqueta de la tienda: no cambia ningún cálculo financiero.
 * Sirve para adaptar los textos («productos» o «servicios») y sugerir unidades de medida.
 */
export type Oferta = 'productos' | 'servicios';

export interface PerfilGiro {
  nombre: string;
  oferta: Oferta;
  unidades: string[];
}

const UNIDADES_COMERCIO = ['unidad', 'kg', 'litro', 'paquete', 'botella', 'bolsa', 'caja', 'docena'];
const UNIDADES_SERVICIO = ['servicio', 'sesión', 'paquete', 'hora'];

/** Giros sugeridos al crear una tienda (el campo también admite cualquier otro texto de hasta 40 caracteres). */
export const GIROS: PerfilGiro[] = [
  { nombre: 'Bodega', oferta: 'productos', unidades: UNIDADES_COMERCIO },
  { nombre: 'Panadería', oferta: 'productos', unidades: ['unidad', 'bolsa', 'docena', 'porción', 'vaso', 'botella'] },
  { nombre: 'Botica', oferta: 'productos', unidades: ['blíster', 'frasco', 'caja', 'unidad', 'paquete', 'botella'] },
  { nombre: 'Peluquería y spa', oferta: 'servicios', unidades: UNIDADES_SERVICIO },
  { nombre: 'Carnicería', oferta: 'productos', unidades: ['kg', 'unidad', 'paquete'] },
  { nombre: 'Verdulería', oferta: 'productos', unidades: ['kg', 'unidad', 'docena', 'bolsa'] },
  { nombre: 'Bazar', oferta: 'productos', unidades: ['unidad', 'pack', 'paquete', 'caja'] },
  { nombre: 'Licorería', oferta: 'productos', unidades: ['botella', 'caja', 'unidad', 'pack'] },
];

const PALABRAS_DE_SERVICIOS = ['peluquer', 'spa', 'barber', 'salon', 'estetica', 'masaje', 'manicure', 'taller', 'lavander'];

const normalizar = (texto: string): string =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

/** Nombre a mostrar: «Comercio» cuando la tienda no tiene giro. */
export function nombreDeGiro(giro: string | null | undefined): string {
  return giro?.trim() || 'Comercio';
}

/** ¿El giro vende servicios (peluquería, spa…) o productos? Un giro desconocido se considera de productos. */
export function ofertaDeGiro(giro: string | null | undefined): Oferta {
  if (!giro?.trim()) return 'productos';
  const conocido = GIROS.find((g) => normalizar(g.nombre) === normalizar(giro));
  if (conocido) return conocido.oferta;
  const texto = normalizar(giro);
  return PALABRAS_DE_SERVICIOS.some((p) => texto.includes(p)) ? 'servicios' : 'productos';
}

/** Unidades de medida sugeridas para el giro. */
export function unidadesSugeridas(giro: string | null | undefined): string[] {
  const conocido = GIROS.find((g) => normalizar(g.nombre) === normalizar(giro ?? ''));
  if (conocido) return conocido.unidades;
  return ofertaDeGiro(giro) === 'servicios' ? UNIDADES_SERVICIO : UNIDADES_COMERCIO;
}

/** Nombre de la imagen de banner (assets/fondos/banner-<nombre>.jpg) que corresponde al giro. */
export function bannerDeGiro(giro: string | null | undefined): 'bodega' | 'panaderia' | 'botica' | 'peluqueria' {
  const texto = normalizar(giro ?? '');
  if (texto.includes('panader')) return 'panaderia';
  if (texto.includes('botica') || texto.includes('farmacia')) return 'botica';
  return ofertaDeGiro(giro) === 'servicios' ? 'peluqueria' : 'bodega';
}

export interface EtiquetasOferta {
  plural: string;
  singular: string;
  pluralMinuscula: string;
  nuevo: string;
}

/** Textos de la interfaz según la oferta del negocio. */
export function etiquetasDeOferta(giro: string | null | undefined): EtiquetasOferta {
  return ofertaDeGiro(giro) === 'servicios'
    ? { plural: 'Servicios', singular: 'servicio', pluralMinuscula: 'servicios', nuevo: 'Nuevo servicio' }
    : { plural: 'Productos', singular: 'producto', pluralMinuscula: 'productos', nuevo: 'Nuevo producto' };
}
