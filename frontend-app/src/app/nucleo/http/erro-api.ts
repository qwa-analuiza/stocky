import { HttpErrorResponse } from '@angular/common/http';

/** Formato de erro devolvido pelo back-end (ErroApi.java). */
interface ErroApi {
  status: number;
  mensagem: string;
  campos?: Record<string, string>;
}

/** Transforma qualquer erro HTTP numa frase amigável para mostrar na tela. */
export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof HttpErrorResponse) {
    if (erro.status === 0) {
      return 'Não foi possível conectar ao servidor. Verifique sua internet e tente de novo.';
    }
    const corpo = erro.error as ErroApi | null;
    if (corpo?.mensagem) {
      return corpo.mensagem;
    }
  }
  return 'Algo deu errado. Tente novamente em instantes.';
}

/** Erros por campo vindos do back (ex.: { email: 'Informe um e-mail válido' }). */
export function errosPorCampo(erro: unknown): Record<string, string> {
  if (erro instanceof HttpErrorResponse && erro.status === 400) {
    return (erro.error as ErroApi | null)?.campos ?? {};
  }
  return {};
}
