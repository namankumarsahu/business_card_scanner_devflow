# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-build

WORKDIR /fe

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


# Stage 2: Build the NestJS backend (Debian/glibc so onnxruntime-node works)
FROM node:20-slim AS backend-build

WORKDIR /app

# Skip the huge GPU (CUDA) download that onnxruntime-node tries on Linux x64
ENV ONNXRUNTIME_NODE_INSTALL_CUDA=skip

COPY backend/package*.json ./

# Be patient with flaky network connections
RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm ci

COPY backend/ ./
RUN npm run build

# Keep only production dependencies in the final image
RUN npm prune --omit=dev


# Stage 3: Production image
FROM node:20-slim AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=backend-build /app/package.json ./package.json
COPY --from=backend-build /app/node_modules ./node_modules
COPY --from=backend-build /app/dist ./dist

# Copy the compiled React app into the backend container
COPY --from=frontend-build /fe/dist ./public

EXPOSE 3001

CMD ["node", "dist/main.js"]