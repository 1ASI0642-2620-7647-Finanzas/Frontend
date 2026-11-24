import { Injectable, computed, inject, signal } from '@angular/core';
import { TiendaPublica } from '../dominio/modelo/tienda.entidad';
import { etiquetasDeOferta } from '../dominio/modelo/giro';
import { TiendasApi } from '../infraestructura/tiendas-api';

/**
 * Tienda del vendedor que tiene la sesión iniciada (nombre, logo y giro). Se carga una sola vez y la comparten
 * la barra lateral y las pantallas de productos o servicios.
 */
@Injectable({ providedIn: 'root' })
export class MiTiendaStore {
  private readonly api = inject(TiendasApi);

  private readonly tiendaSenal = signal<TiendaPublica | null>(null);
  private cargada = false;

  readonly tienda = this.tiendaSenal.asReadonly();
  readonly giro = computed(() => this.tiendaSenal()?.giro ?? null);
  readonly etiquetas = computed(() => etiquetasDeOferta(this.giro()));

  cargar(): void {
    if (this.cargada) return;
    this.cargada = true;
    this.api.miTienda().subscribe({
      next: (t) => this.tiendaSenal.set(t),
      error: () => (this.cargada = false),
    });
  }

  /** Olvida la tienda al cerrar sesión, para que otro vendedor no vea datos ajenos. */
  limpiar(): void {
    this.cargada = false;
    this.tiendaSenal.set(null);
  }
}
