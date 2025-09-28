FROM node:24-alpine3.21

WORKDIR /app/

COPY /.env /app/.env
COPY /package.json /app/package.json
COPY /package-lock.json /app/package-lock.json
COPY /tsconfig.json /app/tsconfig.json
COPY /src /app/src

RUN npm install
RUN npm run build

CMD [ "npm","run","start" ]
