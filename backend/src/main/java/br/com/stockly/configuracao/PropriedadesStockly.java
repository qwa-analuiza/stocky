package br.com.stockly.configuracao;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/** Configurações próprias do Stockly, lidas das chaves "stockly.*" do application.properties. */
@ConfigurationProperties(prefix = "stockly")
public record PropriedadesStockly(Jwt jwt, Cors cors) {

    /** segredo: chave para assinar o token (mínimo de 32 caracteres). */
    public record Jwt(String segredo, long expiracaoHoras) {}

    /** origens: endereços do front que podem chamar a API. */
    public record Cors(List<String> origens) {}
}
