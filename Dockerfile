# Docker file for building a node image with the lts version of node

# Use the official node image
FROM node:lts-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files
COPY package.json /usr/src/app/
COPY package-lock.json /usr/src/app/

# Install dependencies
RUN npm install

# Copy the rest of the files
COPY . .

# Expose the port
EXPOSE 3000

# Start the server
CMD [ "npm", "start" ]