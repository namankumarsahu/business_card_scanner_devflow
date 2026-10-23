
# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-build

WORKDIR /fe

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


# Stage 2: Build the NestJS backend
# FROM node:20-alpine AS backend-build
FROM node:20-slim AS backend-build

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./
RUN npm run build

# Keep only production dependencies in the final image
RUN npm prune --omit=dev


# Stage 3: Production image
# FROM node:20-alpine AS production
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
