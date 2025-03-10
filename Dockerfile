FROM node:20-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY . .

RUN npm install

RUN npm run build

RUN npx prisma generate

RUN npx prisma migrate deploy

EXPOSE 3001

CMD ["npm", "start"]