# Build stage
FROM node:20-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage (Nginx)
FROM nginx:alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Copy custom nginx config if needed, otherwise default works for SPA if we add a simple fallback
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } location /api/ { proxy_pass http://backend:3000/api/; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
