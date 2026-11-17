import { Component, booleanAttribute, input } from '@angular/core';

/** Logo do Stockly (ícone "S" + nome). */
@Component({
  selector: 'app-marca',
  template: `
    <span class="icone" aria-hidden="true">S</span>
    <span class="nome">Stockly</span>
  `,
  host: { '[class.compacta]': 'compacta()' },
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 11px;
      color: #fff;
    }
    .icone {
      display: grid;
      place-items: center;
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: linear-gradient(145deg, #8a6cf8, #6a49f0);
      box-shadow: 0 0 22px rgba(113, 82, 243, 0.55);
      font-weight: 700;
      font-size: 17px;
    }
    .nome {
      font-weight: 700;
      font-size: 20px;
      letter-spacing: -0.03em;
    }
    :host(.compacta) {
      gap: 10px;
    }
    :host(.compacta) .icone {
      width: 34px;
      height: 34px;
      font-size: 15px;
    }
    :host(.compacta) .nome {
      font-size: 18px;
    }
    /* no celular a marca fica sempre compacta */
    @media (max-width: 480px) {
      .icone {
        width: 34px;
        height: 34px;
        font-size: 15px;
      }
      .nome {
        font-size: 18px;
      }
    }
  `,
})
export class Marca {
  /** Versão menor, para cabeçalhos e celular. */
  readonly compacta = input(false, { transform: booleanAttribute });
}
