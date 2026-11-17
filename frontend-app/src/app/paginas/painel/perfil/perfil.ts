import { Component, WritableSignal, computed, inject, signal } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Alerta } from '../../../compartilhado/componentes/alerta';
import { BotaoVerSenha } from '../../../compartilhado/componentes/botao-ver-senha';
import { Icone } from '../../../compartilhado/componentes/icone';
import { aplicarErrosDoServidor, campoInvalido } from '../../../compartilhado/formularios/validacao';
import { AutenticacaoService } from '../../../nucleo/autenticacao/autenticacao.service';
import { errosPorCampo, mensagemDeErro } from '../../../nucleo/http/erro-api';
import { PerfilService } from '../../../nucleo/perfil/perfil.service';

type CampoDados = 'nome' | 'nomeNegocio' | 'email';
type CampoSenha = 'senhaAtual' | 'novaSenha' | 'confirmacao';

const OBRIGATORIO: Record<CampoDados | CampoSenha, string> = {
  nome: 'Informe seu nome',
  nomeNegocio: 'Informe o nome do seu negócio',
  email: 'Informe seu e-mail',
  senhaAtual: 'Informe sua senha atual',
  novaSenha: 'Crie uma nova senha',
  confirmacao: 'Repita a nova senha',
};

/** Perfil: dados da conta e troca de senha. */
@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule, Alerta, BotaoVerSenha, Icone],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
  private readonly construtor = inject(NonNullableFormBuilder);
  private readonly perfilService = inject(PerfilService);
  protected readonly autenticacao = inject(AutenticacaoService);

  protected readonly usuario = this.autenticacao.usuario;
  protected readonly inicial = computed(() => this.usuario()?.nome.trim().charAt(0).toUpperCase() ?? '');

  // ---------- Dados da conta ----------
  protected readonly dados = this.construtor.group({
    nome: [this.usuario()?.nome ?? '', [Validators.required, Validators.maxLength(80)]],
    nomeNegocio: [this.usuario()?.nomeNegocio ?? '', [Validators.required, Validators.maxLength(120)]],
    email: [this.usuario()?.email ?? '', [Validators.required, Validators.email, Validators.maxLength(160)]],
  });
  protected readonly salvandoDados = signal(false);
  protected readonly sucessoDados = signal(false);
  protected readonly erroDados = signal<string | null>(null);

  // ---------- Senha ----------
  protected readonly senha = this.construtor.group({
    senhaAtual: ['', [Validators.required]],
    novaSenha: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(72)]],
    confirmacao: ['', [Validators.required]],
  });
  protected readonly mostrarSenhas = signal(false);
  protected readonly salvandoSenha = signal(false);
  protected readonly sucessoSenha = signal(false);
  protected readonly erroSenha = signal<string | null>(null);

  constructor() {
    // Garante que a tela mostra o que está no servidor (ex.: alterado em outro aparelho)
    this.perfilService.buscar().subscribe({
      next: (usuario) => {
        if (!this.dados.dirty) this.dados.reset(usuario);
      },
      error: () => {
        /* mantém os dados salvos no navegador */
      },
    });
  }

  invalidoDados(campo: CampoDados): boolean {
    return campoInvalido(this.dados.controls[campo]);
  }

  invalidoSenha(campo: CampoSenha): boolean {
    return campoInvalido(this.senha.controls[campo]);
  }

  mensagem(campo: CampoDados | CampoSenha): string {
    const controle = campo in this.dados.controls
      ? this.dados.controls[campo as CampoDados]
      : this.senha.controls[campo as CampoSenha];
    if (controle.hasError('servidor')) return controle.getError('servidor');
    if (controle.hasError('required')) return OBRIGATORIO[campo];
    if (controle.hasError('email')) return 'Informe um e-mail válido';
    if (controle.hasError('minlength')) return 'A senha precisa ter pelo menos 6 caracteres';
    if (controle.hasError('diferente')) return 'As senhas não são iguais';
    if (controle.hasError('maxlength')) return 'Texto muito longo';
    return '';
  }

  salvarDados(): void {
    this.sucessoDados.set(false);
    if (this.dados.invalid) {
      this.dados.markAllAsTouched();
      return;
    }

    this.salvandoDados.set(true);
    this.erroDados.set(null);
    const { nome, nomeNegocio, email } = this.dados.getRawValue();

    this.perfilService.atualizar({ nome: nome.trim(), nomeNegocio: nomeNegocio.trim(), email: email.trim() }).subscribe({
      next: (usuario) => {
        this.dados.reset(usuario);
        this.salvandoDados.set(false);
        this.sucessoDados.set(true);
      },
      error: (erro) => {
        this.tratarErro(erro, this.dados, this.erroDados);
        this.salvandoDados.set(false);
      },
    });
  }

  salvarSenha(): void {
    this.sucessoSenha.set(false);
    const { senhaAtual, novaSenha, confirmacao } = this.senha.getRawValue();
    if (confirmacao && novaSenha !== confirmacao) {
      this.senha.controls.confirmacao.setErrors({ diferente: true });
    }
    if (this.senha.invalid) {
      this.senha.markAllAsTouched();
      return;
    }

    this.salvandoSenha.set(true);
    this.erroSenha.set(null);

    this.perfilService.alterarSenha({ senhaAtual, novaSenha }).subscribe({
      next: () => {
        this.senha.reset();
        this.salvandoSenha.set(false);
        this.sucessoSenha.set(true);
      },
      error: (erro) => {
        this.tratarErro(erro, this.senha, this.erroSenha);
        this.salvandoSenha.set(false);
      },
    });
  }

  /** Erro de um campo aparece embaixo dele; os demais, na caixa vermelha da seção. */
  private tratarErro(erro: unknown, formulario: FormGroup, mensagemGeral: WritableSignal<string | null>): void {
    const erros = errosPorCampo(erro);
    if (Object.keys(erros).length > 0) {
      aplicarErrosDoServidor(formulario, erros);
    } else {
      mensagemGeral.set(mensagemDeErro(erro));
    }
  }
}
