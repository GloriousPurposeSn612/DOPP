# =========================================================
# DOPP Class Registration
# Dockerfile
# =========================================================

# Use Node.js 24 on Alpine Linux.
# This keeps the container runtime consistent with the
# Node.js version currently used in our Jenkins environment.
FROM node:24-alpine

# All application files will be placed inside /app.
WORKDIR /app

# Copy the files required by the Node.js application.
COPY server.js ./
COPY database.json ./
COPY package.json ./
COPY public ./public

# Document the port used by the Node.js server.
EXPOSE 3000

# Start the DOPP application.
CMD ["node", "server.js"]