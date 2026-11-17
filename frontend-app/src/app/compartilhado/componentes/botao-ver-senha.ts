import { Component, model } from '@angular/core';

/** Botão de "olhinho" que mostra/esconde a senha. Uso: <app-botao-ver-senha [(visivel)]="mostrarSenha" /> */
@Component({
  selector: 'app-botao-ver-senha',
  template: `
    <button
      type="button"
      (click)="visivel.set(!visivel())"
      [attr.aria-label]="visivel() ? 'Esconder senha' : 'Mostrar senha'"
      [attr.aria-pressed]="visivel()"
    >
      @if (visivel()) {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.7 5.1A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-2.2 3.2M6.6 6.6C3.9 8.4 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6" />
          <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
          <line x1="2" y1="2" x2="22" y2="22" />
        </svg>
      } @else {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      }
    </button>
  `,
  styles: `
    :host {
      display: contents;
    }
    button {
      display: grid;
      place-items: center;
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      margin-right: -8px;
      padding: 0;
      border: 0;
      border-radius: 6px;
      background: transparent;
      color: #9d9bab;
      cursor: pointer;
    }
    button:hover {
      color: var(--texto-2);
      background: #f4f3f8;
    }
    button:focus-visible {
      outline: 2px solid var(--roxo);
    }
    svg {
      width: 17px;
      height: 17px;
    }
  `,
})
export class BotaoVerSenha {
  readonly visivel = model(false);
}
