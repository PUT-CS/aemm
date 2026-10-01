# AEMM - AEM Mock

A content management system with backend API and frontend authoring UI.

## Quick Start

### Install Dependencies

```bash
# Build common package first
cd common && npm install && npm run build

# Install core dependencies (creates symlink to common)
cd ../author/core && npm install

# Install ui dependencies (creates symlink to common)
cd ../author/ui && npm install
```

### Configuration

Core reads its settings from `author/core/.env`:

```bash
JWT_SECRET=change-me
ADMIN_PASSWORD=change-me-too
CONTENT_ROOT=../../content
```

Optional: `PORT` (default `4501`), `DATABASE_PATH` (default `data/core.sqlite`), `JWT_EXPIRES_IN` (default `1h`), `MAX_UPLOAD_SIZE` (default `25mb`).

On first start core creates the user `admin` with the password from `ADMIN_PASSWORD`. It's only read when that user doesn't exist yet, change the password from the admin panel afterwards.

### Build & Run

```bash
# From root directory
npm run watch:common   # Terminal 1: Watch common for changes
npm run dev:core       # Terminal 2: Run backend (port 4501)
npm run dev:ui         # Terminal 3: Run frontend (port 4502)
```

## Project Structure

- **common/** - Shared TypeScript types (`@aemm/common`)
- **author/core/** - Express.js REST API backend
- **author/ui/** - React Router frontend application
- **e2e/** - Playwright API tests for the backend

Each project is independent with its own `package.json` and `node_modules`.

## How It Works

The `common` package is installed as a local dependency using npm's `file:` protocol:

```json
{
  "dependencies": {
    "@aemm/common": "file:../../common"
  }
}
```

This creates a symlink: `node_modules/@aemm/common` → `../../common`

Import like any other package:

```typescript
import { ScrNode, NodeType } from "@aemm/common/scr";
```

## Available Scripts

The same commands are available through [Task](https://taskfile.dev) (`task --list`), together with `task install`, `task lint`, `task typecheck` and `task ci`, which runs the same checks as CI.

### Build Commands

- `npm run build` - Build all projects (common → core → ui)
- `npm run build:common` - Build shared types
- `npm run build:core` - Build backend
- `npm run build:ui` - Build frontend

### Development Commands

- `npm run watch:common` - Watch common for changes
- `npm run dev:core` - Run backend dev server
- `npm run dev:ui` - Run frontend dev server

### Production Commands

- `npm run start:core` - Start backend server
- `npm run start:ui` - Start frontend server

## Tech Stack

- **Backend:** Express.js, TypeScript, Node.js
- **Frontend:** React Router v7, Vite, TailwindCSS, TypeScript
- **Shared:** npm file: dependencies

## E2E Tests

```bash
cd e2e && npm install
cd .. && npm run test:e2e
```

Playwright builds the author core Docker image and starts it on port 4599 with a copy of `e2e/data/content` and a fresh database. Set `E2E_BASE_URL` to run against an already running backend instead.

Tests get API clients from `e2e/fixtures.ts`: `anonymous`, `admin` and `editor` (a new editor user for each test). Clients return the raw response, pass `headers` or `data` to override what is sent.

Seed content and the `admin` user are shared by all tests, don't modify them. Tests that change data create their own in `beforeEach` with helpers from `e2e/data/factory.ts`.
