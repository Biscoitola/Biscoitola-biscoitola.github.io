# Cha de Panela

Lista de presentes com reserva sincronizada via PostgreSQL + API Node.js.

## Estrutura

- `index.html`
- `assets/css/styles.css`
- `assets/js/script.js`
- `server/index.js` (API + servidor web)
- `database/schema.sql` (schema PostgreSQL)
- `database/seed_items.sql` (carga inicial dos itens)
- `database/queries.sql` (consultas de exemplo)
- `.env.example`

## Requisitos

- Node.js 18+
- PostgreSQL 14+ (ou compatível)
- `psql` no PATH (opcional, mas recomendado)

## 1) Criar banco PostgreSQL

Exemplo local:

```sql
CREATE DATABASE cha_panela;
```

## 2) Aplicar schema e seed

```bash
psql -d cha_panela -f database/schema.sql
psql -d cha_panela -f database/seed_items.sql
```

## 3) Configurar variáveis de ambiente

Copie `.env.example` e ajuste o `DATABASE_URL`.

Exemplo (PowerShell):

```powershell
$env:DATABASE_URL='postgresql://postgres:postgres@localhost:5432/cha_panela'
$env:PORT='3000'
$env:ALLOWED_ORIGINS='http://localhost:3000,https://SEU-USUARIO.github.io'
```

## 4) Instalar dependências

```bash
npm install
```

## 5) Iniciar aplicação

```bash
npm start
```

Acesse `http://localhost:3000`.

## API disponível

- `GET /api/health`
- `GET /api/items`
- `POST /api/items/:id/reserve`
- `POST /api/items/:id/release`

## Observações

- O frontend tenta usar a API automaticamente.
- Se a API estiver fora do ar, ele cai em fallback local (`localStorage`) para não quebrar a experiência.
- As reservas no banco são protegidas contra concorrência (duas pessoas clicando ao mesmo tempo) via função SQL `reserve_gift_item(...)`.

## GitHub Pages + API externa

Para sincronizar reservas no GitHub Pages, o frontend precisa apontar para uma API pública.

1) Suba a API (`server/index.js`) em um host público (Render/Railway/Fly/etc).
2) No backend, configure:

```env
DATABASE_URL=postgresql://...
PORT=3000
ALLOWED_ORIGINS=https://SEU-USUARIO.github.io
```

3) No frontend (`index.html`), configure a URL da API:

```html
<meta name="cha-panela-api-base-url" content="https://SEU-BACKEND.onrender.com" />
```

4) Publique no GitHub Pages e acesse:
`https://SEU-USUARIO.github.io/SEU-REPOSITORIO/`

### Deploy mais rapido (Render)

Este repo ja inclui `render.yaml` com API + PostgreSQL.

1) Faça push para o GitHub.
2) No Render, clique em **New +** -> **Blueprint**.
3) Selecione este repositório e confirme a criação.
4) Após deploy, copie a URL da API (ex.: `https://cha-panela-api.onrender.com`).
5) Atualize no `index.html`:

```html
<meta name="cha-panela-api-base-url" content="https://cha-panela-api.onrender.com" />
```

6) Faça novo push para atualizar o GitHub Pages.
