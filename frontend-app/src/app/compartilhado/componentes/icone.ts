import { Component, input } from '@angular/core';

export type NomeIcone =
  | 'visao-geral'
  | 'caixa'
  | 'moeda'
  | 'tendencia'
  | 'relogio'
  | 'alerta'
  | 'mais'
  | 'editar'
  | 'lixeira'
  | 'busca'
  | 'imagem'
  | 'voltar'
  | 'sair'
  | 'seta-direita'
  | 'check'
  | 'usuario'
  | 'cadeado';

/** Ícones de traço (mesmo estilo em todo o sistema). Uso: <app-icone nome="caixa" /> */
@Component({
  selector: 'app-icone',
  host: { 'aria-hidden': 'true' },
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      @switch (nome()) {
        @case ('visao-geral') {
          <rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" />
        }
        @case ('caixa') {
          <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" /><path d="m3 8 9 5 9-5" /><path d="M12 13v8" />
        }
        @case ('moeda') {
          <circle cx="12" cy="12" r="9" /><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .9-3 2.2 0 3 6 1.6 6 4.6 0 1.3-1.3 2.2-3 2.2-1.4 0-2.6-.6-3.1-1.6" /><path d="M12 6.5V8m0 8v1.5" />
        }
        @case ('tendencia') {
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
        }
        @case ('relogio') {
          <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 14" />
        }
        @case ('alerta') {
          <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        }
        @case ('mais') {
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        }
        @case ('editar') {
          <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        }
        @case ('lixeira') {
          <polyline points="3 6 5 6 21 6" /><path d="M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6m4-6v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        }
        @case ('busca') {
          <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.6" y2="16.6" />
        }
        @case ('imagem') {
          <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
        }
        @case ('voltar') {
          <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
        }
        @case ('sair') {
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
        }
        @case ('seta-direita') {
          <polyline points="9 18 15 12 9 6" />
        }
        @case ('check') {
          <polyline points="20 6 9 17 4 12" />
        }
        @case ('usuario') {
          <circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" />
        }
        @case ('cadeado') {
          <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      width: 18px;
      height: 18px;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `,
})
export class Icone {
  readonly nome = input.required<NomeIcone>();
}
