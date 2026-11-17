import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AutenticacaoService, URL_AUTENTICACAO } from './autenticacao.service';

const ROTAS_PUBLICAS = [`${URL_AUTENTICACAO}/login`, `${URL_AUTENTICACAO}/cadastro`];

/**
 * Coloca o token em toda chamada para a nossa API
 * e desloga automaticamente se o token vencer (401).
 */
export const interceptorDeAutenticacao: HttpInterceptorFn = (requisicao, proximo) => {
  const autenticacao = inject(AutenticacaoService);
  const token = autenticacao.token;
  const precisaDeToken =
    requisicao.url.startsWith(environment.apiUrl) && !ROTAS_PUBLICAS.includes(requisicao.url);

  const requisicaoFinal =
    token && precisaDeToken
      ? requisicao.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : requisicao;

  return proximo(requisicaoFinal).pipe(
    catchError((erro: unknown) => {
      if (precisaDeToken && erro instanceof HttpErrorResponse && erro.status === 401) {
        autenticacao.sair();
      }
      return throwError(() => erro);
    }),
  );
};
