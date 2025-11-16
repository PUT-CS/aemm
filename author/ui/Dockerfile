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
WORKDIR /app
COPY author/ui/package*.json ./
RUN npm ci --omit=dev

FROM base AS build
WORKDIR /app
COPY author/ui/ ./
COPY --from=development-dependencies /app/node_modules ./node_modules
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY author/ui/package*.json ./
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=build /app/build ./build
CMD ["npm", "run", "start"]