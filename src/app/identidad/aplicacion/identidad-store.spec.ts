import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Sesion } from '../dominio/modelo/sesion.entidad';
import { IdentidadStore } from './identidad-store';

const CLAVE_SESION = 'bodega.sesion';

const vendedor: Sesion = { id: 2, usuario: 'pepe', rol: 'VENDEDOR', tiendaId: 1, token: 'token-vendedor' };

function crearStore(): { store: IdentidadStore; http: HttpTestingController } {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
  });
  return { store: TestBed.inject(IdentidadStore), http: TestBed.inject(HttpTestingController) };
}

describe('IdentidadStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('sin sesión guardada no hay usuario autenticado', () => {
    const { store } = crearStore();
    expect(store.autenticado()).toBe(false);
    expect(store.token()).toBeNull();
    expect(store.rol()).toBeNull();
  });

  it('recupera la sesión guardada en el navegador al recargar', () => {
    localStorage.setItem(CLAVE_SESION, JSON.stringify(vendedor));
    const { store } = crearStore();
    expect(store.autenticado()).toBe(true);
    expect(store.rol()).toBe('VENDEDOR');
    expect(store.token()).toBe('token-vendedor');
  });

  it('el inicio de sesión del personal guarda la sesión y la persiste', () => {
    const { store, http } = crearStore();
    store.iniciarSesionPersonal('pepe', 'pepe123').subscribe();
    const solicitud = http.expectOne((r) => r.url.endsWith('/autenticacion/iniciar-sesion'));
    expect(solicitud.request.method).toBe('POST');
    expect(solicitud.request.body).toEqual({ usuario: 'pepe', clave: 'pepe123' });
    solicitud.flush(vendedor);

    expect(store.autenticado()).toBe(true);
    expect(JSON.parse(localStorage.getItem(CLAVE_SESION) ?? 'null')).toEqual(vendedor);
    http.verify();
  });

  it('el cliente conserva el identificador de URL de su tienda', () => {
    const { store, http } = crearStore();
    const cliente: Sesion = { id: 9, usuario: '1:45871236', rol: 'CLIENTE', tiendaId: 1, token: 'token-cliente' };
    store.iniciarSesionCliente(1, 'tiendita-don-pepe', '45871236', '123456').subscribe();
    http.expectOne((r) => r.url.endsWith('/autenticacion/cliente')).flush(cliente);

    expect(store.sesion()?.slug).toBe('tiendita-don-pepe');
    expect(store.rutaInicio()).toBe('/t/tiendita-don-pepe/mi-cuenta');
    http.verify();
  });

  it('cada rol entra a su pantalla de inicio', () => {
    localStorage.setItem(CLAVE_SESION, JSON.stringify({ ...vendedor, rol: 'ADMIN_SISTEMA' }));
    expect(crearStore().store.rutaInicio()).toBe('/admin/tiendas');
    TestBed.resetTestingModule();
    localStorage.setItem(CLAVE_SESION, JSON.stringify(vendedor));
    expect(crearStore().store.rutaInicio()).toBe('/vendedor/panel');
    TestBed.resetTestingModule();
    localStorage.clear();
    expect(crearStore().store.rutaInicio()).toBe('/');
  });

  it('cerrar sesión limpia el navegador y lleva al ingreso del personal', () => {
    localStorage.setItem(CLAVE_SESION, JSON.stringify(vendedor));
    const { store } = crearStore();
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    store.cerrarSesion();
    expect(store.autenticado()).toBe(false);
    expect(localStorage.getItem(CLAVE_SESION)).toBeNull();
    expect(navegar).toHaveBeenCalledWith(['/ingresar']);
  });
});
