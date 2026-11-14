FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json server.js index.html admin.html app.js admin.js style.css ./
USER node
EXPOSE 3000
CMD ["node","server.js"]
