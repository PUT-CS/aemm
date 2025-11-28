# Build from repository root: docker build -f author/ui/Dockerfile .
# The common package is installed as a file: dependency via node_modules

FROM node:20-alpine AS base
WORKDIR /workspace
# Copy common package (needed for file: dependency)
COPY common/package.json common/package-lock.json ./common/
COPY common/src ./common/src/
COPY common/tsconfig.json ./common/
RUN cd common && npm install && npm run build

FROM base AS development-dependencies
WORKDIR /workspace
COPY author/ui/package.json author/ui/package-lock.json ./author/ui/
WORKDIR /workspace/author/ui
RUN npm ci

FROM base AS production-dependencies
WORKDIR /workspace
COPY author/ui/package.json author/ui/package-lock.json ./author/ui/
WORKDIR /workspace/author/ui
RUN npm ci --omit=dev

FROM base AS build
WORKDIR /workspace/author/ui
COPY author/ui/ ./
COPY --from=development-dependencies /workspace/author/ui/node_modules ./node_modules
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=build /workspace/author/ui/package.json /workspace/author/ui/package-lock.json ./
COPY --from=production-dependencies /workspace/author/ui/node_modules ./node_modules
COPY --from=build /workspace/author/ui/build ./build
CMD ["npm", "run", "start"]