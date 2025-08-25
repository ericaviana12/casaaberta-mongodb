import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'
import http from 'http'
import { Server } from 'socket.io'

dotenv.config()
const app = express()
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: "*" } })

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

    // Emitir evento para dashboard
    const idade = new Date().getFullYear() - new Date(dataNascimento).getFullYear()
    io.emit('novo-participante', { nome, idade })

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

    // Emitir evento para dashboard
    io.emit('novo-feedback', { nome, comentario, estrelas })

    res.json({ message: 'Feedback enviado com sucesso!', id: resultado.insertedId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao registrar feedback.' })
  }
})

// ===== Estatísticas para o dashboard =====
app.get('/api/estatisticas', async (req, res) => {
  try {
    const totalParticipantes = await db.collection('presencas').countDocuments()

    const participantes = await db.collection('presencas').find().toArray()
    const faixas = { 'Menores de 18': 0, '18-25': 0, '26-35': 0, '36-50': 0, '50+': 0 }
    participantes.forEach(p => {
      const idade = new Date().getFullYear() - new Date(p.dataNascimento).getFullYear()
      if (idade < 18) faixas['Menores de 18']++
      else if (idade <= 25) faixas['18-25']++
      else if (idade <= 35) faixas['26-35']++
      else if (idade <= 50) faixas['36-50']++
      else faixas['50+']++
    })

    const feedbacks = await db.collection('feedbacks').find().sort({ criadoEm: -1 }).limit(10).toArray()
    const distEstrelas = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    let somaEstrelas = 0
    let totalFeedbacks = 0
    const todosFeedbacks = await db.collection('feedbacks').find().toArray()
    todosFeedbacks.forEach(f => {
      distEstrelas[f.estrelas]++
      somaEstrelas += f.estrelas
      totalFeedbacks++
    })
    const mediaEstrelas = totalFeedbacks ? (somaEstrelas / totalFeedbacks).toFixed(2) : 0

    res.json({
      totalParticipantes,
      faixasEtarias: faixas,
      totalFeedbacks,
      feedbacksPorEstrela: distEstrelas,
      mediaEstrelas,
      ultimosFeedbacks: feedbacks
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao buscar estatísticas.' })
  }
})

// ===== Socket.io conexão =====
io.on('connection', (socket) => {
  console.log('Dashboard conectado:', socket.id)
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))