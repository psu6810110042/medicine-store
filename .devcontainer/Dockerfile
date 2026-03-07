FROM node:24-bookworm

# ==============================================================================
# UNIVERSAL TOOLING BLOCK 
# ==============================================================================
USER root
RUN set -e; \
    echo "=== Detecting Package Manager and Installing Dependencies ==="; \
    if command -v apt-get >/dev/null 2>&1; then \
    export DEBIAN_FRONTEND=noninteractive; \
    apt-get update; \
    apt-get install -y curl wget git build-essential zsh ripgrep fd-find unzip sudo tar; \
    ln -sf $(which fdfind) /usr/local/bin/fd || true; \
    rm -rf /var/lib/apt/lists/*; \
    elif command -v apk >/dev/null 2>&1; then \
    apk add --no-cache curl wget git build-base zsh ripgrep fd unzip sudo tar coreutils gcompat; \
    elif command -v dnf >/dev/null 2>&1; then \
    dnf install -y curl wget git gcc gcc-c++ zsh ripgrep fd-find unzip sudo tar; \
    dnf clean all; \
    else \
    echo "Unsupported package manager. Please use Debian, Alpine, or Fedora based images."; \
    exit 1; \
    fi; \
    \
    echo "=== Installing Neovim (v0.11.6) ==="; \
    curl -LO https://github.com/neovim/neovim/releases/download/v0.11.6/nvim-linux-x86_64.tar.gz; \
    tar -C /usr/local -xzf nvim-linux-x86_64.tar.gz; \
    rm nvim-linux-x86_64.tar.gz; \
    ln -sf /usr/local/nvim-linux-x86_64/bin/nvim /usr/local/bin/nvim; \
    \
    echo "=== Installing Lazygit (v0.40.2) ==="; \
    LAZYGIT_VERSION="0.40.2"; \
    DIR="/tmp/lazygit"; mkdir -p $DIR; \
    curl -L "https://github.com/jesseduffield/lazygit/releases/download/v${LAZYGIT_VERSION}/lazygit_${LAZYGIT_VERSION}_Linux_x86_64.tar.gz" -o $DIR/lazygit.tar.gz; \
    tar xf $DIR/lazygit.tar.gz -C $DIR; \
    install $DIR/lazygit /usr/local/bin/; \
    rm -rf $DIR; \
    \
    echo "=== Installing Starship ==="; \
    curl -sS https://starship.rs/install.sh | sh -s -- --yes
# ==============================================================================
# PROJECT SPECIFIC SETUP 
# ==============================================================================

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
