import { Component, input } from '@angular/core';

import { Icone, NomeIcone } from './icone';

export type TomIndicador = 'roxo' | 'verde' | 'amarelo' | 'vermelho';

/** Cartão de número em destaque do painel. O valor e o detalhe chegam por <ng-content>. */
@Component({
  selector: 'app-indicador',
  imports: [Icone],
  host: { '[class]': 'tom()' },
  template: `
    <div class="topo">
      <span class="rotulo">{{ rotulo() }}</span>
      <span class="icone"><app-icone [nome]="icone()" /></span>
    </div>
    <strong class="valor"><ng-content select="[valor]" /></strong>
    <span class="detalhe"><ng-content select="[detalhe]" /></span>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
      padding: 20px;
      border: 1px solid var(--borda-suave);
      border-radius: var(--raio-cartao);
      background: var(--superficie);
      box-shadow: var(--sombra-cartao);
    }
    .topo {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 6px;
    }
    .rotulo {
      color: var(--texto-2);
      font-size: 12px;
      font-weight: 500;
    }
    .icone {
      display: grid;
      place-items: center;
      flex-shrink: 0;
      width: 38px;
      height: 38px;
      border-radius: 10px;
    }
    .valor {
      font-size: clamp(22px, 2.4vw, 27px);
      font-weight: 600;
      line-height: 1.15;
      letter-spacing: -0.03em;
      overflow-wrap: anywhere;
    }
    .detalhe {
      color: var(--texto-2);
      font-size: 11.5px;
    }
    :host(.roxo) .icone {
      background: var(--roxo-suave);
      color: var(--roxo);
    }
    :host(.verde) .icone {
      background: var(--verde-fundo);
      color: var(--verde-texto);
    }
    :host(.amarelo) .icone {
      background: var(--amarelo-fundo);
      color: var(--amarelo-texto);
    }
    :host(.vermelho) .icone {
      background: var(--erro-fundo);
      color: var(--erro-texto);
    }
  `,
})
export class Indicador {
  readonly rotulo = input.required<string>();
  readonly icone = input.required<NomeIcone>();
  readonly tom = input<TomIndicador>('roxo');
}
