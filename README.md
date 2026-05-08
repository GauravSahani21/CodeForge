# CodeForge 🔥
live: https://codeforge-xqpz.onrender.com/
> A LeetCode-style coding platform with a full online compiler, structured learning hub, and GitHub-style streak tracking.

## Features
- ✅ **Full-code challenges** — write `main()` + logic, not just function stubs
- ✅ **Online IDE** — run any code in 13+ languages (Python, C++, Java, JS, Go, Rust, etc.)
- ✅ **No copy-paste** — Monaco editor blocks all paste events
- ✅ **Streak activity graph** — GitHub-style heatmap on user profiles
- ✅ **Learning Hub** — structured courses from scratch
- ✅ **Leaderboard** — ranked by problems solved and streaks
- ✅ **Free code execution** — powered by [Piston API](https://github.com/engineer-man/piston) (no API key needed)
- ✅ **JWT auth** — bcrypt passwords, no third-party auth needed

## Tech Stack
| Layer | Tech |
|---|---|
| Frontend | Next.js 14, TypeScript, Vanilla CSS |
| Code Editor | @monaco-editor/react (VS Code engine) |
| Streak Graph | react-activity-calendar |
| Backend | Express + TypeScript |
| Database | MongoDB + Redis |
| Code Execution | Piston API (free, open-source) |
| Auth | JWT + bcrypt |

## Quick Start

### 1. Prerequisites
- Node.js v18+
- Docker Desktop (for MongoDB + Redis)
- Run this once to fix npm permissions: `sudo chown -R $(whoami) ~/.npm`

### 2. Start databases
```bash
docker-compose up -d
```

### 3. Start backend
```bash
cd server
npm install
npm run dev
```

### 4. Seed demo problems (first time only)
```bash
cd server
npx ts-node src/seed.ts
```
This creates:
- Admin user: `admin@codeforge.dev` / `Admin@12345`
- 4 demo problems (Hello World, Sum, Fibonacci, Word Frequencies)

### 5. Start frontend
```bash
cd client
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure
```
codeforge/
├── client/                  # Next.js 14 frontend
│   └── src/
│       ├── app/             # Pages (App Router)
│       │   ├── page.tsx              # Landing
│       │   ├── problems/             # Problem list + solve page
│       │   ├── ide/                  # Online IDE
│       │   ├── learn/                # Learning hub
│       │   ├── profile/[username]/  # User profile + streak
│       │   ├── leaderboard/         # Rankings
│       │   └── auth/                 # Login + Signup
│       ├── components/
│       │   ├── Editor/               # Monaco, LanguageSelector, OutputPanel
│       │   └── Layout/               # Navbar
│       ├── lib/             # Axios API client
│       └── store/           # Zustand auth store
│
├── server/                  # Express + TypeScript backend
│   └── src/
│       ├── models/          # Mongoose models (User, Problem, Submission, Course)
│       ├── controllers/     # Business logic
│       ├── routes/          # API routes
│       ├── services/        # Piston API execution service
│       ├── middleware/       # JWT auth, error handler
│       └── seed.ts          # Demo data seeder
│
└── docker-compose.yml       # MongoDB + Redis services
```

## API Endpoints
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | /api/auth/signup | — | Register |
| POST | /api/auth/login | — | Login |
| GET | /api/auth/me | ✅ | Get current user |
| GET | /api/problems | — | List problems |
| GET | /api/problems/:slug | — | Get problem |
| POST | /api/problems | Admin | Create problem |
| POST | /api/execute | — | Run code (Piston) |
| POST | /api/submissions | ✅ | Submit solution |
| GET | /api/submissions | ✅ | Get user submissions |
| GET | /api/users/leaderboard | — | Leaderboard |
| GET | /api/users/:username | — | User profile |
| GET | /api/users/:username/activity | — | Streak data |
| GET | /api/learn | — | Course list |
| GET | /api/learn/:slug | — | Course detail |

## Anti Copy-Paste
The Monaco editor blocks:
- `Ctrl+V` / `Cmd+V` via key binding override
- Paste events via `editor.onDidPaste` (undo + toast notification)
- DOM-level paste events on the container element
- Right-click context menu

## Adding Problems (Admin)
Login as admin → Use the API:
```bash
curl -X POST http://localhost:5000/api/problems \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{ "title": "...", "slug": "...", ... }'
```
Then publish:
```bash
curl -X PATCH http://localhost:5000/api/problems/<id>/publish \
  -H "Authorization: Bearer <admin_token>"
```
