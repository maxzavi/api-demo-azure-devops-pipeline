FROM --platform=linux/x86_64 node:lts-alpine
WORKDIR /usr/src/app
COPY "package.json" .
RUN npm install --production --silent && mv node_modules ../
COPY index.js .
EXPOSE 3000
RUN chown -R node /usr/src/app
USER node
CMD ["node", "index.js"]