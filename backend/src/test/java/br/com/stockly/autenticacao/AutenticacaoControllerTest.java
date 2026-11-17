package br.com.stockly.autenticacao;

import br.com.stockly.usuario.UsuarioRepository;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.emptyString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Testa a API de autenticação de ponta a ponta (HTTP → regras → banco). */
@SpringBootTest
@AutoConfigureMockMvc
class AutenticacaoControllerTest {

    private static final String CADASTRO_VALIDO = """
            {"nome":"Marina","nomeNegocio":"Loja da Marina","email":"Marina@MinhaLoja.com","senha":"123456"}
            """;

    @Autowired
    private MockMvc api;

    @Autowired
    private UsuarioRepository usuarios;

    @BeforeEach
    void limparBanco() {
        usuarios.deleteAll();
    }

    @Test
    void cadastroDevolveTokenEUsuarioComEmailNormalizado() throws Exception {
        enviar("/api/auth/cadastro", CADASTRO_VALIDO)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token", not(emptyString())))
                .andExpect(jsonPath("$.usuario.email").value("marina@minhaloja.com"))
                .andExpect(jsonPath("$.usuario.nomeNegocio").value("Loja da Marina"));
    }

    @Test
    void cadastroComEmailRepetidoDevolveConflito() throws Exception {
        enviar("/api/auth/cadastro", CADASTRO_VALIDO).andExpect(status().isCreated());

        enviar("/api/auth/cadastro", CADASTRO_VALIDO)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.mensagem").value("Este e-mail já está cadastrado. Que tal fazer login?"));
    }

    @Test
    void cadastroComCamposInvalidosApontaCadaCampo() throws Exception {
        enviar("/api/auth/cadastro", """
                {"nome":"","nomeNegocio":"Loja","email":"nao-e-email","senha":"123"}
                """)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.nome").exists())
                .andExpect(jsonPath("$.campos.email").value("Informe um e-mail válido"))
                .andExpect(jsonPath("$.campos.senha").exists());
    }

    @Test
    void loginComSenhaCertaEntraEComSenhaErradaRecusa() throws Exception {
        enviar("/api/auth/cadastro", CADASTRO_VALIDO).andExpect(status().isCreated());

        enviar("/api/auth/login", """
                {"email":"marina@minhaloja.com","senha":"123456"}
                """)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usuario.nome").value("Marina"));

        enviar("/api/auth/login", """
                {"email":"marina@minhaloja.com","senha":"errada"}
                """)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.mensagem").value("E-mail ou senha incorretos."));
    }

    @Test
    void rotaProtegidaExigeTokenValido() throws Exception {
        api.perform(get("/api/perfil")).andExpect(status().isUnauthorized());

        String resposta = enviar("/api/auth/cadastro", CADASTRO_VALIDO)
                .andReturn().getResponse().getContentAsString();
        String token = JsonPath.read(resposta, "$.token");

        api.perform(get("/api/perfil").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("marina@minhaloja.com"));
    }

    @Test
    void navegadorDoFrontPodeChamarAApi() throws Exception {
        // "preflight": o navegador pergunta antes se o front (localhost:4200) pode chamar a API
        api.perform(options("/api/auth/login")
                        .header("Origin", "http://localhost:4200")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:4200"));

        api.perform(options("/api/auth/login")
                        .header("Origin", "http://site-estranho.com")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isForbidden());
    }

    private ResultActions enviar(String rota, String json) throws Exception {
        return api.perform(post(rota).contentType(MediaType.APPLICATION_JSON).content(json));
    }
}
