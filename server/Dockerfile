FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

FROM base AS development
CMD ["npm", "run", "dev"]

FROM node:20-alpine AS production
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=base /app/src ./src
COPY --from=base /app/kafka ./kafka
USER node
EXPOSE 5000
CMD ["npm", "start"]
