# PokéManager API

Projeto desenvolvido para a disciplina **Tópicos Especiais em Engenharia de Software**, com foco na evolução prática dos conteúdos estudados ao longo das Aulas 1 a 5.

**Aluno:** Claudio R Nunes  
**Curso:** Ciências da Computação

## Entrega 1 — Arquitetura, Contrato REST e Documentação Interativa

A primeira entrega consolida uma API REST para gerenciamento de um catálogo de Pokémon utilizando **TypeScript**, **Express**, **Clean Architecture**, repositório **In-Memory** e documentação interativa com **OpenAPI 3.0 / Swagger UI**.

---

## 1. Evolução do projeto nas Aulas 1 a 5

O código atual é resultado da evolução dos meus estudos no passar das aulas.  É importante informar que algumas implementações intermediárias foram ajustadas ou substituídas à media que novos conceitos foram apresentandas pelo professor em aula ou em seu material didático.

### Aula 1 — Preparação do projeto e arquitetura

A primeira aula estabeleceu a base do projeto:

- Node.js e npm;
- TypeScript em modo estrito;
- execução durante o desenvolvimento com `tsx`;
- ESLint e Prettier;
- estrutura inicial inspirada em Clean Architecture;
- separação entre `domain`, `application`, `infrastructure` e `main`.

### Aula 2 — TypeScript, tipos e contratos

A segunda aula aprofundou recursos do TypeScript e a diferença entre JavaScript executado em runtime e os tipos verificados durante o desenvolvimento/compilação.

Foram trabalhados `interface`, `enum`, Union Types, DTOs e contratos de repositório. Modelos intermediários, como `Rarity`, `nickname` e DTO de Trainer, tiveram finalidade pedagógica e não participam do fluxo principal atual do CRUD de Pokémon.

### Aula 3 — HTTP, REST e Express

A terceira aula introduziu:

- requisição e resposta HTTP;
- aplicação stateless;
- JSON;
- Express;
- verbos `GET`, `POST`, `PUT` e `DELETE`;
- códigos HTTP;
- route params;
- query strings;
- endpoint de estatísticas.

O endpoint `/stats`, criado nessa etapa, foi preservado e migrado para a arquitetura consolidada na Aula 4.

### Aula 4 — Clean Architecture aplicada ao CRUD

A quarta aula consolidou:

- entidade `Pokemon` no domínio;
- `IPokemonRepository` como contrato;
- `InMemoryPokemonRepository` como implementação concreta;
- Use Cases para as operações da aplicação;
- `PokemonController` para traduzir HTTP para casos de uso;
- Routes responsáveis pelo mapeamento dos endpoints;
- `main` como ponto de composição das dependências.

O CRUD passou a funcionar sem que os casos de uso conheçam Express ou a implementação concreta do armazenamento.

### Aula 5 — OpenAPI 3.0, Swagger UI e documentação interativa

A quinta aula acrescentou documentação executável ao contrato REST já existente.

```text
Routes + anotações #swagger.*
            ↓
      swagger-autogen
            ↓
    swagger-output.json
            ↓
       Swagger UI
            ↓
        /api/docs
            ↓
        Try it out
            ↓
       mesma API REST
```

A Aula 5 não criou uma segunda API e não substituiu o CRUD anterior. O Swagger UI passou a funcionar como **outro cliente HTTP**, permitindo visualizar e executar o mesmo contrato já testado anteriormente pelo terminal.

---

## 2. Estrutura principal do projeto

```text
src/
├── domain/
│   ├── entities/
│   │   └── pokemon.ts
│   ├── errors/
│   │   └── resource-not-found-error.ts
│   └── repositories/
│       └── pokemon-repository.ts
│
├── application/
│   ├── dtos/
│   │   └── pokemon-dto.ts
│   └── use-cases/
│       ├── create-pokemon.ts
│       ├── delete-pokemon.ts
│       ├── get-pokemon-by-id.ts
│       ├── get-pokemon-stats.ts
│       ├── list-pokemons.ts
│       └── update-pokemon.ts
│
├── infrastructure/
│   ├── database/
│   │   └── in-memory/
│   │       └── in-memory-pokemon-repository.ts
│   └── http/
│       ├── controllers/
│       │   └── pokemon-controller.ts
│       └── routes/
│           └── pokemon-routes.ts
│
└── main/
    ├── config/
    │   ├── swagger-generator.ts
    │   ├── swagger-output.json
    │   └── swagger.ts
    ├── factories/
    │   └── make-pokemon-controller.ts
    └── server.ts
```

