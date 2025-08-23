// ===== CPF =====
const cpfInput = document.getElementById('cpf')

// Máscara de CPF (formato 000.000.000-00)
cpfInput.addEventListener('input', () => {
  let value = cpfInput.value.replace(/\D/g, '')
  if (value.length > 11) value = value.slice(0, 11)
  value = value.replace(/(\d{3})(\d)/, '$1.$2')
  value = value.replace(/(\d{3})(\d)/, '$1.$2')
  value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  cpfInput.value = value
})

// Validação completa do CPF (com dígitos verificadores)
function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, '')
  if (cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false

  let soma = 0, resto

  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i)
  }

  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(cpf.substring(9, 10))) return false

  soma = 0
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i)
  }

  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(cpf.substring(10, 11))) return false

  return true
}

// ===== Data de Nascimento =====
const dataNascInput = document.getElementById('dataNascimento')
dataNascInput.addEventListener('change', () => {
  const hoje = new Date()
  const nascimento = new Date(dataNascInput.value)
  if (nascimento > hoje) {
    dataNascInput.classList.add('is-invalid')
    mostrarMensagem('Data de nascimento não pode ser no futuro.', 'danger')
    dataNascInput.value = ''
  } else {
    dataNascInput.classList.remove('is-invalid')
    limparMensagem()
  }
})

// ===== E-mail =====
const emailInput = document.getElementById('email')

// ===== Mensagens =====
function mostrarMensagem(texto, tipo) {
  const mensagemEl = document.getElementById('mensagem')
  mensagemEl.textContent = texto
  mensagemEl.classList.remove('text-danger', 'text-success')
  mensagemEl.classList.add(tipo === 'danger' ? 'text-danger' : 'text-success')
}

function limparMensagem() {
  const mensagemEl = document.getElementById('mensagem')
  mensagemEl.textContent = ''
  mensagemEl.classList.remove('text-danger', 'text-success')
}

// ===== Formulário =====
document.getElementById('form-presenca').addEventListener('submit', async function (e) {
  e.preventDefault()

  const nomeInput = document.getElementById('nome')

  // Limpar erros
  nomeInput.classList.remove('is-invalid')
  dataNascInput.classList.remove('is-invalid')
  cpfInput.classList.remove('is-invalid')
  emailInput.classList.remove('is-invalid')
  limparMensagem()

  const nome = nomeInput.value.trim()
  const dataNascimento = dataNascInput.value
  const cpf = cpfInput.value.trim()
  const email = emailInput.value.trim()

  let temErro = false

  if (!nome) { nomeInput.classList.add('is-invalid'); temErro = true }
  if (!dataNascimento) {
    dataNascInput.classList.add('is-invalid')
    mostrarMensagem('Por favor, informe uma data de nascimento válida.', 'danger')
    temErro = true
  } else {
    const hoje = new Date()
    const nascimento = new Date(dataNascimento)
    if (nascimento > hoje) {
      dataNascInput.classList.add('is-invalid')
      mostrarMensagem('Data de nascimento não pode ser no futuro.', 'danger')
      temErro = true
    }
  }

  if (!validarCPF(cpf)) {
    cpfInput.classList.add('is-invalid')
    mostrarMensagem('CPF inválido. Verifique e tente novamente.', 'danger')
    temErro = true
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) {
    emailInput.classList.add('is-invalid')
    mostrarMensagem('E-mail inválido. Verifique e tente novamente.', 'danger')
    temErro = true
  }

  if (temErro) return

  const dados = { nome, dataNascimento, cpf, email }

  try {
    const resposta = await fetch(`${API_BASE_URL}/presenca`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    })

    const conteudo = await resposta.json()

    if (resposta.ok) {
      mostrarMensagem(conteudo.message || 'Presença registrada com sucesso!', 'success')
      this.reset()
    } else {
      // CPF duplicado
      if (conteudo.error && conteudo.error.toLowerCase().includes('cpf')) {
        cpfInput.classList.add('is-invalid')
        cpfInput.value = ''
        mostrarMensagem('CPF já cadastrado.', 'danger')
        cpfInput.focus()
      } else {
        mostrarMensagem(conteudo.error || 'Erro ao registrar presença.', 'danger')
      }
    }

  } catch (erro) {
    console.error('Erro:', erro)
    mostrarMensagem('Erro de conexão com o servidor.', 'danger')
  }
})
