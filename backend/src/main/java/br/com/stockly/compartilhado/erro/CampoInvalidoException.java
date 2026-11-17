package br.com.stockly.compartilhado.erro;

/**
 * Erro de regra ligado a um campo do formulário (ex.: "senha atual incorreta").
 * O front mostra a mensagem embaixo do próprio campo.
 */
public class CampoInvalidoException extends RuntimeException {

    private final String campo;

    public CampoInvalidoException(String campo, String mensagem) {
        super(mensagem);
        this.campo = campo;
    }

    public String getCampo() {
        return campo;
    }
}
