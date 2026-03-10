## Armchair Renting (Netlify + Supabase)

Sistema simples com:
- Login fixo (`adm1` / `adm1`)
- CRUD de poltronas com cálculo automático de data de devolução
- Quando `status = Locada` e a `return_date` estiver no passado, a API retorna `status = Atrasada` (sem precisar salvar isso no banco).

### Requisitos
- Node.js (recomendado 18+)
- Netlify CLI (para rodar local): `npm i -g netlify-cli`
- Projeto Supabase com uma tabela `armchairs`

### Variáveis de ambiente
Crie um arquivo `.env` na raiz (`armchair-renting/.env`) baseado em `armchair-renting/.env.example`.

Obrigatórias:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (recomendado) **ou** `SUPABASE_ANON_KEY`
- `JWT_SECRET`

### Tabela no Supabase
Crie uma tabela chamada `armchairs` com colunas sugeridas:
- `id` (uuid, default `gen_random_uuid()`, PK)
- `name` (text, not null)
- `location` (text, not null)
- `allocation_date` (date, not null)
- `rental_days` (int4, not null)
- `return_date` (date, not null)
- `status` (text, not null) — `Disponível` | `Locada` (o backend pode retornar `Atrasada`)
- `created_at` (timestamptz, default `now()`)

### Rodar localmente
No diretório `armchair-renting/`:
- `npm install`
- `netlify dev`

Depois acesse:
- `http://localhost:8888/login.html`
