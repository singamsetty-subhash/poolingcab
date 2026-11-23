# ==============================================================================
# Multi-Stage Production Dockerfile for Commonway
# Unified Full-Stack Container (Frontend + Backend)
# Compatible with Render, Railway, Fly.io, AWS, and Docker Desktop
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Frontend (Vite / React)
# ------------------------------------------------------------------------------
FROM node:22-alpine AS frontend-builder
WORKDIR /web

# Install dependencies with npm ci for clean, deterministic builds
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source files
COPY frontend/ ./

# Build production bundle using relative /api path for same-origin requests
ARG VITE_API_URL=/api
ARG VITE_MAPS_PROVIDER=openstreetmap
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_MAPS_PROVIDER=$VITE_MAPS_PROVIDER
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Build Backend with Embedded Frontend Static Assets
# ------------------------------------------------------------------------------
FROM maven:3.9.9-eclipse-temurin-17 AS backend-builder
WORKDIR /app

# Cache Maven dependencies
COPY backend/pom.xml ./
RUN mvn -q dependency:go-offline || true

# Copy backend source code
COPY backend/src ./src

# Embed compiled frontend assets into Spring Boot static resource directory
COPY --from=frontend-builder /web/dist ./src/main/resources/static

# Build production jar
RUN mvn -q -DskipTests clean package

# ------------------------------------------------------------------------------
# Stage 3: Lightweight Production JRE Runtime
# ------------------------------------------------------------------------------
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy application jar from builder stage
COPY --from=backend-builder /app/target/rideshare-api-1.0.0.jar app.jar

# Dynamic Port Binding (Render dynamically assigns $PORT, defaults to 8080)
ENV PORT=8080
EXPOSE 8080

# Production JVM entrypoint
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/app/app.jar"]
