FROM node:14-alpine

# update packages
RUN apk update
RUN apk add --no-cache tzdata
ENV TZ Asia/Jakarta

# create root application folder
WORKDIR /app

# copy configs to /app folder
COPY package*.json ./
COPY tsconfig.json ./
COPY firebase.json ./
# copy source code to /app/src folder
COPY src /app/src

# check files list
RUN ls -all

RUN npm cache clean --force
RUN npm install --no-package-lock
RUN npm run build

EXPOSE 8082

CMD [ "node", "./build/server.js" ]
