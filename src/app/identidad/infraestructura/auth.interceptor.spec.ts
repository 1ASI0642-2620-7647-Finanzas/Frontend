import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IdentidadStore } from '../aplicacion/identidad-store';
import { Sesion } from '../dominio/modelo/sesion.entidad';
import { authInterceptor } from './auth.interceptor';

const CLAVE_SESION = 'bodega.sesion';
const vendedor: Sesion = { id: 2, usuario: 'pepe', rol: 'VENDEDOR', tiendaId: 1, token: 'token-vendedor' };

function preparar(sesion: Sesion | null): { http: HttpClient; control: HttpTestingController; store: IdentidadStore } {
  localStorage.clear();
  if (sesion) localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting(), provideRouter([])],
  });
  return {
    http: TestBed.inject(HttpClient),
    control: TestBed.inject(HttpTestingController),
    store: TestBed.inject(IdentidadStore),
  };
}

describe('authInterceptor', () => {
  beforeEach(() => localStorage.clear());

  it('agrega el token Bearer cuando hay sesión', () => {
    const { http, control } = preparar(vendedor);
    http.get('/api/v1/clientes').subscribe();
    const solicitud = control.expectOne('/api/v1/clientes');
    expect(solicitud.request.headers.get('Authorization')).toBe('Bearer token-vendedor');
    solicitud.flush([]);
  });

  it('no agrega encabezado de autorización sin sesión', () => {
    const { http, control } = preparar(null);
    http.get('/api/v1/publico/tiendas/tiendita-don-pepe').subscribe();
    const solicitud = control.expectOne('/api/v1/publico/tiendas/tiendita-don-pepe');
    expect(solicitud.request.headers.has('Authorization')).toBe(false);
    solicitud.flush({});
  });

  it('ante un 401 cierra la sesión y lleva al ingreso', () => {
    const { http, control, store } = preparar(vendedor);
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    http.get('/api/v1/clientes').subscribe({ error: () => undefined });
    control.expectOne('/api/v1/clientes').flush({ mensaje: 'Sesión vencida' }, { status: 401, statusText: 'Unauthorized' });

    expect(store.autenticado()).toBe(false);
    expect(navegar).toHaveBeenCalledWith(['/ingresar']);
  });

  it('un 401 del inicio de sesión (clave incorrecta) no expulsa a nadie ni redirige', () => {
    const { http, control, store } = preparar(vendedor);
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    http.post('/api/v1/autenticacion/iniciar-sesion', {}).subscribe({ error: () => undefined });
    control
      .expectOne('/api/v1/autenticacion/iniciar-sesion')
      .flush({ mensaje: 'Credenciales inválidas' }, { status: 401, statusText: 'Unauthorized' });

    expect(store.autenticado()).toBe(true);
    expect(navegar).not.toHaveBeenCalled();
  });

  it('un 403 no cierra la sesión (el rol no alcanza, pero sigue autenticado)', () => {
    const { http, control, store } = preparar(vendedor);
    http.get('/api/v1/reloj').subscribe({ error: () => undefined });
    control.expectOne('/api/v1/reloj').flush({}, { status: 403, statusText: 'Forbidden' });
    expect(store.autenticado()).toBe(true);
  });
});
