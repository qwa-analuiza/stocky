package br.com.stockly.configuracao;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.List;

/** Quem pode acessar o quê, como o token é assinado e quais sites podem chamar a API. */
@Configuration
public class SegurancaConfig {

    private static final String[] ROTAS_PUBLICAS = {"/api/auth/login", "/api/auth/cadastro"};

    private final PropriedadesStockly propriedades;

    public SegurancaConfig(PropriedadesStockly propriedades) {
        this.propriedades = propriedades;
    }

    @Bean
    public SecurityFilterChain filtroDeSeguranca(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)   // API com token, sem cookie de sessão
                .cors(cors -> cors.configurationSource(configuracaoCors()))
                .sessionManagement(sessao -> sessao.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(rotas -> rotas
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.POST, ROTAS_PUBLICAS).permitAll()
                        .requestMatchers("/error").permitAll()
                        .anyRequest().authenticated())   // todo o resto exige token
                .oauth2ResourceServer(servidor -> servidor.jwt(Customizer.withDefaults()))
                .build();
    }

    @Bean
    public PasswordEncoder codificadorDeSenha() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtEncoder codificadorDeToken() {
        return new NimbusJwtEncoder(new ImmutableSecret<>(chaveSecreta()));
    }

    @Bean
    public JwtDecoder decodificadorDeToken() {
        return NimbusJwtDecoder.withSecretKey(chaveSecreta())
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }

    @Bean
    public CorsConfigurationSource configuracaoCors() {
        CorsConfiguration cors = new CorsConfiguration();
        cors.setAllowedOrigins(propriedades.cors().origens());
        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cors.setAllowedHeaders(List.of("Authorization", "Content-Type"));

        UrlBasedCorsConfigurationSource origem = new UrlBasedCorsConfigurationSource();
        origem.registerCorsConfiguration("/**", cors);
        return origem;
    }

    private SecretKey chaveSecreta() {
        byte[] bytes = propriedades.jwt().segredo().getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("stockly.jwt.segredo precisa ter pelo menos 32 caracteres");
        }
        return new SecretKeySpec(bytes, "HmacSHA256");
    }
}
