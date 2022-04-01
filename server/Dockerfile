FROM node:14

# Create app directory
WORKDIR /home/intval/util/V2

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Run NPM build
RUN npm install

# Bundle app source
COPY . .

EXPOSE 8083

CMD [ "node", "index.js" ]
