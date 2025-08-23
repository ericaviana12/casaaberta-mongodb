// server.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

const client = new MongoClient(process.env.MONGO_URI)
let db

async function connectDB() {
  await client.connect()
  db = client.db('senac')
  console.log('MongoDB conectado!')

  // Criar índice único no CPF para garantir duplicidade
  await db.collection('presencas').createIndex({ cpf: 1 }, { unique: true })
  console.log('Índice único de CPF criado!')
}
connectDB()

// ===== Registrar presença =====
app.post('/api/presenca', async (req, res) => {
  let { nome, dataNascimento, cpf, email } = req.body
  if (!nome || !dataNascimento || !cpf || !email) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios!' })
  }

  try {
    // Padronizar CPF: somente números
    cpf = cpf.replace(/\D/g, '')

    // Inserir no banco
    const resultado = await db.collection('presencas').insertOne({
      nome,
      dataNascimento,
      cpf,
      email,
      criadoEm: new Date()
    })

    res.json({ message: 'Presença registrada com sucesso!', id: resultado.insertedId })

  } catch (err) {
    console.error(err)

    // Verifica erro de duplicidade do MongoDB
    if (err.code === 11000 && err.keyPattern && err.keyPattern.cpf) {
      return res.status(400).json({ error: 'CPF já cadastrado.' })
    }

    res.status(500).json({ error: 'Erro ao registrar presença.' })
  }
})

// ===== Registrar feedback =====
app.post('/api/feedback', async (req, res) => {
  let { nome, comentario, estrelas } = req.body
  if (!estrelas) return res.status(400).json({ error: 'Estrelas são obrigatórias!' })
  nome = nome || 'Anônimo'
  comentario = comentario || 'Sem comentário'

  try {
    const resultado = await db.collection('feedbacks').insertOne({
      nome,
      comentario,
      estrelas,
      criadoEm: new Date()
    })
    res.json({ message: 'Feedback enviado com sucesso!', id: resultado.insertedId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao registrar feedback.' })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))