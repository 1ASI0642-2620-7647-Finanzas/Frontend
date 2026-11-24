import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { filter, map } from 'rxjs';
import { IdentidadStore } from '../../../identidad/aplicacion/identidad-store';
import { MiTiendaStore } from '../../../tiendas/aplicacion/mi-tienda-store';
import { nombreDeGiro } from '../../../tiendas/dominio/modelo/giro';
import { RelojSistema } from '../../../tiendas/dominio/modelo/tienda.entidad';
import { TiendasApi } from '../../../tiendas/infraestructura/tiendas-api';
import { FechaHoraPipe } from '../../infraestructura/formato';
import { ImagenFallback } from './imagen-fallback';

interface OpcionMenu {
  ruta: string;
  etiqueta: string;
  icono: string;
}

const MENU_VENDEDOR: OpcionMenu[] = [
  { ruta: '/vendedor/panel', etiqueta: 'Panel', icono: 'dashboard' },
  { ruta: '/vendedor/ventas/nueva', etiqueta: 'Nueva venta', icono: 'point_of_sale' },
  { ruta: '/vendedor/clientes', etiqueta: 'Clientes', icono: 'groups' },
  { ruta: '/vendedor/cobranzas', etiqueta: 'Cobranzas', icono: 'request_quote' },
  { ruta: '/vendedor/productos', etiqueta: 'Productos', icono: 'inventory_2' },
  { ruta: '/vendedor/reportes', etiqueta: 'Reportes', icono: 'bar_chart' },
  { ruta: '/vendedor/mensajes', etiqueta: 'WhatsApp', icono: 'chat' },
  { ruta: '/vendedor/auditoria', etiqueta: 'Auditoría', icono: 'fact_check' },
];

const MENU_ADMIN: OpcionMenu[] = [
  { ruta: '/admin/tiendas', etiqueta: 'Tiendas', icono: 'storefront' },
  { ruta: '/admin/reloj', etiqueta: 'Fecha del sistema', icono: 'schedule' },
  { ruta: '/admin/auditoria', etiqueta: 'Auditoría', icono: 'fact_check' },
];

/**
 * Estructura común para el vendedor y el administrador del sistema: barra superior, menú lateral por rol
 * y la fecha del sistema (útil en el modo demostración, donde puede ser simulada).
 */