Fluxo principal da aplicação:

```text
Cliente HTTP
    ↓
Express / Routes
    ↓
PokemonController
    ↓
Use Cases
    ↓
IPokemonRepository
    ↑
InMemoryPokemonRepository
```

O `main` funciona como ponto de composição: cria o Controller por meio da factory, registra as rotas e configura o Swagger UI.

---

## 3. Classe, interface, entidade e instância

### Interface

Uma interface descreve uma estrutura ou contrato.

```ts
export interface IPokemonRepository {
  findAll(): Promise<Pokemon[]>;
  findByType(type: string): Promise<Pokemon[]>;
  findById(id: string): Promise<Pokemon | null>;
  create(pokemon: Pokemon): Promise<void>;
  update(pokemon: Pokemon): Promise<void>;
  delete(id: string): Promise<void>;
}
```

### Classe

`Pokemon` é uma classe porque contém atributos, construtor, métodos e regras de implementação.

### Entidade

`Pokemon` também representa uma entidade de domínio porque corresponde a um conceito importante para a aplicação e possui identidade própria por meio de `id`.

### Instância

```ts
const pokemon = new Pokemon(input);
```

Nesse ponto é criada uma instância concreta da classe que representa a entidade `Pokemon`.

---

## 4. Encapsulamento da entidade `Pokemon`

A entidade mantém seus atributos mutáveis privados:

```ts
private _name: string;
private _type: PokemonType;
private _hp: number;
private _attack: number;
private _defense: number;
```

A leitura ocorre por getters públicos. A alteração conjunta do estado acontece pelo método `update()`.

Antes de modificar qualquer atributo, o método valida todos os novos valores:

```text
novos dados
    ↓
valida todos os valores
    ↓
┌────────────────┬────────────────┐
│ algum inválido │ todos válidos  │
│ lança Error    │ altera estado  │
│ nada é alterado│ por completo   │
└────────────────┴────────────────┘
```

Essa decisão foi importante porque a bateria manual encontrou uma versão anterior que podia deixar atualização parcial quando uma validação falhava.

### Evidência 07 — Atualização e encapsulamento

A validação inicial mostrou um `PUT` válido, um `PUT` inválido e a consulta posterior confirmando que o último estado válido foi preservado. Na Aula 5, o mesmo comportamento foi revalidado pelo Swagger UI.

| Validação inicial | Revalidação pela Aula 5 |
|---|---|
| ![Evidência 07 - Atualização e encapsulamento](<img/evidencia-07-Atualizacao-e-encapsulamento-da-entidade.png>) | ![Evidência 07 - Swagger](<img/evidencia-07-Atualizacao-e-encapsulamento-da-entidade-swagger.png>) |

---

## 5. Contrato e inversão de dependência

O domínio define o contrato:

```ts
export interface IPokemonRepository {
  findAll(): Promise<Pokemon[]>;
  findByType(type: string): Promise<Pokemon[]>;
  findById(id: string): Promise<Pokemon | null>;
  create(pokemon: Pokemon): Promise<void>;
  update(pokemon: Pokemon): Promise<void>;
  delete(id: string): Promise<void>;
}
```

A implementação concreta fica na Infrastructure:

```ts
export class InMemoryPokemonRepository implements IPokemonRepository {
  // armazenamento em memória
}
```

Os Use Cases dependem da interface, e não da implementação concreta:

```text
Use Case
   ↓
IPokemonRepository
   ↑
InMemoryPokemonRepository
```

O caso de uso sabe **o que** um repositório precisa fazer, mas não precisa saber **como** os dados são armazenados.

