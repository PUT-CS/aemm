# Build from repository root: docker build -f author/ui/Dockerfile .
# The common package is installed as a file: dependency via node_modules

FROM node:20-alpine AS base
WORKDIR /workspace
# Copy common package (needed for file: dependency)
COPY common/ ./common/

FROM base AS development-dependencies
WORKDIR /app
COPY author/ui/package*.json ./
RUN npm ci

FROM base AS production-dependencies
WORKDIR /workspace
COPY author/ui/package.json author/ui/package-lock.json ./author/ui/
WORKDIR /app
COPY author/ui/package*.json ./
FROM base AS build
WORKDIR /workspace/author/ui
COPY author/ui/ ./
COPY --from=development-dependencies /workspace/author/ui/node_modules ./node_modules
WORKDIR /app

FROM node:20-alpine AS runtime
COPY --from=development-dependencies /app/node_modules ./node_modules
COPY --from=build /workspace/author/ui/package.json /workspace/author/ui/package-lock.json ./
COPY --from=production-dependencies /workspace/author/ui/node_modules ./node_modules
COPY --from=build /workspace/author/ui/build ./build
CMD ["npm", "run", "start"]