# Use Node.js as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

# Expose the port the app runs on
EXPOSE 8080

# Start the Fastify server
CMD ["node", "index.js"]
