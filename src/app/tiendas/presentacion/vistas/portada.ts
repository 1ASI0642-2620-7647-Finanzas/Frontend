import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { mensajeDeError } from '../../../compartido/infraestructura/base-api';
import { ImagenFallback } from '../../../compartido/presentacion/componentes/imagen-fallback';
import { IdentidadStore } from '../../../identidad/aplicacion/identidad-store';
import { nombreDeGiro } from '../../dominio/modelo/giro';
import { TiendaPublica } from '../../dominio/modelo/tienda.entidad';
import { TiendasApi } from '../../infraestructura/tiendas-api';

/**
 * Página de inicio: presenta la aplicación y lista las bodegas para que el cliente entre a la suya.
 */
@Component({
  selector: 'app-portada',
  imports: [RouterLink, MatButtonModule, MatIconModule, ImagenFallback],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="cabecera">
      <div class="marca"><img src="assets/marca/logo.svg" alt="" class="logo-app" /> Cuaderno de Fiado Digital</div>
      @if (identidad.autenticado()) {
        <a mat-stroked-button [routerLink]="identidad.rutaInicio()"><mat-icon>arrow_forward</mat-icon> Ir a mi panel</a>
      } @else {
        <a mat-stroked-button routerLink="/ingresar"><mat-icon>badge</mat-icon> Soy vendedor</a>
      }
    </header>

    <section class="heroe">
      <h1>El cuaderno de fiado de tu negocio de barrio, ahora digital</h1>
      <p>
        Consulta tu deuda, tus cuotas y tu historial de compras. Elige tu negocio, ingresa con tu DNI y la clave que
        te dio el vendedor.
      </p>
    </section>

    <section class="pagina">
      <h2>Elige tu negocio</h2>
      @if (error()) {
        <div class="aviso-error">{{ error() }}</div>
      }
      <div class="tiendas">
        @for (tienda of tiendas(); track tienda.id) {
          <a class="tienda tarjeta" [routerLink]="['/t', tienda.slug]">
            <div class="logo"><app-imagen carpeta="logos" [src]="tienda.logo" icono="storefront" [alt]="tienda.nombre" /></div>
            <div>
              <h3>{{ tienda.nombre }}</h3>
              <span class="etiqueta-estado neutra">{{ giro(tienda) }}</span>
              <p class="texto-suave">{{ tienda.direccion }}</p>
              @if (tienda.telefono) { <p class="texto-suave"><mat-icon inline>call</mat-icon> {{ tienda.telefono }}</p> }
            </div>
            <mat-icon class="flecha">chevron_right</mat-icon>
          </a>
        } @empty {
          @if (!error()) {
            <div class="vacio tarjeta"><mat-icon>storefront</mat-icon><p>Aún no hay negocios registrados.</p></div>
          }
        }
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
    .cabecera {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 20px;
      background: #fff;
      border-bottom: 1px solid var(--borde);
    }
    .marca {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 800;
      color: var(--verde);
      font-size: 1.1rem;
    }
    .logo-app {
      width: 34px;
      height: 34px;
      border-radius: 9px;
    }
    .heroe {
      background:
        linear-gradient(135deg, rgba(23, 64, 45, 0.88), rgba(31, 111, 74, 0.8)),
        url('/assets/fondos/portada.jpg') center / cover no-repeat,
        #17402d;
      color: #fff;
      padding: 44px 20px;
      text-align: center;
    }
    .heroe h1 {
      max-width: 720px;
      margin: 0 auto 10px;
      font-size: clamp(1.5rem, 4vw, 2.3rem);
    }
    .heroe p {
      max-width: 620px;
      margin: 0 auto;
      color: #d5eadf;
      line-height: 1.5;
    }
    .tiendas {
      display: grid;
      gap: 14px;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      margin-top: 14px;
    }
    .tienda {
      display: flex;
      gap: 14px;
      align-items: center;
      text-decoration: none;
      color: inherit;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .tienda:hover {
      transform: translateY(-2px);
    }
    .tienda h3 {
      margin-bottom: 2px;
    }
    .tienda p {
      margin: 0;
    }
    .logo {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      overflow: hidden;
      flex: none;
    }
    .flecha {
      margin-left: auto;
      color: var(--texto-suave);
    }
  `,
})
export class Portada {
  protected readonly identidad = inject(IdentidadStore);
  private readonly api = inject(TiendasApi);

  protected readonly tiendas = signal<TiendaPublica[]>([]);
  protected readonly error = signal<string | null>(null);
  protected readonly giro = (t: TiendaPublica): string => nombreDeGiro(t.giro);

  constructor() {
    this.api.listarPublicas().subscribe({
      next: (t) => this.tiendas.set(t),
      error: (e) => this.error.set(mensajeDeError(e)),
    });
  }
}
