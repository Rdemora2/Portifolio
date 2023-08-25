# Use uma imagem base do Python
FROM python:3.11

# Configuração do ambiente
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Diretório de trabalho dentro do contêiner
WORKDIR /app/backend

# Instale as dependências
COPY requirements.txt /app/backend/
RUN pip install -r requirements.txt

# Copie o código fonte
COPY . /app/backend/

# Porta que o Django estará escutando
EXPOSE 8000

# Comando para iniciar o servidor
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
