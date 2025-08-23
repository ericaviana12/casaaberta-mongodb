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
      res.status(200).json({ message: 'Feedback enviado com sucesso!', id: resultado.insertedId })
    } catch (err) {
      res.status(500).json({ error: 'Erro ao registrar feedback.' })
    }
  } else {
    res.status(405).json({ error: 'Método não permitido.' })
  }
}