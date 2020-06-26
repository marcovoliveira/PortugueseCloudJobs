FROM node

RUN mkdir /var/app

WORKDIR /var/app

COPY . .

RUN npm config set package-lock false && npm install

EXPOSE 10001

# docker run

CMD ["node", "index.js"]