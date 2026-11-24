import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';
import { mensajeDeError } from './base-api';

describe('mensajeDeError', () => {
  it('usa el mensaje y el detalle del API cuando existen', () => {
    const error = new HttpErrorResponse({
      status: 422,
      error: { codigo: 'REGLA_DE_NEGOCIO', mensaje: 'Límite de crédito excedido', detalle: 'Deuda 200.00 + compra 100.00 supera 250.00' },
    });
    expect(mensajeDeError(error)).toBe('Límite de crédito excedido. Deuda 200.00 + compra 100.00 supera 250.00');
  });

  it('usa solo el mensaje cuando no hay detalle', () => {
    const error = new HttpErrorResponse({ status: 409, error: { mensaje: 'El DNI ya existe' } });
    expect(mensajeDeError(error)).toBe('El DNI ya existe');
  });

  it('explica la falta de conexión, el rol insuficiente y el recurso inexistente', () => {
    expect(mensajeDeError(new HttpErrorResponse({ status: 0 }))).toContain('No hay conexión');
    expect(mensajeDeError(new HttpErrorResponse({ status: 403 }))).toBe('Su rol no permite esta operación.');
    expect(mensajeDeError(new HttpErrorResponse({ status: 404 }))).toBe('No se encontró el recurso solicitado.');
  });

  it('maneja errores que no son HTTP', () => {
    expect(mensajeDeError(new Error('falló algo'))).toBe('falló algo');
    expect(mensajeDeError('texto')).toBe('Ocurrió un error inesperado.');
  });
});
