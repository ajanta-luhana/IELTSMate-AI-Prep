# syntax=docker/dockerfile:1
FROM node:22-alpine
WORKDIR /app
# NEXT_PUBLIC_* values are baked into the browser bundle at build time.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json* ./
# Slow-internet friendly: long timeouts, many retries, persistent npm cache.
RUN --mount=type=cache,target=/root/.npm \
    npm config set fetch-retries 8 && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 && npm config set fetch-timeout 600000 \
    && npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
