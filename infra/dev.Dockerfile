FROM node:22-alpine
WORKDIR /workspace
COPY package.json ./
COPY package-lock.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY services/problem-api/package.json ./services/problem-api/package.json
COPY services/project-api/package.json ./services/project-api/package.json
COPY packages/contracts/package.json ./packages/contracts/package.json
RUN npm ci
COPY . .
EXPOSE 5173 4101 4102
CMD ["sh", "-c", "npm run dev --workspace=$WORKSPACE"]

