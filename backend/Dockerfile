FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run prisma:generate

EXPOSE 3000

CMD ["sh", "-c", "npm run prisma:deploy && npm run db:seed && npm run dev"]
