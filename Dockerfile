FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends chromium ca-certificates fonts-liberation && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
ENV CHROME_EXECUTABLE_PATH=/usr/bin/chromium
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY api ./api
COPY server.js index.html app.js style.css ./
USER node
EXPOSE 3000
CMD ["node","server.js"]
