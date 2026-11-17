import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Alerta } from '../../../compartilhado/componentes/alerta';
import { BotaoVerSenha } from '../../../compartilhado/componentes/botao-ver-senha';
import { campoInvalido } from '../../../compartilhado/formularios/validacao';
import { AutenticacaoService } from '../../../nucleo/autenticacao/autenticacao.service';
import { mensagemDeErro } from '../../../nucleo/http/erro-api';

type CampoLogin = 'email' | 'senha';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, Alerta, BotaoVerSenha],
  templateUrl: './login.html',
  styleUrl: '../formulario-autenticacao.css',
})
export class Login {
  private readonly construtor = inject(NonNullableFormBuilder);
  private readonly autenticacao = inject(AutenticacaoService);
  private readonly roteador = inject(Router);

  readonly mostrarSenha = signal(false);
  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);

  readonly formulario = this.construtor.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]],
  });

  invalido(campo: CampoLogin): boolean {
    return campoInvalido(this.formulario.controls[campo]);
  }

  mensagem(campo: CampoLogin): string {
    const controle = this.formulario.controls[campo];
    if (campo === 'senha') return 'Informe sua senha';
    return controle.hasError('required') ? 'Informe seu e-mail' : 'Informe um e-mail válido';
  }

  entrar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.carregando.set(true);
    this.erro.set(null);

    this.autenticacao.entrar(this.formulario.getRawValue()).subscribe({
      next: () => this.roteador.navigateByUrl('/painel'),
      error: (erro) => {
        this.erro.set(mensagemDeErro(erro));
        this.carregando.set(false);
      },
    });
  }
}
