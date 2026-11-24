import { ChangeDetectionStrategy, Component, computed, effect, input, signal, untracked } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** Dirección final de una imagen: una URL https se usa tal cual; un nombre de archivo se busca en assets/<carpeta>. */
export function rutaDeImagen(carpeta: string | null | undefined, valor: string | null | undefined): string | null {
  const v = valor?.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  return carpeta ? `assets/${carpeta}/${v}` : v;
}

/**
 * Muestra una imagen de la carpeta assets (o una dirección web https://…); si no existe, muestra un ícono en su lugar.
 * Con `carpeta`, `src` es solo el nombre del archivo (por ejemplo carpeta="productos" y src="arroz-extra.jpg").
 */
@Component({
  selector: 'app-imagen',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ruta() && !fallo()) {
      <img [src]="ruta()" [alt]="alt()" (error)="fallo.set(true)" loading="lazy" />
    } @else {
      <div class="marcador"><mat-icon>{{ icono() }}</mat-icon></div>
    }
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .marcador {
      width: 100%;
      height: 100%;
      display: grid;
      place-items: center;
      background: linear-gradient(135deg, #efebe0, #e5ede8);
      color: #6f8f7d;
    }
    .marcador mat-icon {
      font-size: 42px;
      width: 42px;
      height: 42px;
    }
  `,
})
export class ImagenFallback {
  readonly src = input<string | null | undefined>(null);
  readonly carpeta = input<string | null>(null);
  readonly alt = input('');
  readonly icono = input('shopping_basket');
  protected readonly fallo = signal(false);
  protected readonly ruta = computed(() => rutaDeImagen(this.carpeta(), this.src()));

  constructor() {
    effect(() => {
      this.ruta();
      untracked(() => this.fallo.set(false));
    });
  }
}
