# 🎉 Casa Aberta - Sistema de presenças e feedbacks

Sistema desenvolvido para o evento **Casa Aberta** do **Senac Tatuapé**, com o objetivo de registrar presenças e coletar feedbacks dos participantes.

O projeto utiliza **Node.js + Express** com **MongoDB Atlas** e está deployado na **Vercel**, permitindo acesso em qualquer dispositivo conectado à internet.

---

## 📖 Sobre

Este sistema foi criado para o evento **Casa Aberta**, realizado no Senac Tatuapé, permitindo:

- Registro de **presenças** via formulário digital.  
- Coleta de **feedbacks** em tempo real.  
- Conexão com **MongoDB Atlas** para armazenamento seguro em nuvem.  
- Deploy contínuo via **Vercel**, facilitando acesso de qualquer lugar.

---

## 🛠 Tecnologias

- **Node.js** (runtime JavaScript)  
- **Express.js** (servidor HTTP e APIs)  
- **MongoDB Atlas** (banco de dados em nuvem)  
- **dotenv** (configuração de variáveis de ambiente)  
- **CORS** (controle de requisições entre domínios)  
- **Vercel** (deploy do frontend e backend)

---

## 👥 Equipe

- **Erica Viana** (autora principal)  
- Bruno Dorea  
- Elen Grecco  
- Gabriel Coutinho  
- Gustavo Nunes  

---

## 📦 Pré-requisitos

Antes de rodar localmente, você precisa ter instalado:

- [Node.js](https://nodejs.org/) (versão 18+ recomendada)  
- npm (ou yarn)  
- Conta no [MongoDB Atlas](https://www.mongodb.com/atlas/database)  

---

## ⚙️ Instalação

Clone este repositório:
git clone https://github.com/ericaviana12/casaaberta-mongodb.git   
cd casaaberta-mongodb

Instale as dependências:
npm install

Configure as variáveis de ambiente criando um arquivo .env na raiz:
MONGO_URI=sua_string_de_conexao_do_mongodb   
PORT=3000

Execute o servidor localmente:
node server.js

## 🚀 Deploy

O sistema está hospedado em:   
Frontend & Backend: Vercel   
Banco de dados: MongoDB Atlas   
Cada push no repositório dispara automaticamente o build no Vercel.   

## 💻 Uso

Acesse o link do deploy no Vercel.   
Preencha o formulário para registrar presença.   
Os dados são salvos diretamente no MongoDB Atlas.   
É possível também enviar feedbacks, exibidos em tempo real.   

# ✅ Boas Práticas

Nunca versionar o arquivo .env   
Usar variáveis de ambiente para credenciais sensíveis   
Testar endpoints no Postman/Insomnia antes do deploy   
Validar entradas do usuário no backend   
Utilizar branches (feature/..., fix/...) para novas implementações   

# 🤝 Contribuição

Contribuições são bem-vindas!

Para colaborar:   
Faça um fork do projeto.   
Crie uma branch: git checkout -b feature/nova-funcionalidade   
Commit suas mudanças: git commit -m 'Adiciona nova funcionalidade'   
Envie um push para a branch: git push origin feature/nova-funcionalidade   
Abra um Pull Request.   

# 📄 Licença

Este projeto está sob a licença MIT.