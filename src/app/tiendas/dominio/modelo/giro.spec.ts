import { describe, expect, it } from 'vitest';
import { GIROS, bannerDeGiro, etiquetasDeOferta, nombreDeGiro, ofertaDeGiro, unidadesSugeridas } from './giro';

describe('giro del negocio', () => {
  it('sin giro se muestra «Comercio» y se tratan productos', () => {
    expect(nombreDeGiro(null)).toBe('Comercio');
    expect(nombreDeGiro('  ')).toBe('Comercio');
    expect(ofertaDeGiro(undefined)).toBe('productos');
    expect(etiquetasDeOferta(null).plural).toBe('Productos');
  });

  it('la peluquería y el spa venden servicios; la bodega, la panadería y la botica, productos', () => {
    expect(ofertaDeGiro('Peluquería y spa')).toBe('servicios');
    expect(ofertaDeGiro('Bodega')).toBe('productos');
    expect(ofertaDeGiro('Panadería')).toBe('productos');
    expect(ofertaDeGiro('Botica')).toBe('productos');
  });

  it('reconoce giros escritos a mano, con o sin tildes y mayúsculas', () => {
    expect(ofertaDeGiro('PELUQUERIA')).toBe('servicios');
    expect(ofertaDeGiro('Barbería Don Lucho')).toBe('servicios');
    expect(ofertaDeGiro('Centro de masajes')).toBe('servicios');
    expect(ofertaDeGiro('Ferretería')).toBe('productos');
  });

  it('adapta los textos según la oferta', () => {
    expect(etiquetasDeOferta('Peluquería y spa')).toEqual({
      plural: 'Servicios',
      singular: 'servicio',
      pluralMinuscula: 'servicios',
      nuevo: 'Nuevo servicio',
    });
    expect(etiquetasDeOferta('Bodega').nuevo).toBe('Nuevo producto');
  });

  it('sugiere unidades propias de cada giro', () => {
    expect(unidadesSugeridas('Peluquería y spa')).toContain('sesión');
    expect(unidadesSugeridas('Peluquería y spa')).not.toContain('kg');
    expect(unidadesSugeridas('Botica')).toContain('blíster');
    expect(unidadesSugeridas('Bodega')).toContain('kg');
    expect(unidadesSugeridas('Algo distinto')).toContain('unidad');
    expect(unidadesSugeridas('Salón de belleza')).toContain('servicio');
  });

  it('elige el banner de cada giro (la bodega es el valor por defecto)', () => {
    expect(bannerDeGiro('Panadería')).toBe('panaderia');
    expect(bannerDeGiro('Botica')).toBe('botica');
    expect(bannerDeGiro('Peluquería y spa')).toBe('peluqueria');
    expect(bannerDeGiro('Bodega')).toBe('bodega');
    expect(bannerDeGiro(null)).toBe('bodega');
  });

  it('la lista de giros sugeridos no tiene nombres repetidos ni supera los 40 caracteres', () => {
    const nombres = GIROS.map((g) => g.nombre);
    expect(new Set(nombres).size).toBe(nombres.length);
    expect(nombres.every((n) => n.length <= 40)).toBe(true);
  });
});
