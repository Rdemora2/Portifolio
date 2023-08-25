# Use uma imagem base do Node.js
FROM node:14

# Diretório de trabalho dentro do contêiner
WORKDIR /app/frontend

# Copie o código fonte
COPY package*.json /app/frontend
RUN npm install

# Copie os arquivos do projeto
COPY . /app/

# Porta que o React estará escutando
EXPOSE 3000

# Comando para iniciar o aplicativo
CMD ["npm", "start"]
