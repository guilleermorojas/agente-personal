FROM node:20-slim

WORKDIR /app

# Install build dependencies for better-sqlite3 (optional, slim version might need it)
# RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

# Ensure the database is persisted in a volume
VOLUME /app/data

# Environment variable for DB path
ENV DB_PATH=/app/data/memory.json

CMD ["npm", "run", "start"]
