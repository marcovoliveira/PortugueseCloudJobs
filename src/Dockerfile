
FROM node

RUN mkdir -p /var/app

WORKDIR /var/app

COPY ./ ./

RUN npm install

RUN npm install -g nodemon

EXPOSE 5000

CMD ["node", "backend/index.js" ]
