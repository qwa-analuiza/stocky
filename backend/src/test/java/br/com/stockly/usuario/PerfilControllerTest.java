package br.com.stockly.usuario;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Testa o perfil: ver, editar os dados e trocar a senha. */
@SpringBootTest
@AutoConfigureMockMvc
class PerfilControllerTest {

    @Autowired
    private MockMvc api;

    @Autowired
    private UsuarioRepository usuarios;

    private String token;

    @BeforeEach
    void preparar() throws Exception {
        usuarios.deleteAll();
        token = cadastrar("marina@loja.com");
    }

    @Test
    void mostraOsDadosDaPessoaLogada() throws Exception {
        api.perform(get("/api/perfil").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("marina@loja.com"))
                .andExpect(jsonPath("$.nomeNegocio").value("Loja"));
    }

    @Test
    void atualizaNomeNegocioEEmail() throws Exception {
        enviar("/api/perfil", """
                {"nome":"Marina Souza","nomeNegocio":"Empório da Marina","email":"Contato@Emporio.com"}
                """)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Marina Souza"))
                .andExpect(jsonPath("$.nomeNegocio").value("Empório da Marina"))
                .andExpect(jsonPath("$.email").value("contato@emporio.com"));

        // o login passa a ser com o e-mail novo
        api.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"contato@emporio.com\",\"senha\":\"123456\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void naoDeixaUsarEmailDeOutraConta() throws Exception {
        cadastrar("joao@loja.com");

        enviar("/api/perfil", """
                {"nome":"Marina","nomeNegocio":"Loja","email":"joao@loja.com"}
                """)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.email").value("Este e-mail já é usado por outra conta"));
    }

    @Test
    void trocaASenhaSoComASenhaAtualCerta() throws Exception {
        enviar("/api/perfil/senha", """
                {"senhaAtual":"errada","novaSenha":"nova-senha"}
                """)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.senhaAtual").value("Senha atual incorreta"));

        enviar("/api/perfil/senha", """
                {"senhaAtual":"123456","novaSenha":"nova-senha"}
                """)
                .andExpect(status().isNoContent());

        api.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"marina@loja.com\",\"senha\":\"nova-senha\"}"))
                .andExpect(status().isOk());
        api.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"marina@loja.com\",\"senha\":\"123456\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void exigeLogin() throws Exception {
        api.perform(get("/api/perfil")).andExpect(status().isUnauthorized());
    }

    private String cadastrar(String email) throws Exception {
        String corpo = """
                {"nome":"Marina","nomeNegocio":"Loja","email":"%s","senha":"123456"}
                """.formatted(email);
        String resposta = api.perform(post("/api/auth/cadastro").contentType(MediaType.APPLICATION_JSON).content(corpo))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(resposta, "$.token");
    }

    private ResultActions enviar(String rota, String json) throws Exception {
        return api.perform(put(rota)
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json));
    }
}
