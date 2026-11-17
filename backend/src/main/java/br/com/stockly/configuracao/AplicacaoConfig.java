package br.com.stockly.configuracao;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

@Configuration
public class AplicacaoConfig {

    /** Relógio usado nas regras de data (vencimentos). Nos testes dá para trocar por um relógio fixo. */
    @Bean
    public Clock relogio() {
        return Clock.systemDefaultZone();
    }
}
