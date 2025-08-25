let chartIdades, chartFeedbacks

async function carregarDashboard() {
    try {
        const res = await fetch('/api/estatisticas')
        if (!res.ok) throw new Error('Erro ao buscar estatísticas')
        const dados = await res.json()

        // Total de participantes
        document.getElementById('totalParticipantes').textContent = dados.totalParticipantes

        // Total de feedbacks
        document.getElementById('totalFeedbacks').textContent = dados.totalFeedbacks || 0

        // Média de estrelas
        document.getElementById('mediaEstrelas').textContent = (dados.mediaEstrelas || 0) + " ★"

        // Faixas etárias
        const ctxIdades = document.getElementById('chartIdades').getContext('2d')
        const faixasLabels = Object.keys(dados.faixasEtarias)
        const faixasData = Object.values(dados.faixasEtarias)
        if (chartIdades) chartIdades.destroy()
        chartIdades = new Chart(ctxIdades, {
            type: 'bar',
            data: {
                labels: faixasLabels,
                datasets: [{
                    label: 'Participantes',
                    data: faixasData,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)'
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } }
            }
        })

        // Feedbacks por estrelas
        const ctxFeedbacks = document.getElementById('chartFeedbacks').getContext('2d')
        const estrelasLabels = Object.keys(dados.feedbacksPorEstrela)
        const estrelasData = Object.values(dados.feedbacksPorEstrela)
        if (chartFeedbacks) chartFeedbacks.destroy()
        chartFeedbacks = new Chart(ctxFeedbacks, {
            type: 'bar',
            data: {
                labels: estrelasLabels,
                datasets: [{
                    label: 'Quantidade',
                    data: estrelasData,
                    backgroundColor: 'rgba(255, 206, 86, 0.6)'
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } }
            }
        })

        // Últimos feedbacks
        const lista = document.getElementById('listaFeedbacks')
        lista.innerHTML = ''
        dados.ultimosFeedbacks.forEach(f => {
            const li = document.createElement('li')
            li.textContent = `${f.nome}: "${f.comentario}" (${f.estrelas} ★)`
            lista.appendChild(li)
        })
    } catch (err) {
        // Exibe erro no dashboard
        document.getElementById('totalParticipantes').textContent = 'Erro'
        document.getElementById('totalFeedbacks').textContent = 'Erro'
        document.getElementById('mediaEstrelas').textContent = 'Erro'
        const lista = document.getElementById('listaFeedbacks')
        lista.innerHTML = '<li>Erro ao carregar dados</li>'
    }
}

// Atualiza a cada 5s
carregarDashboard()
setInterval(carregarDashboard, 10000)