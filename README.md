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

Or run the setup script:

```bash
./setup.sh
```

### Build & Run

```bash
# From root directory
npm run watch:common   # Terminal 1: Watch common for changes
npm run dev:core       # Terminal 2: Run backend (port 3000)
npm run dev:ui         # Terminal 3: Run frontend (port 4502)
```

## Project Structure

- **common/** - Shared TypeScript types (`@aemm/common`)
- **author/core/** - Express.js REST API backend
- **author/ui/** - React Router frontend application

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
import { ScrNode, ScrType } from "@aemm/common/scr";
```

## Available Scripts

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

## Documentation

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed documentation.

## Tech Stack

- **Backend:** Express.js, TypeScript, Node.js
- **Frontend:** React Router v7, Vite, TailwindCSS, TypeScript
- **Shared:** npm file: dependencies
