# pull official base image
FROM node:18-alpine
# RUN apk add g++ make py3-pip

# set working directory
WORKDIR /app



# install app dependencies
COPY package.json ./
COPY package-lock.json ./
COPY tailwind.config.js ./
RUN npm install --silent
RUN npm install react-scripts@3.4.1 -g --silent

# add app
COPY . ./

# start app
CMD ["npm", "start"]