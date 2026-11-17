import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { DadosCadastro, DadosLogin, Sessao, Usuario } from './autenticacao.modelos';
import {
  atualizarUsuarioSalvo,
  lerToken,
  lerUsuarioSalvo,
  limparSessao,
  salvarSessao,
} from './sessao-armazenada';

export const URL_AUTENTICACAO = `${environment.apiUrl}/auth`;

@Injectable({ providedIn: 'root' })
export class AutenticacaoService {
  private readonly http = inject(HttpClient);
  private readonly roteador = inject(Router);

  private readonly usuarioAtual = signal<Usuario | null>(lerUsuarioSalvo());

  /** Usuário logado (ou null). Nas telas: autenticacao.usuario()?.nome */
  readonly usuario = this.usuarioAtual.asReadonly();
  readonly logado = computed(() => this.usuarioAtual() !== null);

  entrar(dados: DadosLogin): Observable<Sessao> {
    return this.http
      .post<Sessao>(`${URL_AUTENTICACAO}/login`, dados)
      .pipe(tap((sessao) => this.iniciarSessao(sessao)));
  }

  cadastrar(dados: DadosCadastro): Observable<Sessao> {
    return this.http
      .post<Sessao>(`${URL_AUTENTICACAO}/cadastro`, dados)
      .pipe(tap((sessao) => this.iniciarSessao(sessao)));
  }

  sair(): void {
    limparSessao();
    this.usuarioAtual.set(null);
    this.roteador.navigateByUrl('/login');
  }

  /** Mostra na hora o nome/negócio novos em todas as telas depois de editar o perfil. */
  atualizarUsuario(usuario: Usuario): void {
    atualizarUsuarioSalvo(usuario);
    this.usuarioAtual.set(usuario);
  }

  get token(): string | null {
    return lerToken();
  }

  private iniciarSessao(sessao: Sessao): void {
    salvarSessao(sessao);
    this.usuarioAtual.set(sessao.usuario);
  }
}
