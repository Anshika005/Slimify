# Use Node.js base image
FROM node:18

# Install Ghostscript
RUN apt-get update && apt-get install -y ghostscript && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the code
COPY . .

# Expose port
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
