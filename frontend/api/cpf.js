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

  if (req.method === 'GET') {
    const { cpf } = req.query
    if (!cpf) return res.status(400).json({ error: 'CPF não informado.' })
    const cpfLimpo = cpf.replace(/\D/g, '')
    const existe = await db.collection('presencas').findOne({ cpf: cpfLimpo })
    res.status(200).json({ cadastrado: !!existe })
  } else {
    res.status(405).json({ error: 'Método não permitido.' })
  }
}