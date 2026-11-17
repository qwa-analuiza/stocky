package br.com.stockly.compartilhado.erro;

import java.time.Instant;
import java.util.Map;

/**
 * Formato padrão de erro que o front recebe. Exemplo:
 * { "status": 400, "mensagem": "Verifique os campos destacados.",
 *   "campos": { "email": "Informe um e-mail válido" }, "momento": "..." }
 */
public record ErroApi(int status, String mensagem, Map<String, String> campos, Instant momento) {

    public static ErroApi de(int status, String mensagem) {
        return new ErroApi(status, mensagem, Map.of(), Instant.now());
    }

    public static ErroApi deCampos(Map<String, String> campos) {
        return new ErroApi(400, "Verifique os campos destacados.", campos, Instant.now());
    }
}