@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    FechaHoraPipe,
    ImagenFallback,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-sidenav-container class="contenedor">
      <mat-sidenav
        #menu
        [mode]="movil() ? 'over' : 'side'"
        [opened]="!movil()"
        class="menu"
        [fixedInViewport]="movil()"
      >
        <div class="marca">
          @if (esVendedor()) {
            <div class="logo">
              <app-imagen carpeta="logos" [src]="logo()" icono="storefront" [alt]="nombreTienda()" />
            </div>
            <div>
              <strong>{{ nombreTienda() }}</strong>
              <small>{{ giro() }} · Cuaderno de fiado</small>
            </div>
          } @else {
            <div class="logo"><mat-icon>admin_panel_settings</mat-icon></div>
            <div>
              <strong>Administración</strong>
              <small>Cuaderno de fiado digital</small>
            </div>
          }
        </div>
        <mat-nav-list>
          @for (opcion of opciones(); track opcion.ruta) {
            <a
              mat-list-item
              [routerLink]="opcion.ruta"
              routerLinkActive="activo"
              (click)="movil() && menu.close()"
            >
              <mat-icon matListItemIcon>{{ opcion.icono }}</mat-icon>
              <span matListItemTitle>{{ opcion.etiqueta }}</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar class="barra">
          @if (movil()) {
            <button mat-icon-button (click)="menu.toggle()" aria-label="Abrir menú"><mat-icon>menu</mat-icon></button>
          }
          <span class="espaciador"></span>
          @if (reloj(); as r) {
            <span class="reloj" [class.simulado]="r.simulado" title="Fecha y hora del sistema">
              <mat-icon>{{ r.simulado ? 'science' : 'schedule' }}</mat-icon>
              {{ r.ahora | fechaHora }} @if (r.simulado) { <em>(simulada)</em> }
            </span>
          }
          <span class="usuario"><mat-icon>account_circle</mat-icon>{{ usuario() }}</span>
          <button mat-icon-button (click)="salir()" aria-label="Cerrar sesión" title="Cerrar sesión">
            <mat-icon>logout</mat-icon>
          </button>
        </mat-toolbar>
        <main><router-outlet /></main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    .contenedor {
      height: 100vh;
      background: var(--fondo);
    }
    .menu {
      width: 256px;
      background: #f3efe5;
      color: var(--texto);
      border-right: 1px solid var(--borde);
      border-radius: 0;
    }
    .marca {
      display: flex;
      gap: 12px;
      align-items: center;
      padding: 22px 18px 18px;
      margin-bottom: 6px;
      border-bottom: 1px solid var(--borde);
    }
    .marca strong {
      display: block;
      font-family: var(--serif);
      font-size: 1.15rem;
      font-weight: 500;
      line-height: 1.15;
    }
    .marca small {
      color: var(--texto-suave);
      font-size: 0.72rem;
    }
    .logo {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      overflow: hidden;
      flex: none;
      border: 1px solid var(--borde);
      background: #fff;
      display: grid;
      place-items: center;
    }
    mat-nav-list {
      padding: 10px 12px;
    }
    a.mat-mdc-list-item {
      --mdc-list-list-item-label-text-color: var(--texto-suave);
      --mat-list-list-item-leading-icon-color: var(--texto-suave);
      --mdc-list-list-item-hover-label-text-color: var(--texto);
      --mat-list-list-item-hover-state-layer-color: transparent;
      --mat-list-list-item-focus-state-layer-color: transparent;
      border-radius: 8px;
      margin-bottom: 2px;
    }
    a.mat-mdc-list-item:hover {
      background: #ebe6d9;
    }
    a.mat-mdc-list-item.activo {
      background: #fff;
      box-shadow: inset 3px 0 0 var(--verde);
      --mdc-list-list-item-label-text-color: var(--texto);
      --mat-list-list-item-leading-icon-color: var(--verde);
    }
    .barra {
      background: var(--superficie);
      border-bottom: 1px solid var(--borde);
      position: sticky;
      top: 0;
      z-index: 5;
      gap: 12px;
    }
    .reloj,
    .usuario {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--texto-suave);
    }
    .reloj mat-icon,
    .usuario mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    .reloj.simulado {
      color: #8a5a0d;
      background: var(--ambar-suave);
      padding: 4px 10px;
      border-radius: 999px;
    }
    @media (max-width: 640px) {
      .usuario {
        display: none;
      }
      .reloj {
        font-size: 0.75rem;
      }
    }
    main {
      min-height: calc(100vh - 64px);
    }
  `,
})
export class Shell {
  private readonly identidad = inject(IdentidadStore);
  private readonly router = inject(Router);
  private readonly tiendasApi = inject(TiendasApi);
  private readonly miTienda = inject(MiTiendaStore);

  protected readonly movil = toSignal(
    inject(BreakpointObserver)
      .observe('(max-width: 900px)')
      .pipe(map((estado) => estado.matches)),
    { initialValue: false },
  );

  protected readonly reloj = signal<RelojSistema | null>(null);
  protected readonly nombreTienda = computed(() => this.miTienda.tienda()?.nombre ?? 'Mi negocio');
  protected readonly logo = computed(() => this.miTienda.tienda()?.logo ?? null);
  protected readonly giro = computed(() => nombreDeGiro(this.miTienda.giro()));

  protected readonly usuario = computed(() => this.identidad.sesion()?.usuario ?? '');
  protected readonly esVendedor = computed(() => this.identidad.rol() === 'VENDEDOR');
  protected readonly opciones = computed(() =>
    this.esVendedor()
      ? MENU_VENDEDOR.map((o) => (o.ruta === '/vendedor/productos' ? { ...o, etiqueta: this.miTienda.etiquetas().plural } : o))
      : MENU_ADMIN,
  );

  constructor() {
    this.actualizarReloj();
    if (this.esVendedor()) this.miTienda.cargar();
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.actualizarReloj());
  }

  protected salir(): void {
    this.identidad.cerrarSesion();
  }

  private actualizarReloj(): void {
    this.tiendasApi.obtenerReloj().subscribe({ next: (r) => this.reloj.set(r), error: () => this.reloj.set(null) });
  }
}
