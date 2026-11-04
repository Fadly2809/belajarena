FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install && npm --prefix apps/api install
ENV PORT=8000
ENV NODE_ENV=production
EXPOSE 8000
CMD ["node", "apps/api/server.mjs"]