---

## 6. Separação de responsabilidades

| Parte | Responsabilidade |
|---|---|
| `Pokemon` | representar a entidade e proteger suas regras de estado |
| Use Cases | executar as ações da aplicação |
| `IPokemonRepository` | definir o contrato de armazenamento |
| `InMemoryPokemonRepository` | armazenar e recuperar dados em memória |
| `PokemonController` | traduzir requisição HTTP para Use Case e resultado para resposta HTTP |
| Routes | associar verbo + endpoint ao método do Controller e registrar metadados do Swagger |
| Main / Factory | criar e conectar as dependências |
| Swagger config | gerar e disponibilizar a documentação OpenAPI |

Uma pergunta prática ajuda a identificar responsabilidades:

> Se esta regra mudar, qual parte deveria precisar mudar?

Exemplos:

- regra de HP → `Pokemon`;
- forma de armazenamento → repositório concreto;
- URL → Routes;
- tradução para HTTP → Controller;
- descrição do contrato → anotações Swagger/configuração OpenAPI.

---

## 7. Controller, Routes e Express

O Express recebe e responde requisições HTTP.

```ts
const app = express();
app.use(express.json());
```

`express.json()` interpreta o JSON recebido e disponibiliza o conteúdo em `req.body`.

```text
Cliente
  ↓ HTTP
Express
  ↓
Route
  ↓
Controller
  ↓
Use Case
  ↓
Repository
```

O Use Case não conhece `Request`, `Response`, `res.status()` ou qualquer outro recurso do Express. A tradução para HTTP pertence ao Controller.

### Evidência 02 — Inicialização da API

A aplicação foi iniciada com `tsx watch` e ficou disponível na porta `3333`.

![Evidência 02 - Inicialização da API](<img/evidencia-02-Inicializacao-da-API.png>)

Na Aula 5, o servidor passou a disponibilizar também:

```text
http://localhost:3333/api/docs
```

---

## 8. Params, Query e Body

### Route Params

```http
GET /api/v1/pokemons/25
```

```ts
req.params.id
```

### Query String

```http
GET /api/v1/pokemons?type=Fire
```

```ts
req.query.type
```

### Body JSON

```json
{
  "id": "25",
  "name": "Pikachu",
  "type": "Electric",
  "hp": 35,
  "attack": 55,
  "defense": 40
}
```

O `PUT` combina as duas formas:

```text
PUT /api/v1/pokemons/25
                      ↑ params

+ JSON no body
```

### Evidência 08 — Filtro por tipo e estatísticas

A consulta `?type=Fire` retornou apenas o Pokémon correspondente ao filtro. O endpoint `/stats` refletiu a distribuição por tipo. Na Aula 5, o campo `type` passou a aparecer como parâmetro de consulta diretamente no Swagger UI.

| Validação inicial | Revalidação pela Aula 5 |
|---|---|
| ![Evidência 08 - Filtro e estatísticas](<img/evidencia-08-Filtro-por-tipo-e-estatisticas-do-catalogo.png>) | ![Evidência 08 - Swagger](<img/evidencia-08-Filtro-por-tipo-e-estatisticas-do-catalogo-swagger.png>) |

---

## 9. TypeScript e validação em runtime

Os DTOs tipam o formato esperado pelo código TypeScript:

```ts
export interface CreatePokemonDTO {
  id: string;
  name: string;
  type: PokemonType;
  hp: number;
  attack: number;
  defense: number;
}
```

Essa tipagem ajuda o programador e o compilador, mas não impede um cliente HTTP de enviar dados incorretos.

```text
Controller
"A entrada possui a estrutura básica esperada?"
       ↓
Use Case
"A operação pode ser realizada?"
       ↓
Pokemon
"O estado da entidade é válido?"
```

Exemplo:

```text
hp = "78"
→ problema de tipo na entrada HTTP

hp = -78
→ número recebido corretamente
→ viola regra da entidade
```

### Evidência 06 — Validação de entrada e regras de domínio

