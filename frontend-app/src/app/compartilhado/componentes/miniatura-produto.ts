import { Component, computed, input } from '@angular/core';

/** Foto do produto, ou a inicial do nome quando não há foto. */
@Component({
  selector: 'app-miniatura-produto',
  template: `
    @if (imagem()) {
      <img [src]="imagem()" [alt]="nome()" loading="lazy" />
    } @else {
      <span aria-hidden="true">{{ inicial() }}</span>
    }
  `,
  styles: `
    :host {
      display: grid;
      place-items: center;
      flex-shrink: 0;
      width: 44px;
      height: 44px;
      overflow: hidden;
      border-radius: 10px;
      background: var(--roxo-suave);
      color: var(--roxo);
      font-weight: 700;
      font-size: 16px;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `,
})
export class MiniaturaProduto {
  readonly nome = input.required<string>();
  readonly imagem = input<string | null>(null);

  protected readonly inicial = computed(() => this.nome().trim().charAt(0).toUpperCase() || '?');
}
