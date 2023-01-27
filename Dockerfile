# Собираем ораз image
# image with node & linux alpine (node.js  поверх alpine)
FROM node:14.16.1-alpine
# Рабочая директория внутри image
WORKDIR /server
# Копирую package.json впапку ./server имиджа
COPY ./package.json .
# Устанавливаю на голый сервер node modules(node и npm уже установлены)
RUN npm install
# Копируювсе с робочей дирректории в которой лежит Dokerfile в папку /serveк
#Чтобы прокинуть секретные ключи и переменные используется синтаксис (на девелопменте не используем)
# ENV JWT_SECRET=secret
COPY . .
# Прокидываем наше приложение во вне, делаем доступным порт 8080 внашем image
EXPOSE 3000
# Запускаєм наше приложение командой из файла package.json
CMD npm start