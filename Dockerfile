FROM node:latest

WORKDIR /app

COPY src /app/

RUN npm install

EXPOSE 3000

RUN npm install pm2 -g

# Start the application with PM2
CMD ["pm2-runtime", "start", "npm", "--", "start"]
