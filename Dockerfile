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
# Write nginx config with HTTPS support and reverse proxy for API
RUN printf 'server {\n  listen 80;\n  server_name doctorjo.net www.doctorjo.net;\n  return 301 https://$host$request_uri;\n}\nserver {\n  listen 443 ssl;\n  server_name doctorjo.net www.doctorjo.net;\n  ssl_certificate /etc/letsencrypt/live/doctorjo.net/fullchain.pem;\n  ssl_certificate_key /etc/letsencrypt/live/doctorjo.net/privkey.pem;\n  location / {\n    root /usr/share/nginx/html;\n    index index.html;\n    try_files $uri $uri/ /index.html;\n  }\n  location /api/ {\n    proxy_pass http://backend:3000/api/;\n    proxy_set_header Host $host;\n    proxy_set_header X-Real-IP $remote_addr;\n  }\n}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
