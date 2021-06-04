# Nexus AI — streaming AI tools hub

App **#7** of a 12-app MERN portfolio (2021–2022 stack). A hub of AI writing tools —
**Summarizer**, **Paraphraser**, and **Generator** — whose answers **stream into the UI
token-by-token** over Server-Sent Events, the way a language model actually produces them.

> **Engineering lesson:** streaming LLM responses through an Express proxy. The provider
> key lives only on the server; the browser consumes a re-emitted SSE stream incrementally
> with `fetch().body.getReader()`. A no-key **demo mode** streams a canned response so the
> whole experience runs without any signup.

This is the **one app in the portfolio that uses a post-2022 third-party API** (the LLM
provider). Everything around it is period-accurate (React 17, Express 4.18, Mongoose 6, axios 0.27).

---

## Features

- **Token streaming** — output renders word-by-word with a live caret (SSE, not spinner-then-dump).
- **Three tools** — summarize / paraphrase / generate, each with its own options (length, tone, format). Prompts are built **server-side**; the client only picks a tool.
- **Cancel mid-stream** — an `AbortController` stops generation instantly.
- **Provider-agnostic** — defaults to Groq (free tier) but works with any OpenAI-compatible endpoint via one env switch.
- **Demo mode** — no `AI_API_KEY`? The full UX still works; responses are generated locally and streamed.
- **JWT auth** — register / login, protected routes, bcrypt-hashed passwords (never returned).
- **Usage metering + dashboard** — every completed run is recorded; a Recharts dashboard shows totals, requests-per-day, a by-tool breakdown, and recent activity.
- **Rate limiting** — a global limiter plus a stricter one on the AI routes to protect free-tier quotas.
- Loading / empty / error states on every async view; mobile-first responsive; accessibility basics (labels, focus rings, reduced-motion).

---

## Tech stack

**Frontend** — React 17.0.2 · React Router 6.3 · axios 0.27.2 · Tailwind CSS 3.1 · react-hook-form 7 · Recharts 2.1 · react-toastify 9 · dayjs · CRA 5 (`react-scripts@5`)

**Backend** — Node 16 · Express 4.18.1 · Mongoose 6.5 · jsonwebtoken 8.5 · bcryptjs 2.4 · express-validator 6.14 · express-rate-limit 6 · helmet 6 · morgan · cors · dotenv · axios 0.27.2

**AI provider** — any OpenAI-compatible chat-completions endpoint with `stream: true` (Groq by default).

---

## Project structure

```
nexus-ai/
├── client/                 # React (CRA)
│   ├── public/
│   └── src/
│       ├── api/            # axios instance + endpoint functions
│       ├── components/     # Button, Card, Input, Textarea, Badge, Spinner,
│       │                   # EmptyState, Navbar, Footer, ToolCard, StreamOutput, icons
│       ├── context/        # AuthContext
│       ├── hooks/          # useAuth, useStream  ← SSE consumer
│       ├── pages/          # Landing, Login, Register, Tools, ToolPage, Dashboard, NotFound
│       └── utils/          # tools registry, formatters
└── server/                 # Express + Mongoose
    └── src/
        ├── config/         # db.js
        ├── controllers/    # auth, ai (SSE stream), usage
        ├── middleware/     # auth (JWT), errorHandler (SSE-aware), notFound
        ├── models/         # User, Usage
        ├── routes/         # auth, ai, usage
        ├── services/       # aiService (stream + mock), prompts
        ├── utils/          # asyncHandler, apiResponse
        ├── seed.js         # demo user + sample usage
        └── server.js
```

---

## Getting started

### Prerequisites
- Node.js **16.x** (`node -v` → v16) and npm 8
- MongoDB running locally (or a MongoDB Atlas URI)

### 1. Install
```bash
# from the project root
cd server && npm install
cd ../client && npm install
```

### 2. Configure env
```bash
# server
cp server/.env.example server/.env
# client
cp client/.env.example client/.env
```
Edit `server/.env`:
- `MONGO_URI` — your MongoDB connection string
- `JWT_SECRET` — any long random string
- `AI_API_KEY` — **leave blank for demo mode**, or add a key to stream real completions
  - `AI_BASE_URL` / `AI_MODEL` default to Groq; change them for OpenAI, Together, etc.
  - Model names change over time — set `AI_MODEL` to a model your provider currently offers.

### 3. (Optional) Seed a demo account
```bash
cd server
npm run seed
# → demo@nexus.ai / demo1234  (plus 14 days of sample usage for the dashboard)
```

### 4. Run both apps with one command
```bash
cd server
npm run dev        # concurrently starts the API (:5000) and the React client (:3000)
```
Open **http://localhost:3000**.

---

## Environment variables

**`server/.env`**
| Var | Description |
|---|---|
| `PORT` | API port (default 5000) |
| `CLIENT_URL` | Allowed CORS origin (default http://localhost:3000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | Token lifetime (default 7d) |
| `AI_API_KEY` | Provider key — blank = demo mode |
| `AI_BASE_URL` | OpenAI-compatible base URL (default Groq) |
| `AI_MODEL` | Model id (set to one your provider offers) |

**`client/.env`**
| Var | Description |
|---|---|
| `REACT_APP_API_URL` | Base URL of the Express API (default http://localhost:5000/api) |

---

## API reference

All non-streaming responses use the shared envelope:
```json
{ "success": true, "data": { }, "message": "" }
```

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Create account → `{ token, user }` |
| `POST` | `/api/auth/login` | — | Sign in → `{ token, user }` |
| `GET`  | `/api/auth/me` | ✅ | Current user |
| `GET`  | `/api/ai/status` | — | `{ live, model }` (is a real key configured) |
| `POST` | `/api/ai/:tool` | ✅ | **SSE stream** for `summarize` \| `paraphrase` \| `generate` |
| `GET`  | `/api/usage` | ✅ | Dashboard aggregates |
| `GET`  | `/api/health` | — | Health check |

### The streaming contract (`POST /api/ai/:tool`)
Request body: `{ "input": "…", "options": { } }`
Response is `text/event-stream`:
```
data: {"token":"Hello"}

data: {"token":" world"}

data: [DONE]
```
On failure mid-stream: `data: {"error":"…"}`.

---

## How streaming works (the lesson, in short)

1. The client `POST`s to `/api/ai/:tool` with `fetch` (so it can send the `Authorization` header — `EventSource` can't) and reads the response body via `getReader()`, decoding chunks and splitting on the SSE frame delimiter.
2. The server opens the provider stream with axios `responseType: 'stream'`, **re-buffers partial JSON frames** (a network chunk can split one in half), extracts `choices[0].delta.content`, and writes each token to the client as its own `data: {…}` frame.
3. The **API key never leaves the server** — that re-emission is the proxy.
4. On completion the server records a `Usage` row (tool, char counts, latency) for the dashboard.
5. No key configured → the same pipeline streams a canned response word-by-word, so the demo is fully functional offline.

---

## Notes & production hardening

- The JWT is stored in `localStorage` for portfolio simplicity; an `httpOnly` cookie set by the server is the more secure production choice.
- Cancelling a stream aborts the client request; wiring full upstream cancellation (closing the provider socket) would be the next step.
- Usage is metered in **characters**, not tokens — a provider-agnostic proxy for "work done" that also works in demo mode (no tokenizer needed).

---

## License

MIT — portfolio / educational use.
