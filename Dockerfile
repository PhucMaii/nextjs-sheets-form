# # Install dependencies only when needed
# FROM node:18-alpine AS deps
# WORKDIR /app
# COPY package.json package-lock.json ./
# RUN npm install

# # Rebuild the source code only when needed
# FROM node:18-alpine AS builder
# WORKDIR /app
# COPY . .
# COPY --from=deps /app/node_modules ./node_modules
# RUN npm run build

# # Production image, copy all the files and run next
# FROM node:18-alpine AS runner
# WORKDIR /app

# # Copy the Next.js build output
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package.json ./package.json

# EXPOSE 3000

# CMD ["npm", "run", "dev"]

# Use a more standard Node.js image.
FROM node:18

# Create and change to the app directory.
WORKDIR /app

# Install dependencies.
COPY package*.json ./
RUN npm install

# Copy the rest of the application.
COPY . .

# Rebuild native modules.
RUN npm rebuild

# Expose the port the app runs on.
EXPOSE 3000

# Start the app in development mode.
CMD ["npm", "run", "dev"]
