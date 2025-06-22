# Dockerfile for Asteroids game using Vite
FROM node:20-alpine

# Update Alpine packages to reduce vulnerabilities
RUN apk update && apk upgrade --no-cache

WORKDIR /app
COPY package.json vite.config.js ./
RUN npm install
COPY . .

RUN npm run build

EXPOSE 5000

CMD ["npm", "run", "preview", "--", "--port", "5000", "--host"]
