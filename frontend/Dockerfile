FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN rm -f package-lock.json && npm install

ARG VITE_API_BASE_URL
ARG VITE_APP_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_BASE_URL=$VITE_APP_BASE_URL
ENV NODE_ENV=production

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx \
    /var/log/nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html

EXPOSE 80
USER nginx
CMD ["nginx", "-g", "daemon off;"]
