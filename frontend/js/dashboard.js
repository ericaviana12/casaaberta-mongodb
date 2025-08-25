let chartIdades, chartFeedbacks
let lastDados = null // para comparar se mudou algo

async function carregarDashboard() {
    try {
        const res = await fetch('/api/estatisticas')
        if (!res.ok) throw new Error('Erro ao buscar estatísticas')
        const dados = await res.json()

        // --- Atualizar Cards apenas se mudar ---
        if (!lastDados || lastDados.totalParticipantes !== dados.totalParticipantes)
            document.getElementById('totalParticipantes').textContent = dados.totalParticipantes

        if (!lastDados || lastDados.totalFeedbacks !== dados.totalFeedbacks)
            document.getElementById('totalFeedbacks').textContent = dados.totalFeedbacks || 0

        if (!lastDados || lastDados.mediaEstrelas !== dados.mediaEstrelas)
            document.getElementById('mediaEstrelas').textContent = (dados.mediaEstrelas || 0) + " ★"

        // --- Gráfico Faixas Etárias ---
        const ctxIdades = document.getElementById('chartIdades').getContext('2d')
        const faixasLabels = Object.keys(dados.faixasEtarias)
        const faixasData = Object.values(dados.faixasEtarias)

        if (!chartIdades) {
            chartIdades = new Chart(ctxIdades, {
                type: 'bar',
                data: {
                    labels: faixasLabels,
                    datasets: [{
                        label: 'Participantes',
                        data: faixasData,
                        backgroundColor: 'rgba(54, 162, 235, 0.7)',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    animation: { duration: 600, easing: 'easeOutQuart' },
                    plugins: { legend: { display: false }, tooltip: { enabled: true } },
                    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
                }
            })
        } else {
            // Atualiza somente se mudou
            chartIdades.data.labels = faixasLabels
            chartIdades.data.datasets[0].data = faixasData
            chartIdades.update()
        }

        // --- Gráfico Feedbacks por Estrelas ---
        const ctxFeedbacks = document.getElementById('chartFeedbacks').getContext('2d')
        const estrelasLabels = Object.keys(dados.feedbacksPorEstrela).map(e => e + " ★")
        const estrelasData = Object.values(dados.feedbacksPorEstrela)

        if (!chartFeedbacks) {
            chartFeedbacks = new Chart(ctxFeedbacks, {
                type: 'bar',
                data: {
                    labels: estrelasLabels,
                    datasets: [{
                        label: 'Quantidade',
                        data: estrelasData,
                        backgroundColor: 'rgba(255, 206, 86, 0.7)',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    animation: { duration: 600, easing: 'easeOutQuart' },
                    plugins: { legend: { display: false }, tooltip: { enabled: true } },
                    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
                }
            })
        } else {
            chartFeedbacks.data.labels = estrelasLabels
            chartFeedbacks.data.datasets[0].data = estrelasData
            chartFeedbacks.update()
        }

        // --- Últimos feedbacks ---
        const lista = document.getElementById('listaFeedbacks')
        const novosIds = dados.ultimosFeedbacks.map(f => f._id) // assume que cada feedback tem _id
        const antigosIds = lastDados ? lastDados.ultimosFeedbacks.map(f => f._id) : []

        if (!lastDados || JSON.stringify(novosIds) !== JSON.stringify(antigosIds)) {
            lista.innerHTML = ''
            dados.ultimosFeedbacks.forEach(f => {
                const li = document.createElement('li')
                li.innerHTML = `<strong>${f.nome}</strong>: "${f.comentario}" <span style="float:right">${f.estrelas} ★</span>`
                lista.appendChild(li)
            })
        }

        // Atualiza dados armazenados
        lastDados = dados

    } catch (err) {
        document.getElementById('totalParticipantes').textContent = 'Erro'
        document.getElementById('totalFeedbacks').textContent = 'Erro'
        document.getElementById('mediaEstrelas').textContent = 'Erro'
        const lista = document.getElementById('listaFeedbacks')
        lista.innerHTML = '<li>Erro ao carregar dados</li>'
    }
}

// Polling suave a cada 15s
carregarDashboard()
setInterval(carregarDashboard, 15000)
