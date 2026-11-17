# Stockly

Controle de estoque para microempreendedores. Esta etapa traz **cadastro, login e um painel provisório**.

| Parte | Tecnologias |
|---|---|
| **backend/** | Java 21, Spring Boot 3.5, Spring Security (JWT + BCrypt), JPA, Flyway, MySQL |
| **frontend/** | Angular 22 (componentes standalone, signals, formulários reativos), CSS puro e responsivo |

```
stockly/
├── backend/             API Spring Boot
├── frontend/            site Angular
├── docker-compose.yml   MySQL local (opcional)
└── .gitignore
```

---

## Como rodar

### 1. Banco de dados (MySQL)

Escolha **uma** opção:

- **MySQL instalado no Windows:** basta o serviço estar ligado. O banco `stockly` é criado
  sozinho na primeira execução. Se a senha do `root` não for `root`, informe-a pela variável `DB_PASSWORD` (veja abaixo)
  ou troque o padrão em `backend/src/main/resources/application.properties`.
- **Docker:** na pasta `stockly`, rode `docker compose up -d` (MySQL 8.4, usuário `root`, senha `root`).

A tabela `usuarios` é criada **sozinha** pelo Flyway quando o back-end liga.

### 2. Back-end

📁 Pasta `stockly\backend`. Não precisa instalar o Maven: o `mvnw` baixa sozinho.

```powershell
.\mvnw.cmd spring-boot:run
```

Com outro usuário ou senha do MySQL:

```powershell
$env:DB_PASSWORD="sua-senha"; .\mvnw.cmd spring-boot:run
```

Quando aparecer `Started StocklyApplication`, a API está em `http://localhost:8080`.

Testes automáticos (usam um banco em memória e não precisam do MySQL):

```powershell
.\mvnw.cmd test
```

### 3. Front-end

📁 Pasta `stockly\frontend`

```powershell
npm install      # só na primeira vez
npm start        # abre em http://localhost:4200
```

> Se o PowerShell disser que "a execução de scripts foi desabilitada", rode uma vez:
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

Testes: `npm test -- --watch=false`.

---

## API

| Método | Rota | Corpo (JSON) | Precisa de token? |
|---|---|---|---|
| POST | `/api/auth/cadastro` | `{"nome","nomeNegocio","email","senha"}` | não |
| POST | `/api/auth/login` | `{"email","senha"}` | não |
| GET | `/api/perfil` | — | sim (`Authorization: Bearer <token>`) |
| PUT | `/api/perfil` | `{"nome","nomeNegocio","email"}` | sim |
| PUT | `/api/perfil/senha` | `{"senhaAtual","novaSenha"}` | sim |
| GET | `/api/produtos` | — | sim |
| GET | `/api/produtos/resumo` | — (números do painel e do valor de estoque) | sim |
| GET | `/api/produtos/{id}` | — | sim |
| POST | `/api/produtos` | `{"nome","descricao","quantidade","valorInvestido","valorVenda","dataVencimento","imagem"}` | sim |
| PUT | `/api/produtos/{id}` | igual ao POST | sim |
| DELETE | `/api/produtos/{id}` | — | sim |

Nos produtos, `valorInvestido` e `valorVenda` são **por unidade**; a API devolve também os totais
(`valorInvestidoTotal`, `valorVendaTotal`, `lucroTotal`) e `diasParaVencer`. Cada pessoa só enxerga o próprio estoque.

Erros sempre voltam no mesmo formato, em português:
`{ "status": 400, "mensagem": "Verifique os campos destacados.", "campos": { "email": "Informe um e-mail válido" } }`

### Variáveis de ambiente (todas opcionais no seu computador)

| Variável | Padrão | Para quê |
|---|---|---|
| `DB_URL` | `jdbc:mysql://localhost:3306/stockly?createDatabaseIfNotExist=true&serverTimezone=UTC` | endereço do banco |
| `DB_USER` / `DB_PASSWORD` | `root` / `root` | login do MySQL |
| `JWT_SECRET` | segredo de desenvolvimento | chave do token (**troque em produção**, mínimo de 32 caracteres) |
| `JWT_EXPIRACAO_HORAS` | `8` | validade do login |
| `CORS_ORIGENS` | `http://localhost:4200` | endereços do front que podem chamar a API |
| `PORT` | `8080` | porta da API |

---

## Organização do código

Nomes de pastas, classes, métodos e variáveis estão em português. Ficam em inglês só os sufixos
de convenção do Spring (`Controller`, `Service`, `Repository`, `Exception`, `Config`) e os métodos
`findBy…`/`existsBy…`, porque o Spring Data monta a consulta SQL a partir desse nome.

### Back-end: `backend/src/main/java/br/com/stockly`

Organizado **por assunto** (cada pasta é uma parte do negócio):

```
autenticacao/
  AutenticacaoController   rotas /api/auth (cadastro, login)
  AutenticacaoService      regras: e-mail único, confere senha com BCrypt, abre a sessão
  TokenService             gera o token JWT
  dto/                     CadastroRequisicao, LoginRequisicao, SessaoResposta
produto/
  ProdutoController        rotas /api/produtos (listar, resumo, cadastrar, editar, excluir)
  ProdutoService           regras: estoque por usuário, totais, lucro, margem e vencimentos
  Produto                  tabela "produtos" (valores por unidade)
  dto/                     ProdutoRequisicao, ProdutoResposta, ResumoEstoque
usuario/
  Usuario                  tabela "usuarios"
  UsuarioRepository        acesso ao banco
  UsuarioResposta          o que o front pode ver do usuário (sem senha)
  PerfilController         rotas /api/perfil (ver, editar dados, trocar senha)
  PerfilService            regras: e-mail único, senha atual obrigatória para trocar
  dto/                     AtualizarPerfilRequisicao, AlterarSenhaRequisicao
compartilhado/erro/
  NegocioException         base dos erros de regra (status + mensagem)
  …Exception               credenciais inválidas, e-mail já cadastrado, não encontrado
  TratadorDeErros          transforma exceções no JSON de erro
  ErroApi                  formato do JSON de erro
configuracao/
  SegurancaConfig          rotas públicas, JWT, BCrypt e CORS
  PropriedadesStockly      lê as chaves "stockly.*" do application.properties
```

### Front-end: `frontend/src/app`

```
nucleo/                         serviços únicos da aplicação (sem tela)
  autenticacao/
    autenticacao.service.ts     login, cadastro, sair; usuário logado (signal)
    sessao-armazenada.ts        guarda/lê o token no navegador
    autenticacao.guards.ts      somenteLogado / somenteVisitante
    autenticacao.interceptor.ts põe o token nas requisições; desloga se vencer
    autenticacao.modelos.ts     tipos (Usuario, Sessao, DadosLogin, DadosCadastro)
  http/erro-api.ts              transforma erros da API em mensagens para a tela
  produtos/                     ProdutosService + tipos (Produto, ResumoEstoque)
  perfil/perfil.service.ts      ver/editar perfil e trocar senha (atualiza o nome em todas as telas)
compartilhado/                  peças reutilizáveis
  componentes/                  Marca, Icone, Alerta, BotaoVerSenha, Indicador (número do painel),
                                SeloVencimento, MiniaturaProduto, BarraInvestidoVenda (gráfico)
  formularios/validacao.ts      campoInvalido, aplicarErrosDoServidor
  imagem/redimensionar-imagem   reduz a foto no navegador antes de enviar (~60 KB)
paginas/                        uma pasta por tela
  autenticacao/
    layout-autenticacao/        painel escuro da esquerda + espaço do formulário
    login/  cadastro/           os formulários
  painel/
    layout-painel/              menu lateral (computador) / abas embaixo (celular)
    visao-geral/                dashboard: unidades, vencimentos, potencial de venda, lucro
    produtos/lista-produtos/    busca, filtro por validade, editar e excluir
    produtos/formulario-produto cadastro e edição (foto, valores, validade) com cálculo ao vivo
    valor-estoque/              de-para investido x venda, geral e por produto
    perfil/                     dados da conta, troca de senha e sair
```

Cores, tipografia, botões, campos e cartões ficam em `frontend/src/styles.css`, e todas as telas usam essa base.

### Responsivo

- **Desktop:** painel da marca à esquerda e formulário à direita.
- **Notebook baixo (até 760px de altura):** esconde os cartões flutuantes para não cobrirem o texto.
- **Tablet (até 960px):** empilha, com a marca em cima e o formulário embaixo, com cantos arredondados.
- **Celular (até 480px):** campos e botões maiores para o toque; fonte de 16px nos campos (evita o zoom do iPhone).
- **Celular pequeno (até 360px):** título e margens menores.
