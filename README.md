# PokéManager API

Projeto da disciplina **Tópicos Especiais em Engenharia de Software** — UFF.

**Aluno:** Claudio R Nunes  
**Curso:** Ciência da Computação

## Entrega 2 atualizada

A superfície HTTP atual permite consultar a PokéAPI oficial, cadastrar Treinadores, capturar snapshots de Pokémon, consultar o time ativo e liberar uma Captura sem apagar seu histórico. A aplicação usa TypeScript, Express, Zod, PostgreSQL e Prisma.

O CRUD público histórico de `/api/v1/pokemons` foi despublicado. Sua implementação interna, o model Prisma `Pokemon`, as migrations e os registros da tabela `pokemons` permanecem preservados como legado acadêmico, mas não são endpoints funcionais da Entrega 2.

### Contrato HTTP

Base local: `http://localhost:3333`. A documentação interativa fica em `http://localhost:3333/api/docs`.

| Método | Caminho | Sucesso |
|---|---|---:|
| `GET` | `/api/v1/pokedex/search?name=pikachu` | `200` |
| `POST` | `/api/v1/trainers` | `201` |
| `POST` | `/api/v1/trainers/:trainerId/captures` | `201` |
| `GET` | `/api/v1/trainers/:trainerId/team` | `200` |
| `PATCH` | `/api/v1/trainers/:trainerId/captures/:captureId/release` | `200` |

Respostas bem-sucedidas usam o envelope:

```json
{
  "success": true,
  "data": {}
}
```

Erros usam `status`, `message` e `details`. Os códigos previstos pelo contrato real são `400` para entrada inválida, `404` para recurso inexistente, `409` para e-mail duplicado ou limite de seis Capturas ativas, `503` para timeout/indisponibilidade/resposta inválida da PokéAPI e `500` para falha inesperada.

### Configuração e execução

Pré-requisitos: Node.js, dependências do projeto e PostgreSQL local. Copie as chaves públicas de `.env.example` para um `.env` local e defina `DATABASE_URL` sem versionar nem publicar credenciais. O banco deve possuir as migrations já versionadas:

- `20261006120000_create_pokemons_table`;
- `20261015032658_add_trainers_and_captures`.

Em um ambiente novo, aplique as migrations existentes com `npx prisma migrate deploy`. Não crie uma migration nova apenas para executar esta entrega.

```powershell
npm install
npx prisma validate
npx prisma migrate status
npm run swagger
npm run dev
```

Os novos endpoints sempre consultam a PokéAPI oficial em `https://pokeapi.co/api/v2/pokemon/{name}/`. Portanto, busca e Captura exigem internet. O provider tem timeout de três segundos e converte falhas externas em `503`. `USE_EXTERNAL_API=false` pertence ao catálogo antigo e não oferece modo offline para estes fluxos.

### Exemplos

Buscar e conferir o DTO formatado:

```powershell
curl.exe -i "http://localhost:3333/api/v1/pokedex/search?name=pikachu"
```

```json
{
  "success": true,
  "data": {
    "pokeApiId": 25,
    "name": "pikachu",
    "spriteUrl": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
    "types": ["electric"],
    "stats": {
      "hp": 35,
      "attack": 55,
      "defense": 40,
      "specialAttack": 50,
      "specialDefense": 50,
      "speed": 90
    },
    "baseExperience": 112,
    "height": 4,
    "weight": 60
  }
}
```

A PokéAPI fornece `height` em decímetros e `weight` em hectogramas. `spriteUrl`, `baseExperience`, `height` e `weight` podem ser `null` quando a fonte não fornece o valor.

Cadastrar Treinador:

```powershell
curl.exe -i -X POST http://localhost:3333/api/v1/trainers `
  -H "Content-Type: application/json" `
  -d '{"name":"Misty","age":16,"city":"Cerulean","email":"misty@example.com"}'
```

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-42d3-a456-426614174000",
    "name": "Misty",
    "age": 16,
    "city": "Cerulean",
    "email": "misty@example.com"
  }
}
```

Capturar, consultar e liberar usando os UUIDs retornados:

```powershell
curl.exe -i -X POST http://localhost:3333/api/v1/trainers/TRAINER_ID/captures `
  -H "Content-Type: application/json" -d '{"name":"pikachu"}'

curl.exe -i http://localhost:3333/api/v1/trainers/TRAINER_ID/team

curl.exe -i -X PATCH `
  http://localhost:3333/api/v1/trainers/TRAINER_ID/captures/CAPTURE_ID/release `
  -H "Content-Type: application/json" -d '{}'
```

Cada Captura persiste um snapshot independente com nome, tipos, seis atributos, imagem oficial, experiência-base, altura e peso. Um Treinador pode manter no máximo seis Capturas **ativas**. A liberação é idempotente: chamadas repetidas retornam `200`, preservam a linha e mantêm `active: false`. O endpoint `/team` mostra somente as ativas; as inativas continuam no histórico armazenado, para o qual não há endpoint público nesta entrega.

### Validação e testes

Zod valida query, parâmetros e bodies em modo estrito; campos extras são rejeitados. Os testes automáticos usam dublês para permanecer independentes da internet. Isso comprova o contrato e as regras, mas não substitui a prova online com a PokéAPI nem a integração com PostgreSQL real.

```powershell
npx tsc --noEmit
npm test
npm run lint
npm run swagger
npm run build
```

O teste PostgreSQL é opt-in e deve ser executado somente após confirmar que `DATABASE_URL` aponta para o banco local de desenvolvimento correto:

```powershell
$env:RUN_DB_TESTS='1'
npm test
Remove-Item Env:RUN_DB_TESTS
```

### Roteiro curto de demonstração

1. Confirme migrations e inicie `npm run dev`.
2. Abra `/api/docs` e faça a busca online por `pikachu`.
3. Cadastre um Treinador com e-mail exclusivo e copie seu UUID.
4. Capture `pikachu`, confira o snapshot e consulte `/team`.
5. Libere a Captura, repita o PATCH para mostrar idempotência e confirme que `/team` ficou vazio.
6. Demonstre `400` com entrada inválida, `409` repetindo o e-mail e `404` em `/api/v1/pokemons`.

Limitações deliberadas: não há autenticação, paginação, exclusão física de Captura, exclusão de Treinador, retries, circuit breaker, Docker ou deploy. O histórico do catálogo antigo não foi migrado para Capturas.

## Entrega 1 — contexto preservado

A Entrega 1 explorou Clean Architecture, DTOs, casos de uso, repositório em memória, CRUD de catálogo e Swagger. Esses artefatos internos foram mantidos para preservar a evolução acadêmica, embora as antigas rotas públicas de `pokemons` não façam parte da superfície HTTP atual.
