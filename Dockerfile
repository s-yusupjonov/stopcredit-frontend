# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# VITE_* qiymatlari build vaqtida bundle ichiga yoziladi (runtime'da o'zgartirib bo'lmaydi).
# Default '/api' — nginx quyida API_UPSTREAM ga proxy qiladi (same-origin).
ARG VITE_API_BASE_URL=/api
ARG VITE_APP_NAME=StopCredit
ARG VITE_REVIEW_DEADLINE_DAYS=3
ARG VITE_MAX_UPLOAD_SIZE_MB=20
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_APP_NAME=$VITE_APP_NAME \
    VITE_REVIEW_DEADLINE_DAYS=$VITE_REVIEW_DEADLINE_DAYS \
    VITE_MAX_UPLOAD_SIZE_MB=$VITE_MAX_UPLOAD_SIZE_MB

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Serve stage ----
FROM nginx:1.27-alpine
# Backend manzili runtime'da beriladi: docker run -e API_UPSTREAM=http://backend:8080
ENV API_UPSTREAM=http://backend:8080
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
