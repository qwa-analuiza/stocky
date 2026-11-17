import { HttpErrorResponse } from '@angular/common/http';

import { errosPorCampo, mensagemDeErro } from './erro-api';

describe('erro-api', () => {
  it('avisa quando o servidor está fora do ar', () => {
    const erro = new HttpErrorResponse({ status: 0 });
    expect(mensagemDeErro(erro)).toContain('Não foi possível conectar');
  });

  it('usa a mensagem enviada pelo back-end', () => {
    const erro = new HttpErrorResponse({ status: 401, error: { mensagem: 'E-mail ou senha incorretos.' } });
    expect(mensagemDeErro(erro)).toBe('E-mail ou senha incorretos.');
  });

  it('devolve os erros de cada campo quando a validação falha', () => {
    const erro = new HttpErrorResponse({
      status: 400,
      error: { mensagem: 'Verifique os campos destacados.', campos: { email: 'Informe um e-mail válido' } },
    });
    expect(errosPorCampo(erro)).toEqual({ email: 'Informe um e-mail válido' });
  });

  it('não inventa erros de campo para outros status', () => {
    expect(errosPorCampo(new HttpErrorResponse({ status: 500 }))).toEqual({});
  });
});