Na Aula 5 foi registrada uma resposta representativa pelo Swagger mostrando a rejeição de `hp` com tipo incorreto. O caso de HP negativo também foi reexecutado, mas não ganhou uma segunda captura para evitar repetição visual.

| Validação inicial | Revalidação pela Aula 5 |
|---|---|
| ![Evidência 06 - Validação](<img/evidencia-06-Validação-de-entrada-e-regras-de-dominio.png>) | ![Evidência 06 - Swagger](<img/evidencia-06-Validação-de-entrada-e-regras-de-dominio-swagger.png>) |

---

## 10. Repositório In-Memory

O repositório atual utiliza um array:

```ts
private pokemons: Pokemon[] = [];
```

A factory mantém uma única instância durante a execução da aplicação:

```ts
const pokemonRepository = new InMemoryPokemonRepository();
```

```text
POST Pikachu
    ↓
Pokemon[] contém Pikachu
    ↓
GET /25 encontra Pikachu
```

### Evidência 04 — Criação, consulta e estado compartilhado em memória

A bateria inicial cadastrou o Pikachu e confirmou que ele permaneceu disponível durante a mesma execução do servidor. Na Aula 5, o mesmo fluxo foi executado pelo `Try it out` do Swagger UI.

| Validação inicial | Revalidação pela Aula 5 |
|---|---|
| ![Evidência 04 - Criação e consulta](<img/evidencia-04-Criacao-consulta-e-persistencia-em-memoria.png>) | ![Evidência 04 - Swagger](<img/evidencia-04-Criacao-consulta-e-persistencia-em-memoria-swagger.png>) |

Os dados, porém, não são persistidos permanentemente:

```text
processo ativo
→ dados permanecem em memória

servidor reiniciado
→ nova memória
→ catálogo vazio
```

### Evidência 11 — Comportamento do repositório In-Memory

A listagem foi consultada antes do reinício do servidor e novamente após o reinício. A segunda consulta retornou `[]`, confirmando que o armazenamento existe somente na memória do processo.

| Validação inicial | Revalidação pela Aula 5 |
|---|---|
| ![Evidência 11 - In-Memory](<img/evidencia-11-Comportamento-do-repositorio-In-Memory.png>) | ![Evidência 11 - Swagger](<img/evidencia-11-Comportamento-do-repositorio-In-Memory-swagger.png>) |

### Stateless não significa ausência de armazenamento

HTTP stateless significa que cada requisição deve conter as informações necessárias para ser compreendida. Isso não impede que o servidor mantenha dados.

```text
HTTP stateless
≠
servidor sem armazenamento
```

---

## 11. Contrato REST da Entrega 1

Base URL:

```text
http://localhost:3333/api/v1/pokemons
```

| Método | Endpoint | Finalidade | Sucesso | Erros principais |
|---|---|---|---:|---:|
| `GET` | `/api/v1/pokemons` | listar todos | `200` | — |
| `GET` | `/api/v1/pokemons?type=Fire` | filtrar por tipo | `200` | — |
| `GET` | `/api/v1/pokemons/stats` | estatísticas do catálogo | `200` | — |
| `GET` | `/api/v1/pokemons/:id` | buscar por ID | `200` | `404`, `500` |
| `POST` | `/api/v1/pokemons` | cadastrar | `201` | `400`, `500` |
| `PUT` | `/api/v1/pokemons/:id` | atualizar | `200` | `400`, `404`, `500` |
| `DELETE` | `/api/v1/pokemons/:id` | excluir | `204` | `404`, `500` |

### Evidência 03 — Estado inicial e `/stats`

Com o catálogo vazio, a listagem retornou `[]` e `/stats` retornou total igual a zero. O mesmo cenário foi reexecutado pelo Swagger UI na Aula 5, sem necessidade de uma nova captura específica.

![Evidência 03 - Estado inicial e estatísticas](<img/evidencia-03-Estado-inicial-e-endpoint-de-estatísticas.png>)

### Evidência 05 — Rejeição de Pokémon duplicado

