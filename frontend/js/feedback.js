// feedback.js

const formFeedback = document.getElementById('form-feedback')
const mensagem = document.getElementById('mensagem')

formFeedback.addEventListener('submit', async (e) => {
    e.preventDefault()

    const estrelas = formFeedback.estrelas.value
    if (!estrelas) {
        mensagem.textContent = 'Por favor, selecione uma avaliação por estrelas.'
        mensagem.style.color = 'red'
        return
    }

    let nome = formFeedback.nome.value.trim()
    if (!nome) nome = null

    const comentarioRaw = formFeedback.comentario.value.trim()
    const comentario = comentarioRaw === '' ? null : comentarioRaw

    const dados = { nome, estrelas, comentario }

    try {
        const response = await fetch(`${API_BASE_URL}/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        })

        if (response.ok) {
            window.location.href = 'agradecimento.html'
        } else {
            let conteudo
            try {
                conteudo = await response.json()
            } catch {
                conteudo = {}
            }
            mensagem.textContent = conteudo.error || 'Erro ao enviar feedback. Tente novamente.'
            mensagem.style.color = 'red'
        }

    } catch (err) {
        mensagem.textContent = 'Erro ao enviar feedback. Verifique a conexão com o servidor.'
        mensagem.style.color = 'red'
        console.error('Erro ao enviar feedback:', err)
    }
})
