package br.com.stockly.compartilhado.erro;

import org.springframework.http.HttpStatus;

public class EmailJaCadastradoException extends NegocioException {

    public static final String MENSAGEM = "Este e-mail já está cadastrado. Que tal fazer login?";
    public static final String MENSAGEM_OUTRA_CONTA = "Este e-mail já é usado por outra conta";

    public EmailJaCadastradoException() {
        super(HttpStatus.CONFLICT, MENSAGEM);
    }
}
