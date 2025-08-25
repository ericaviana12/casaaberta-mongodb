let chartIdades, chartFeedbacks

async function carregarDashboard() {
    try {
        const res = await fetch('/api/estatisticas')
        if (!res.ok) throw new Error('Erro ao buscar estatísticas')
        const dados = await res.json()

        // Cards
        document.getElementById('totalParticipantes').textContent = dados.totalParticipantes
        document.getElementById('totalFeedbacks').textContent = dados.totalFeedbacks || 0
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
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
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
                labels: estrelasLabels.map(e => e + " ★"),
                datasets: [{
                    label: 'Quantidade',
                    data: estrelasData,
                    backgroundColor: 'rgba(255, 206, 86, 0.7)',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true },
                },
                scales: {
                    y: { beginAtZero: true, ticks: { precision: 0 } }
                }
            }
        })

        // Últimos feedbacks
        const lista = document.getElementById('listaFeedbacks')
        lista.innerHTML = ''
        dados.ultimosFeedbacks.forEach(f => {
            const li = document.createElement('li')
            li.innerHTML = `<strong>${f.nome}</strong>: "${f.comentario}" <span style="float:right">${f.estrelas} ★</span>`
            lista.appendChild(li)
        })
    } catch (err) {
        document.getElementById('totalParticipantes').textContent = 'Erro'
        document.getElementById('totalFeedbacks').textContent = 'Erro'
        document.getElementById('mediaEstrelas').textContent = 'Erro'
        const lista = document.getElementById('listaFeedbacks')
        lista.innerHTML = '<li>Erro ao carregar dados</li>'
    }
}

// Atualiza a cada 15s para dar mais fluidez
carregarDashboard()
setInterval(carregarDashboard, 15000)
