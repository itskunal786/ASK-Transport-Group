# ==============================================================================
# ASK TRANSPORT GROUP - REACT 19 + VITE PRODUCTION DOCKERFILE
# ==============================================================================

# Stage 1: Build Frontend Assets
FROM node:22-alpine AS build
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
RUN npm ci

# Copy application source code
COPY . .

# Build production bundle
RUN npm run build

# ==============================================================================
# Stage 2: Serve via High-Performance Nginx Alpine
# ==============================================================================
FROM nginx:alpine AS final

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
