# Use the official Node.js 14 image as a parent image
FROM node:14

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application's code
COPY . .

# Expose the port the app runs on
EXPOSE 3002

# Command to run your app
CMD ["node", "app.js"]
