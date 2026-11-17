import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AutenticacaoService } from './autenticacao.service';

/** Só deixa entrar quem está logado. */
export const somenteLogado: CanActivateFn = () =>
  inject(AutenticacaoService).logado() || inject(Router).createUrlTree(['/login']);

/** Quem já está logado não precisa ver login/cadastro: vai direto ao painel. */
export const somenteVisitante: CanActivateFn = () =>
  !inject(AutenticacaoService).logado() || inject(Router).createUrlTree(['/painel']);