Uma segunda tentativa de cadastrar o mesmo ID retornou `400 Bad Request`, e o total do catálogo permaneceu inalterado. O comportamento foi revalidado pelo Swagger UI.

| Validação inicial | Revalidação pela Aula 5 |
|---|---|
| ![Evidência 05 - Duplicidade](<img/evidencia-05-Rejeicao-de-Pokemon-duplicado.png>) | ![Evidência 05 - Swagger](<img/evidencia-05-Rejeicao-de-Pokemon-duplicado-swagger.png>) |

### Evidência 09 — Recurso inexistente e `404`

GET, PUT e DELETE para um ID inexistente retornaram `404 Not Found`. Na revalidação da Aula 5, o Swagger confirmou a mesma tradução de `ResourceNotFoundError` para HTTP `404`.

| Validação inicial | Revalidação pela Aula 5 |
|---|---|
| ![Evidência 09 - 404](<img/evidencia-09-Tratamento-de-recurso-inexistente-(404).png>) | ![Evidência 09 - Swagger](<img/evidencia-09-Tratamento-de-recurso-inexistente-(404)-swagger.png>) |

### Evidência 10 — Exclusão e atualização do catálogo

O DELETE de um Pokémon existente retornou `204 No Content`. A consulta posterior retornou `404`, e `/stats` passou a refletir a remoção.

| Validação inicial | Revalidação pela Aula 5 |
|---|---|
| ![Evidência 10 - Exclusão](<img/evidencia-10-Exclusao-e-atualizacao-do-catalogo.png>) | ![Evidência 10 - Swagger](<img/evidencia-10-Exclusao-e-atualizacao-do-catalogo-swagger.png>) |

---

## 12. OpenAPI 3.0, Swagger UI e swagger-autogen

Os três nomes estão relacionados, mas não significam a mesma coisa.

| Elemento | Papel no projeto |
|---|---|
| **OpenAPI 3.0** | especificação que descreve o contrato da API |
| **swagger-autogen** | analisa rotas e comentários e gera o arquivo OpenAPI |
| **Swagger UI** | apresenta o contrato em uma interface visual e permite executar requisições |

### Arquivos adicionados na Aula 5

```text
src/main/config/
├── swagger-generator.ts
├── swagger-output.json
└── swagger.ts
```

### `swagger-generator.ts`

Define informações gerais, schemas reutilizáveis e os arquivos que devem ser analisados pelo `swagger-autogen`.

No projeto, o endereço-base usado pelo contrato é:

```text
http://localhost:3333/api/v1/pokemons
```

As rotas do `Router` são relativas:

```text
/
/stats
/{id}
```

O OpenAPI combina o servidor-base com cada `path` para formar as URLs chamadas pelo Swagger UI.

### Anotações `#swagger.*`

As rotas foram enriquecidas com metadados como:

```text
#swagger.tags
#swagger.summary
#swagger.description
#swagger.parameters
#swagger.requestBody
#swagger.responses
```

Esses comentários não executam regra de negócio. Eles descrevem o contrato para que a documentação deixe de ser apenas uma lista genérica de endpoints.

### `swagger-output.json`

É o arquivo OpenAPI gerado automaticamente.

```text
pokemon-routes.ts + swagger-generator.ts
                ↓
          npm run swagger
                ↓
        swagger-output.json
```

Esse JSON **não deve ser editado manualmente** no fluxo normal, porque será sobrescrito quando o gerador for executado novamente.

### `swagger.ts`

Lê o contrato gerado e registra o Swagger UI no Express:

```text
http://localhost:3333/api/docs
```

### Swagger UI como cliente

```text
PowerShell / curl.exe ─┐
                      ├→ mesma API REST
Swagger UI / Try it out┘
```

A reexecução das evidências confirmou que acrescentar a documentação interativa não alterou o comportamento funcional já validado nas Aulas anteriores.

---

## 13. Exemplos de uso pelo terminal

O Swagger UI passou a oferecer uma segunda forma de executar o contrato, mas os comandos de terminal continuam válidos.

### Listar

```powershell
curl.exe -i http://localhost:3333/api/v1/pokemons
```

