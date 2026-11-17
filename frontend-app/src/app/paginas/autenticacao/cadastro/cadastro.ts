import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Alerta } from '../../../compartilhado/componentes/alerta';
import { BotaoVerSenha } from '../../../compartilhado/componentes/botao-ver-senha';
import { aplicarErrosDoServidor, campoInvalido } from '../../../compartilhado/formularios/validacao';
import { AutenticacaoService } from '../../../nucleo/autenticacao/autenticacao.service';
import { errosPorCampo, mensagemDeErro } from '../../../nucleo/http/erro-api';

type CampoCadastro = 'nome' | 'nomeNegocio' | 'email' | 'senha';

const MENSAGEM_OBRIGATORIO: Record<CampoCadastro, string> = {
  nome: 'Conte pra gente como podemos chamar você',
  nomeNegocio: 'Informe o nome do seu negócio',
  email: 'Informe seu e-mail',
  senha: 'Crie uma senha',
};

@Component({
  selector: 'app-cadastro',
  imports: [ReactiveFormsModule, RouterLink, Alerta, BotaoVerSenha],
  templateUrl: './cadastro.html',
  styleUrl: '../formulario-autenticacao.css',
})
export class Cadastro {
  private readonly construtor = inject(NonNullableFormBuilder);
  private readonly autenticacao = inject(AutenticacaoService);
  private readonly roteador = inject(Router);

  readonly mostrarSenha = signal(false);
  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);

  readonly formulario = this.construtor.group({
    nome: ['', [Validators.required, Validators.maxLength(80)]],
    nomeNegocio: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(160)]],
    senha: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(72)]],
  });

  invalido(campo: CampoCadastro): boolean {
    return campoInvalido(this.formulario.controls[campo]);
  }

  /** Mensagem do primeiro erro do campo, em português. */
  mensagem(campo: CampoCadastro): string {
    const controle = this.formulario.controls[campo];
    if (controle.hasError('servidor')) return controle.getError('servidor');
    if (controle.hasError('required')) return MENSAGEM_OBRIGATORIO[campo];
    if (controle.hasError('email')) return 'Informe um e-mail válido';
    if (controle.hasError('minlength')) return 'A senha precisa ter pelo menos 6 caracteres';
    if (controle.hasError('maxlength')) return 'Texto muito longo';
    return '';
  }

  criarConta(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.carregando.set(true);
    this.erro.set(null);

    this.autenticacao.cadastrar(this.formulario.getRawValue()).subscribe({
      next: () => this.roteador.navigateByUrl('/painel'),
      error: (erro) => {
        // Erros de um campo específico aparecem embaixo do próprio campo
        const erros = errosPorCampo(erro);
        if (Object.keys(erros).length > 0) {
          aplicarErrosDoServidor(this.formulario, erros);
        } else {
          this.erro.set(mensagemDeErro(erro));
        }
        this.carregando.set(false);
      },
    });
  }
}
