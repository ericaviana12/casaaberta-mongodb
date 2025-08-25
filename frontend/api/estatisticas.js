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
                const estrelas = Number(f.estrelas) || 0
                distEstrelas[estrelas]++
                somaEstrelas += estrelas
                totalFeedbacks++
            })
            const mediaEstrelas = totalFeedbacks
                ? (somaEstrelas / totalFeedbacks).toFixed(2)
                : "0.00"

            res.status(200).json({
                totalParticipantes,
                faixasEtarias: faixas,
                totalFeedbacks,
                feedbacksPorEstrela: distEstrelas,
                mediaEstrelas,
                ultimosFeedbacks: feedbacks
            })
        } catch (err) {
            res.status(500).json({ error: 'Erro ao buscar estatísticas.' })
        }
    } else {
        res.status(405).json({ error: 'Método não permitido.' })
    }
}