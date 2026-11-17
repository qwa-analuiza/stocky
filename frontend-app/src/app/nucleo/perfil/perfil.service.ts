import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Usuario } from '../autenticacao/autenticacao.modelos';
import { AutenticacaoService } from '../autenticacao/autenticacao.service';

const URL_PERFIL = `${environment.apiUrl}/perfil`;

export interface DadosPerfil {
  nome: string;
  nomeNegocio: string;
  email: string;
}

export interface DadosNovaSenha {
  senhaAtual: string;
  novaSenha: string;
}

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private readonly http = inject(HttpClient);
  private readonly autenticacao = inject(AutenticacaoService);

  buscar(): Observable<Usuario> {
    return this.http.get<Usuario>(URL_PERFIL).pipe(tap((usuario) => this.autenticacao.atualizarUsuario(usuario)));
  }

  atualizar(dados: DadosPerfil): Observable<Usuario> {
    return this.http.put<Usuario>(URL_PERFIL, dados).pipe(tap((usuario) => this.autenticacao.atualizarUsuario(usuario)));
  }

  alterarSenha(dados: DadosNovaSenha): Observable<void> {
    return this.http.put<void>(`${URL_PERFIL}/senha`, dados);
  }
}
