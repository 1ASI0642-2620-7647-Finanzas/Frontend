import { describe, expect, it } from 'vitest';
import { rutaDeImagen } from './imagen-fallback';

describe('rutaDeImagen', () => {
  it('un nombre de archivo se busca en la carpeta indicada de assets', () => {
    expect(rutaDeImagen('productos', 'arroz-extra.jpg')).toBe('assets/productos/arroz-extra.jpg');
    expect(rutaDeImagen('logos', ' logo-don-pepe.png ')).toBe('assets/logos/logo-don-pepe.png');
  });

  it('una dirección web https se usa tal cual', () => {
    expect(rutaDeImagen('productos', 'https://ejemplo.com/foto.jpg')).toBe('https://ejemplo.com/foto.jpg');
    expect(rutaDeImagen('productos', 'HTTP://ejemplo.com/foto.jpg')).toBe('HTTP://ejemplo.com/foto.jpg');
  });

  it('sin valor no hay imagen (se muestra el ícono)', () => {
    expect(rutaDeImagen('productos', null)).toBeNull();
    expect(rutaDeImagen('productos', undefined)).toBeNull();
    expect(rutaDeImagen('productos', '   ')).toBeNull();
  });

  it('no convierte en dirección válida otros esquemas peligrosos', () => {
    expect(rutaDeImagen('productos', 'javascript:alert(1)')).toBe('assets/productos/javascript:alert(1)');
  });

  it('sin carpeta, un valor relativo se deja como está', () => {
    expect(rutaDeImagen(null, 'assets/logos/x.png')).toBe('assets/logos/x.png');
  });
});
