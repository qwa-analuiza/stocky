package br.com.stockly.compartilhado.erro;

import org.springframework.http.HttpStatus;

public class NaoEncontradoException extends NegocioException {

    public NaoEncontradoException(String mensagem) {
        super(HttpStatus.NOT_FOUND, mensagem);
    }
}
