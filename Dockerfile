FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy application files
COPY standup.js ./

# Create output directory
RUN mkdir -p /output

# Run the script
CMD ["node", "standup.js"]