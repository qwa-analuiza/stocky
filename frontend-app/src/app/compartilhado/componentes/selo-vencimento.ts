import { Component, computed, input } from '@angular/core';

import { Icone } from './icone';

/** Até quantos dias antes o produto já aparece como "vence em breve". */
export const DIAS_DE_ALERTA = 30;

type Situacao = 'vencido' | 'alerta' | 'ok' | 'sem-data';

/** Etiqueta de validade: cor + ícone + texto (nunca só a cor). */
@Component({
  selector: 'app-selo-vencimento',
  imports: [Icone],
  host: { '[class]': 'situacao()' },
  template: `
    <app-icone [nome]="situacao() === 'ok' ? 'check' : situacao() === 'sem-data' ? 'relogio' : 'alerta'" />
    {{ texto() }}
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 9px;
      border-radius: 999px;
      font-size: 10.5px;
      font-weight: 600;
      white-space: nowrap;
    }
    app-icone {
      width: 12px;
      height: 12px;
    }
    :host(.vencido) {
      background: var(--erro-fundo);
      color: var(--erro-texto);
    }
    :host(.alerta) {
      background: var(--amarelo-fundo);
      color: var(--amarelo-texto);
    }
    :host(.ok) {
      background: var(--verde-fundo);
      color: var(--verde-texto);
    }
    :host(.sem-data) {
      background: #f1f0f6;
      color: var(--texto-2);
    }
  `,
})
export class SeloVencimento {
  /** Dias até vencer (negativo = vencido, null = não vence). */
  readonly dias = input.required<number | null>();

  protected readonly situacao = computed<Situacao>(() => {
    const dias = this.dias();
    if (dias === null) return 'sem-data';
    if (dias < 0) return 'vencido';
    return dias <= DIAS_DE_ALERTA ? 'alerta' : 'ok';
  });

  protected readonly texto = computed(() => {
    const dias = this.dias();
    if (dias === null) return 'Não vence';
    if (dias < -1) return `Venceu há ${-dias} dias`;
    if (dias === -1) return 'Venceu ontem';
    if (dias === 0) return 'Vence hoje';
    if (dias === 1) return 'Vence amanhã';
    return `Vence em ${dias} dias`;
  });
}
