# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy all files
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Start Vite development server with host flag
CMD ["npm", "run", "dev", "--", "--host"]