### Buscar por ID

```powershell
curl.exe -i http://localhost:3333/api/v1/pokemons/25
```

### Filtrar por tipo

```powershell
curl.exe -i "http://localhost:3333/api/v1/pokemons?type=Electric"
```

### Estatísticas

```powershell
curl.exe -i http://localhost:3333/api/v1/pokemons/stats
```

### Criar

```powershell
curl.exe -i -X POST http://localhost:3333/api/v1/pokemons `
  -H "Content-Type: application/json" `
  -d '{"id":"25","name":"Pikachu","type":"Electric","hp":35,"attack":55,"defense":40}'
```

### Atualizar

```powershell
curl.exe -i -X PUT http://localhost:3333/api/v1/pokemons/25 `
  -H "Content-Type: application/json" `
  -d '{"name":"Pikachu Atualizado","type":"Electric","hp":45,"attack":65,"defense":50}'
```

### Excluir

```powershell
curl.exe -i -X DELETE http://localhost:3333/api/v1/pokemons/25
```

---

## 14. Como executar o projeto

Instale as dependências:

```powershell
npm install
```

Gere ou atualize a documentação OpenAPI:

```powershell
npm run swagger
```

Execute a análise estática:

```powershell
npm run lint
```

Compile o TypeScript:

```powershell
npm run build
```

### Evidência 01 — Swagger, Lint e Build

O estado final do código passou pela geração da documentação, pelo ESLint e pela compilação TypeScript sem erros.

![Evidência 01 - Lint e Build](<img/evidencia-01-Lint-e-Build.png>)

Inicie o servidor de desenvolvimento:

```powershell
npm run dev
```

No estado atual, `npm run dev` executa primeiro a geração do Swagger e depois inicia o servidor com `tsx watch`.

```text
npm run dev
     ↓
npm run swagger
     ↓
swagger-output.json atualizado
     ↓
tsx watch src/main/server.ts
```

API:

```text
http://localhost:3333/api/v1/pokemons
```

Documentação interativa:

```text
http://localhost:3333/api/docs
```

---

## 15. Ferramentas utilizadas nesta etapa

| Ferramenta | Papel no projeto |
|---|---|
| Node.js | ambiente de execução JavaScript |
| npm | gerenciamento de dependências e scripts |
| npx | execução direta de ferramentas instaladas no projeto |
| TypeScript | tipagem estática e compilação |
| tsx | execução do TypeScript durante o desenvolvimento |
| Express | camada HTTP da API |
| ESLint | análise de qualidade e regras de código |
| Prettier | padronização de formatação |
| OpenAPI 3.0 | especificação do contrato da API |
| swagger-autogen | geração automatizada do arquivo OpenAPI |
| Swagger UI | documentação visual e execução interativa dos endpoints |
| Git / GitHub | versionamento e armazenamento do repositório |

---

## 16. Conclusão da Entrega 1

A evolução até a Aula 5 consolidou quatro resultados principais:

- **arquitetura em camadas aplicada**, com Domain, Application, Infrastructure e Main exercendo responsabilidades distintas;
- **contrato REST funcional**, incluindo CRUD, filtro por tipo, estatísticas e tratamento de erros;
- **comportamento validado manualmente**, incluindo regras de domínio, encapsulamento, códigos HTTP e características do repositório In-Memory;
- **contrato documentado com OpenAPI 3.0 e Swagger UI**, permitindo visualizar e executar os mesmos endpoints em `/api/docs`.

A principal evolução da Aula 5 pode ser resumida assim:

```text
Aulas 1 a 4
API implementada e testada
        ↓
Aula 5
contrato descrito pelo OpenAPI
        ↓
Swagger UI
contrato visível e executável
        ↓
reexecução dos mesmos cenários
        ↓
comportamento anterior preservado
```

O projeto encerra esta etapa com uma base coerente com os conteúdos estudados nas Aulas 1 a 5 e preparada para evoluir nas próximas entregas sem antecipar tecnologias que ainda não pertencem ao escopo atual.
