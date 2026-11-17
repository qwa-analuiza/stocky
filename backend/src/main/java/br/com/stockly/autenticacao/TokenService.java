package br.com.stockly.autenticacao;

import br.com.stockly.configuracao.PropriedadesStockly;
import br.com.stockly.usuario.Usuario;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

/** Gera o token JWT que o front manda em toda requisição (header Authorization). */
@Service
public class TokenService {

    private final JwtEncoder codificadorDeToken;
    private final long expiracaoHoras;

    public TokenService(JwtEncoder codificadorDeToken, PropriedadesStockly propriedades) {
        this.codificadorDeToken = codificadorDeToken;
        this.expiracaoHoras = propriedades.jwt().expiracaoHoras();
    }

    public TokenGerado gerar(Usuario usuario) {
        Instant agora = Instant.now();
        Instant expiraEm = agora.plus(expiracaoHoras, ChronoUnit.HOURS);

        JwtClaimsSet dados = JwtClaimsSet.builder()
                .issuer("stockly-api")
                .issuedAt(agora)
                .expiresAt(expiraEm)
                .subject(usuario.getId().toString())   // id do usuário dentro do token
                .claim("nome", usuario.getNome())
                .build();

        JwsHeader cabecalho = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = codificadorDeToken.encode(JwtEncoderParameters.from(cabecalho, dados)).getTokenValue();
        return new TokenGerado(token, expiraEm);
    }

    public record TokenGerado(String token, Instant expiraEm) {}
}
