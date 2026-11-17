import { CurrencyPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';

/**
 * Barra que mostra de onde vem o valor de venda:
 *   [ investido (roxo) | lucro (verde) ]  — tamanho total = valor de venda.
 * Se a venda for menor que o investido, mostra o prejuízo (vermelho).
 * "escala" permite comparar várias barras na mesma régua (ex.: maior venda da lista).
 */
@Component({
  selector: 'app-barra-investido-venda',
  imports: [CurrencyPipe],
  template: `
    <div class="trilho" role="img" [attr.aria-label]="descricao()">
      <span
        class="segmento investido"
        [style.width.%]="partes().investido"
        [title]="'Investido: ' + (investido() | currency)"
      ></span>
      @if (partes().lucro > 0) {
        <span
          class="segmento"
          [class.lucro]="!prejuizo()"
          [class.prejuizo]="prejuizo()"
          [style.width.%]="partes().lucro"
          [title]="(prejuizo() ? 'Prejuízo: ' : 'Lucro: ') + (lucroAbsoluto() | currency)"
        ></span>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .trilho {
      display: flex;
      gap: 2px; /* espaço entre os segmentos */
      height: var(--altura-barra, 12px);
      border-radius: 4px;
      background: #f1f0f6;
      overflow: hidden;
    }
    .segmento {
      min-width: 0;
      height: 100%;
      transition: width 0.4s ease;
    }
    .segmento:first-child {
      border-radius: 4px 0 0 4px;
    }
    .segmento:last-child {
      border-radius: 0 4px 4px 0;
    }
    .segmento:only-child {
      border-radius: 4px;
    }
    .investido {
      background: var(--roxo);
    }
    .lucro {
      background: var(--verde);
    }
    .prejuizo {
      background: var(--erro);
    }
    @media (prefers-reduced-motion: reduce) {
      .segmento {
        transition: none;
      }
    }
  `,
})
export class BarraInvestidoVenda {
  readonly investido = input.required<number>();
  readonly venda = input.required<number>();
  /** Valor que ocupa 100% da largura. Padrão: o próprio tamanho desta barra. */
  readonly escala = input<number | null>(null);

  protected readonly prejuizo = computed(() => this.venda() < this.investido());
  protected readonly lucroAbsoluto = computed(() => Math.abs(this.venda() - this.investido()));

  protected readonly partes = computed(() => {
    const investido = this.investido();
    const venda = this.venda();
    const maior = Math.max(investido, venda);
    const escala = this.escala() || maior || 1;

    // com lucro: roxo = investido, verde = o que sobra até a venda
    // com prejuízo: roxo = o que a venda recupera, vermelho = o que se perde
    const base = this.prejuizo() ? venda : investido;
    return {
      investido: (base / escala) * 100,
      lucro: (this.lucroAbsoluto() / escala) * 100,
    };
  });

  protected readonly descricao = computed(() => {
    const real = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    return this.prejuizo()
      ? `Investido ${real(this.investido())}, venda ${real(this.venda())}, prejuízo de ${real(this.lucroAbsoluto())}`
      : `Investido ${real(this.investido())}, venda ${real(this.venda())}, lucro de ${real(this.lucroAbsoluto())}`;
  });
}
