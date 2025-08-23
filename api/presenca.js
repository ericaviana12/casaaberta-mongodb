import { MongoClient } from 'mongodb'

const uri = process.env.MONGO_URI
const client = new MongoClient(uri)
let cachedDb = null

async function connectDB() {
  if (cachedDb) return cachedDb
  await client.connect()
  cachedDb = client.db('senac')
  return cachedDb
}

export default async function handler(req, res) {
  const db = await connectDB()

  if (req.method === 'POST') {
    let { nome, dataNascimento, cpf, email } = req.body
    if (!nome || !dataNascimento || !cpf || !email) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios!' })
    }
    cpf = cpf.replace(/\D/g, '')
    try {
      const resultado = await db.collection('presencas').insertOne({
        nome,
        dataNascimento,
        cpf,
        email,
        criadoEm: new Date()
      })
      res.status(200).json({ message: 'Presença registrada com sucesso!', id: resultado.insertedId })
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ error: 'CPF já cadastrado.' })
      }
      res.status(500).json({ error: 'Erro ao registrar presença.' })
    }
  } else {
    res.status(405).json({ error: 'Método não permitido.' })
  }
}