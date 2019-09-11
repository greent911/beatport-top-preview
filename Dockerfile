FROM node:8
COPY . .
RUN npm install
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
RUN npm run build
CMD npm start