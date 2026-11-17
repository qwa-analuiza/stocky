package br.com.stockly.compartilhado.erro;

import org.springframework.http.HttpStatus;

public class CredenciaisInvalidasException extends NegocioException {

    public CredenciaisInvalidasException() {
        super(HttpStatus.UNAUTHORIZED, "E-mail ou senha incorretos.");
    }
}
