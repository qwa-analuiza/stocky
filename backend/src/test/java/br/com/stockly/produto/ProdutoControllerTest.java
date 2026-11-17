package br.com.stockly.produto;

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
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.time.LocalDate;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Testa o estoque de ponta a ponta: cadastro, edição, exclusão, resumo e isolamento entre usuários. */
@SpringBootTest
@AutoConfigureMockMvc
class ProdutoControllerTest {

    @Autowired
    private MockMvc api;

    @Autowired
    private UsuarioRepository usuarios;

    private String tokenMarina;

    @BeforeEach
    void preparar() throws Exception {
        usuarios.deleteAll();   // os produtos vão junto (ON DELETE CASCADE)
        tokenMarina = criarUsuario("marina@loja.com");
    }

    @Test
    void cadastraProdutoECalculaOsTotais() throws Exception {
        enviar(post("/api/produtos"), tokenMarina, produto("Sabonete", 10, "2.50", "6.00", null))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome").value("Sabonete"))
                .andExpect(jsonPath("$.valorInvestidoTotal").value(25.00))
                .andExpect(jsonPath("$.valorVendaTotal").value(60.00))
                .andExpect(jsonPath("$.lucroTotal").value(35.00))
                .andExpect(jsonPath("$.diasParaVencer").doesNotExist());
    }

    @Test
    void editaEExcluiProduto() throws Exception {
        Long id = criarProduto(tokenMarina, produto("Shampoo", 5, "10.00", "18.00", null));

        enviar(put("/api/produtos/" + id), tokenMarina, produto("Shampoo 300ml", 7, "10.00", "20.00", null))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Shampoo 300ml"))
                .andExpect(jsonPath("$.quantidade").value(7));

        api.perform(comToken(delete("/api/produtos/" + id), tokenMarina)).andExpect(status().isNoContent());
        api.perform(comToken(get("/api/produtos/" + id), tokenMarina)).andExpect(status().isNotFound());
    }

    @Test
    void ninguemVeOEstoqueDeOutraPessoa() throws Exception {
        Long id = criarProduto(tokenMarina, produto("Perfume", 2, "50.00", "120.00", null));
        String tokenJoao = criarUsuario("joao@loja.com");

        api.perform(comToken(get("/api/produtos"), tokenJoao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
        api.perform(comToken(get("/api/produtos/" + id), tokenJoao)).andExpect(status().isNotFound());
        api.perform(comToken(delete("/api/produtos/" + id), tokenJoao)).andExpect(status().isNotFound());
    }

    @Test
    void resumoSomaValoresEApontaVencimentos() throws Exception {
        LocalDate hoje = LocalDate.now();
        criarProduto(tokenMarina, produto("Iogurte", 4, "3.00", "5.00", hoje.minusDays(2)));    // vencido
        criarProduto(tokenMarina, produto("Queijo", 2, "20.00", "35.00", hoje.plusDays(10)));  // vence logo
        criarProduto(tokenMarina, produto("Mel", 1, "30.00", "50.00", hoje.plusDays(200)));    // tranquilo

        api.perform(comToken(get("/api/produtos/resumo"), tokenMarina))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalProdutos").value(3))
                .andExpect(jsonPath("$.totalUnidades").value(7))
                .andExpect(jsonPath("$.valorInvestido").value(82.00))   // 12 + 40 + 30
                .andExpect(jsonPath("$.valorVenda").value(140.00))      // 20 + 70 + 50
                .andExpect(jsonPath("$.lucroPotencial").value(58.00))
                .andExpect(jsonPath("$.margemPercentual").value(41.4))
                .andExpect(jsonPath("$.produtosVencidos").value(1))
                .andExpect(jsonPath("$.produtosVencendo").value(1))
                .andExpect(jsonPath("$.proximosVencimentos", hasSize(2)))
                .andExpect(jsonPath("$.proximosVencimentos[0].nome").value("Iogurte"));
    }

    @Test
    void recusaProdutoInvalido() throws Exception {
        enviar(post("/api/produtos"), tokenMarina, """
                {"nome":"","quantidade":-1,"valorInvestido":"1.999","valorVenda":null,"imagem":"nao-e-imagem"}
                """)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.nome").exists())
                .andExpect(jsonPath("$.campos.quantidade").exists())
                .andExpect(jsonPath("$.campos.valorInvestido").exists())
                .andExpect(jsonPath("$.campos.valorVenda").exists())
                .andExpect(jsonPath("$.campos.imagem").exists());
    }

    @Test
    void exigeLogin() throws Exception {
        api.perform(get("/api/produtos")).andExpect(status().isUnauthorized());
    }

    // ---------- ajudantes ----------

    private String criarUsuario(String email) throws Exception {
        String corpo = """
                {"nome":"Pessoa","nomeNegocio":"Loja","email":"%s","senha":"123456"}
                """.formatted(email);
        String resposta = api.perform(post("/api/auth/cadastro").contentType(MediaType.APPLICATION_JSON).content(corpo))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(resposta, "$.token");
    }

    private Long criarProduto(String token, String json) throws Exception {
        String resposta = enviar(post("/api/produtos"), token, json)
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(resposta, "$.id")).longValue();
    }

    private static String produto(String nome, int quantidade, String investido, String venda, LocalDate vencimento) {
        String data = vencimento == null ? "null" : "\"" + vencimento + "\"";
        return """
                {"nome":"%s","descricao":"Teste","quantidade":%d,"valorInvestido":%s,"valorVenda":%s,"dataVencimento":%s}
                """.formatted(nome, quantidade, investido, venda, data);
    }

    private ResultActions enviar(MockHttpServletRequestBuilder requisicao, String token, String json) throws Exception {
        return api.perform(comToken(requisicao, token).contentType(MediaType.APPLICATION_JSON).content(json));
    }

    private static MockHttpServletRequestBuilder comToken(MockHttpServletRequestBuilder requisicao, String token) {
        return requisicao.header("Authorization", "Bearer " + token);
    }
}
