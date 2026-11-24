import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ImagenFallback } from '../../../compartido/presentacion/componentes/imagen-fallback';
import { IdentidadStore } from '../../../identidad/aplicacion/identidad-store';
import { TiendaActualStore } from '../../aplicacion/tienda-actual-store';
import { bannerDeGiro, etiquetasDeOferta, nombreDeGiro } from '../../dominio/modelo/giro';

/**
 * Estructura de las páginas públicas de una bodega (/t/:slug): encabezado con sus datos y navegación
 * entre el catálogo y la cuenta del cliente.
 */
@Component({
  selector: 'app-layout-tienda',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatButtonModule, MatIconModule, ImagenFallback],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="cabecera">
      <div class="contenido">
        <a routerLink="/" class="volver" aria-label="Todos los negocios"><mat-icon>arrow_back</mat-icon></a>
        @if (tienda(); as t) {
          <div class="logo"><app-imagen carpeta="logos" [src]="t.logo" icono="storefront" [alt]="t.nombre" /></div>
          <div class="datos">
            <h1>{{ t.nombre }} <span class="etiqueta-estado neutra giro">{{ giro() }}</span></h1>
            <span class="texto-suave">
              {{ t.direccion }}
              @if (t.telefono) { · <mat-icon inline>call</mat-icon> {{ t.telefono }} }
            </span>
          </div>
        }
        <span class="espaciador"></span>
        <nav>
          <a mat-button [routerLink]="['/t', slug()]" routerLinkActive="activo" [routerLinkActiveOptions]="{ exact: true }">
            <mat-icon>storefront</mat-icon> {{ etiquetas().plural }}
          </a>
          @if (esClienteDeEstaTienda()) {
            <a mat-button [routerLink]="['/t', slug(), 'mi-cuenta']" routerLinkActive="activo">
              <mat-icon>receipt_long</mat-icon> Mi cuenta
            </a>
            <button mat-stroked-button (click)="salir()"><mat-icon>logout</mat-icon> Salir</button>
          } @else {
            <a mat-flat-button color="primary" [routerLink]="['/t', slug(), 'ingresar']">
              <mat-icon>lock_open</mat-icon> Consultar mi cuenta
            </a>
          }
        </nav>
      </div>
    </header>

    @if (tienda(); as t) {
      <section class="banner" [style.background-image]="fondoBanner()">
        <div class="banner-texto">
          <span class="banner-giro">{{ giro() }}</span>
          <h2>{{ t.nombre }}</h2>
          <p>{{ etiquetas().plural }} a precio de contado y a crédito. Consulta tu deuda con tu DNI.</p>
        </div>
      </section>
    }

    @if (error()) {
      <div class="pagina"><div class="aviso-error">{{ error() }}</div></div>
    } @else if (tienda()) {
      <router-outlet />
    }
  `,
  styles: `
    .cabecera {
      background: #fff;
      border-bottom: 1px solid var(--borde);
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .contenido {
      max-width: 1240px;
      margin: 0 auto;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .volver {
      color: var(--texto-suave);
      display: grid;
      place-items: center;
    }
    .logo {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      overflow: hidden;
      flex: none;
    }
    .datos h1 {
      font-size: 1.15rem;
    }
    .datos span {
      font-size: 0.85rem;
    }
    .datos .giro {
      font-size: 0.7rem;
      vertical-align: middle;
      margin-left: 4px;
    }
    nav {
      display: flex;
      gap: 6px;
      align-items: center;
      flex-wrap: wrap;
    }
    a.activo {
      background: var(--verde-suave);
    }
    .banner {
      background-color: #17402d;
      background-size: cover;
      background-position: center;
      color: #fff;
      padding: 34px 20px;
    }
    .banner-texto {
      max-width: 1240px;
      margin: 0 auto;
    }
    .banner-texto h2 {
      font-size: clamp(1.4rem, 3.5vw, 2.1rem);
      margin: 6px 0;
    }
    .banner-texto p {
      margin: 0;
      color: #e6f2eb;
    }
    .banner-giro {
      display: inline-block;
      background: rgba(255, 255, 255, 0.18);
      border: 1px solid rgba(255, 255, 255, 0.4);
      border-radius: 999px;
      padding: 2px 12px;
      font-size: 0.8rem;
      font-weight: 700;
    }
  `,
})
export class LayoutTienda {
  readonly slug = input.required<string>();

  private readonly store = inject(TiendaActualStore);
  private readonly identidad = inject(IdentidadStore);

  protected readonly tienda = this.store.tienda;
  protected readonly error = this.store.error;
  protected readonly giro = computed(() => nombreDeGiro(this.tienda()?.giro));
  protected readonly etiquetas = computed(() => etiquetasDeOferta(this.tienda()?.giro));
  protected readonly fondoBanner = computed(
    () =>
      `linear-gradient(90deg, rgba(23, 64, 45, 0.88), rgba(23, 64, 45, 0.45)), url(/assets/fondos/banner-${bannerDeGiro(this.tienda()?.giro)}.jpg)`,
  );
  protected readonly esClienteDeEstaTienda = computed(() => {
    const s = this.identidad.sesion();
    return s?.rol === 'CLIENTE' && s.slug === this.slug();
  });

  constructor() {
    effect(() => this.store.cargar(this.slug()));
  }

  protected salir(): void {
    this.identidad.cerrarSesion();
  }
}
