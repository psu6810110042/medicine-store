FROM node:24-alpine

RUN apk add --no-cache tmux

WORKDIR /workspace
RUN chown node:node /workspace

USER node

COPY --chown=node:node backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm install

COPY --chown=node:node frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm install
