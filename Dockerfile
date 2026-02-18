FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Build Next.js app
RUN bun run build

# Expose frontend port
EXPOSE 3000

# Run the app
CMD ["bun", "run", "start"]
