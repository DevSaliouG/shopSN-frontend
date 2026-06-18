FROM node:20-alpine

WORKDIR /app

# Installer Angular CLI (version alignée sur le projet)
RUN npm install -g @angular/cli@21

# Copier les fichiers de dépendances en premier (cache Docker)
COPY package*.json ./
RUN npm install

# Copier le reste du code source
COPY . .

EXPOSE 4200

# Serveur de développement avec hot-reload
CMD ["ng", "serve", "--host", "0.0.0.0", "--poll=2000"]
