FROM node:22-slim AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install -g @angular/cli@19.2.0
RUN npm install
COPY . .
RUN ng build --configuration production

FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist/sistema-votacao/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 4200
CMD ["nginx", "-g", "daemon off;"]
