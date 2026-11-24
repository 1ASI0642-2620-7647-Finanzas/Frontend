import { DOCUMENT } from '@angular/common';
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
      <div class="marca"><img src="assets/marca/logo.svg" alt="" class="logo-app" /> Cuaderno de Fiado</div>
      @if (identidad.autenticado()) {
        <a mat-stroked-button [routerLink]="identidad.rutaInicio()">Ir a mi panel <mat-icon iconPositionEnd>arrow_forward</mat-icon></a>
      } @else {
        <a mat-stroked-button routerLink="/ingresar">Soy vendedor</a>
      }
    </header>

    <section class="heroe">
      <div class="heroe-texto">
        <span class="sobretitulo">Para negocios de barrio</span>
        <h1>El cuaderno de fiado de tu negocio, <em>ahora digital</em></h1>
        <p>
          Consulta tu deuda, tus cuotas y tu historial de compras. Elige tu negocio, ingresa con tu DNI y la clave que
          te dio el vendedor.
        </p>
        <button mat-flat-button type="button" (click)="irANegocios()">Elegir mi negocio <mat-icon iconPositionEnd>south</mat-icon></button>
      </div>
      <div class="heroe-foto" aria-hidden="true"></div>
    </section>

    <section class="directorio" id="negocios">
      <div class="directorio-cabecera">
        <span class="sobretitulo">Directorio</span>
        <h2>Elige tu negocio</h2>
      </div>
      @if (error()) {
        <div class="aviso-error">{{ error() }}</div>
      }
      <ol class="tiendas">
        @for (tienda of tiendas(); track tienda.id; let i = $index) {
          <li>
            <a class="tienda" [routerLink]="['/t', tienda.slug]">
              <span class="numero">{{ i + 1 < 10 ? '0' : '' }}{{ i + 1 }}</span>
              <div class="logo"><app-imagen carpeta="logos" [src]="tienda.logo" icono="storefront" [alt]="tienda.nombre" /></div>
              <div class="datos">
                <h3>{{ tienda.nombre }}</h3>
                <p class="texto-suave">
                  {{ tienda.direccion }}
                  @if (tienda.telefono) { · {{ tienda.telefono }} }
                </p>
              </div>
              <span class="giro sobretitulo">{{ giro(tienda) }}</span>
              <mat-icon class="flecha">arrow_forward</mat-icon>
            </a>
          </li>
        } @empty {
          @if (!error()) {
            <li class="vacio"><mat-icon>storefront</mat-icon><p>Aún no hay negocios registrados.</p></li>
          }
        }
      </ol>
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
      max-width: 1180px;
      margin: 0 auto;
      padding: 22px 24px;
    }
    .marca {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: var(--serif);
      font-size: 1.35rem;
      font-weight: 500;
      letter-spacing: -0.01em;
    }
    .logo-app {
      width: 32px;
      height: 32px;
      border-radius: 8px;
    }
    .heroe {
      max-width: 1180px;
      margin: 0 auto;
      padding: 40px 24px 72px;
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 56px;
      align-items: center;
    }
    .heroe-texto {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 22px;
    }
    .heroe h1 {
      font-size: clamp(2.4rem, 5.4vw, 4.4rem);
      line-height: 1.04;
      letter-spacing: -0.03em;
    }
    .heroe h1 em {
      color: var(--verde);
      font-style: italic;
    }
    .heroe p {
      margin: 0;
      max-width: 480px;
      font-size: 1.08rem;
      line-height: 1.6;
      color: var(--texto-suave);
    }
    .heroe-foto {
      aspect-ratio: 4 / 5;
      border-radius: 999px 999px 16px 16px;
      background:
        linear-gradient(180deg, rgba(23, 20, 15, 0) 55%, rgba(23, 20, 15, 0.28)),
        url('/assets/fondos/banner-panaderia.jpg') 38% center / cover no-repeat,
        #e9e4d6;
    }
    .directorio {
      max-width: 1180px;
      margin: 0 auto;
      padding: 56px 24px 96px;
      border-top: 1px solid var(--borde);
    }
    .directorio-cabecera {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 28px;
    }
    .directorio-cabecera h2 {
      font-size: clamp(1.8rem, 3.4vw, 2.6rem);
    }
    .tiendas {
      list-style: none;
      margin: 0;
      padding: 0;
      border-top: 1px solid var(--texto);
    }
    .tiendas li {
      border-bottom: 1px solid var(--borde);
    }
    .tienda {
      display: grid;
      grid-template-columns: 40px 56px 1fr auto 24px;
      gap: 20px;
      align-items: center;
      padding: 20px 8px;
      text-decoration: none;
      color: inherit;
      transition: background 0.2s, padding 0.2s;
    }
    .tienda:hover {
      background: #f3efe5;
      padding-left: 16px;
    }
    .tienda:hover .flecha {
      transform: translateX(4px);
      color: var(--verde);
    }
    .numero {
      font-family: var(--serif);
      font-size: 1.1rem;
      color: var(--texto-suave);
    }
    .logo {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      overflow: hidden;
      border: 1px solid var(--borde);
    }
    .datos h3 {
      font-size: 1.45rem;
      margin-bottom: 2px;
    }
    .datos p {
      margin: 0;
      font-size: 0.9rem;
    }
    .flecha {
      color: var(--texto-suave);
      transition: transform 0.2s, color 0.2s;
    }
    .vacio {
      list-style: none;
      text-align: center;
      padding: 40px 0;
      color: var(--texto-suave);
    }
    .cabecera a {
      flex: none;
      white-space: nowrap;
    }
    @media (max-width: 860px) {
      .marca {
        font-size: 1.1rem;
        white-space: nowrap;
      }
      .cabecera {
        padding: 16px;
        gap: 8px;
      }
      .heroe {
        grid-template-columns: 1fr;
        gap: 36px;
        padding-top: 16px;
      }
      .heroe-foto {
        aspect-ratio: 16 / 11;
        border-radius: 200px 200px 14px 14px;
      }
      .tienda {
        grid-template-columns: 56px 1fr 24px;
        gap: 14px;
      }
      .numero,
      .giro {
        display: none;
      }
    }
  `,
})
export class Portada {
  protected readonly identidad = inject(IdentidadStore);
  private readonly api = inject(TiendasApi);
  private readonly documento = inject(DOCUMENT);

  protected readonly tiendas = signal<TiendaPublica[]>([]);
  protected readonly error = signal<string | null>(null);
  protected readonly giro = (t: TiendaPublica): string => nombreDeGiro(t.giro);

  /** Baja suavemente hasta el directorio. Un enlace «#negocios» no sirve: con `<base href="/">` recarga la ruta. */
  protected irANegocios(): void {
    this.documento.getElementById('negocios')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  constructor() {
    this.api.listarPublicas().subscribe({
      next: (t) => this.tiendas.set(t),
      error: (e) => this.error.set(mensajeDeError(e)),
    });
  }
}
