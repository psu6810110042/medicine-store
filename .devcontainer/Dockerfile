FROM node:24-bookworm

WORKDIR /workspace
RUN chown node:node /workspace

USER node

COPY --chown=node:node backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm install

COPY --chown=node:node frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm install

COPY --chown=node:node e2e/package.json e2e/package-lock.json ./e2e/
RUN cd e2e && npm install

USER root
RUN cd e2e && npx playwright install-deps

USER node
RUN cd e2e && npx playwright install
