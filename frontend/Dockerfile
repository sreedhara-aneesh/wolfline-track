FROM node:16.19.0
WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install
RUN npm install -g serve@14.1.2

COPY . .
RUN npm run build

CMD serve -s build -l 3000