FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY packages/shared/package.json packages/shared/
COPY api/package.json api/
RUN npm install --workspace=@interdependency/shared --workspace=@interdependency/api

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/api/node_modules ./api/node_modules
COPY package.json ./
COPY packages/shared ./packages/shared
COPY api ./api
COPY data ./data
RUN npm run build --workspace=@interdependency/shared && npm run build --workspace=@interdependency/api

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8787
ENV HOST=0.0.0.0
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/shared ./packages/shared
COPY --from=build /app/api/package.json ./api/package.json
COPY --from=build /app/api/dist ./api/dist
COPY --from=build /app/api/node_modules ./api/node_modules
COPY --from=build /app/data ./data
RUN mkdir -p /app/api/cache
EXPOSE 8787
CMD ["node", "api/dist/index.js"]
