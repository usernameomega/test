FROM node:18 AS build
WORKDIR /usr/src/app
COPY package*.json tsconfig* ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-slim
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package*.json ./
RUN npm install

EXPOSE 3000
CMD [ "node", "dist/main.js" ]