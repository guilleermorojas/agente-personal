FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

RUN mkdir -p /app/data

ENV PORT=3000
ENV DB_PATH=/app/data/memory.json

EXPOSE ${PORT}

CMD ["npm", "run", "start"]
