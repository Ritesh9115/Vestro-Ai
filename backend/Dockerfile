FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies only when package files change
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Final image
FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S vestro -u 1001
USER vestro

EXPOSE 3001
CMD ["node", "app.js"]
