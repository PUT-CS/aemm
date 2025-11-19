# Build from repository root: docker build -f author/core/Dockerfile .
# The common package is installed as a file: dependency via node_modules

FROM node:20-alpine AS base
WORKDIR /workspace
# Copy and build common so its dist exists for the file: dependency
COPY common/package.json common/package-lock.json ./common/
COPY common/src ./common/src/
COPY common/tsconfig.json ./common/
RUN cd common && npm ci && npm run build

FROM base AS development-dependencies
WORKDIR /workspace
COPY author/core/package.json author/core/package-lock.json ./author/core/
WORKDIR /workspace/author/core
RUN npm ci

FROM base AS production-dependencies
WORKDIR /workspace
COPY author/core/package.json author/core/package-lock.json ./author/core/
WORKDIR /workspace/author/core
RUN npm ci --omit=dev

FROM base AS build
WORKDIR /workspace/author/core
COPY author/core/ ./
COPY --from=development-dependencies /workspace/author/core/node_modules ./node_modules
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=build /workspace/author/core/package.json /workspace/author/core/package-lock.json ./
COPY --from=production-dependencies /workspace/author/core/node_modules ./node_modules
COPY --from=build /workspace/author/core/dist ./dist
COPY --from=base /workspace/common /common
EXPOSE 4501
CMD ["npm", "run", "start"]