package br.com.stockly.compartilhado.erro;

import org.springframework.http.HttpStatus;

/** Erro de regra de negócio com status HTTP e mensagem amigável para a tela. */
public abstract class NegocioException extends RuntimeException {

    private final HttpStatus status;

    protected NegocioException(HttpStatus status, String mensagem) {
        super(mensagem);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
