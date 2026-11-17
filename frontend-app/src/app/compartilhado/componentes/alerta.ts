import { Component, input } from '@angular/core';

/**
 * Caixa de mensagem.
 * Erro:    <app-alerta>Mensagem</app-alerta>
 * Sucesso: <app-alerta tipo="sucesso">Mensagem</app-alerta>
 */
@Component({
  selector: 'app-alerta',
  host: {
    '[attr.role]': "tipo() === 'erro' ? 'alert' : 'status'",
    '[class.sucesso]': "tipo() === 'sucesso'",
  },
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      @if (tipo() === 'sucesso') {
        <circle cx="12" cy="12" r="10" />
        <polyline points="16 9.5 10.5 15 8 12.5" />
      } @else {
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      }
    </svg>
    <span><ng-content /></span>
  `,
  styles: `
    :host {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin: -4px 0 18px;
      padding: 11px 14px;
      border-radius: 8px;
      background: var(--erro-fundo);
      color: var(--erro-texto);
      font-size: 12px;
      line-height: 1.5;
    }
    :host(.sucesso) {
      background: var(--verde-fundo);
      color: var(--verde-texto);
    }
    svg {
      flex-shrink: 0;
      width: 16px;
      height: 16px;
      margin-top: 1px;
    }
    @media (max-width: 480px) {
      :host {
        font-size: 13px;
      }
    }
  `,
})
export class Alerta {
  readonly tipo = input<'erro' | 'sucesso'>('erro');
}
