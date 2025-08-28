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

// Checagem de CPF duplicado ao perder o foco (somente se digitado)
cpfInput.addEventListener('blur', async () => {
  const cpfRaw = cpfInput.value.replace(/\D/g, '')
  if (cpfRaw && validarCPF(cpfRaw)) {
    try {
      const resposta = await fetch(`${API_BASE_URL}/cpf?cpf=${cpfRaw}`)
      const existe = await resposta.json()
      if (existe.cadastrado) {
        cpfInput.classList.add('is-invalid')
        mostrarMensagem('CPF já cadastrado.', 'danger')
      } else {
        cpfInput.classList.remove('is-invalid')
        limparMensagem()
      }
    } catch (erro) {
      // Ignora erro de conexão
    }
  }
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

// Verifica se é input text (desktop/totem) ou date (mobile)
if (dataNascInput.type === 'text') {
  // ===== Teclado virtual: máscara DD/MM/AAAA =====
  dataNascInput.addEventListener('input', () => {
    let value = dataNascInput.value.replace(/\D/g, '')
    if (value.length > 8) value = value.slice(0, 8)
    if (value.length >= 5) value = value.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3')
    else if (value.length >= 3) value = value.replace(/(\d{2})(\d{1,2})/, '$1/$2')
    dataNascInput.value = value
  })

  function validarData(dataStr) {
    const partes = dataStr.split('/')
    if (partes.length !== 3) return false
    const [dia, mes, ano] = partes.map(Number)
    const data = new Date(ano, mes - 1, dia)
    const hoje = new Date()
    if (data > hoje) return false
    return data.getDate() === dia && data.getMonth() === mes - 1 && data.getFullYear() === ano
  }

  function converterDataParaISO(dataStr) {
    const [dia, mes, ano] = dataStr.split('/').map(Number)
    return `${ano.toString().padStart(4, '0')}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`
  }
} else {
  // ===== Mobile: input type="date" =====
  function validarData(dataStr) {
    const data = new Date(dataStr)
    const hoje = new Date()
    return data <= hoje
  }

  function converterDataParaISO(dataStr) {
    return dataStr // já está em YYYY-MM-DD
  }
}

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
  let dataNascimento = dataNascInput.value
  let cpf = cpfInput.value.trim()
  const email = emailInput.value.trim()

  let temErro = false

  // Validação nome
  if (!nome) { nomeInput.classList.add('is-invalid'); temErro = true }

  // Validação data nascimento (opcional)
  if (!dataNascimento) {
    dataNascimento = "ND"
  } else {
    if (!validarData(dataNascimento)) {
      dataNascInput.classList.add('is-invalid')
      mostrarMensagem('Data de nascimento inválida ou no futuro.', 'danger')
      temErro = true
    } else if (dataNascInput.type === 'text') {
      dataNascimento = converterDataParaISO(dataNascimento) // formata para envio
    }
  }

  // Validação CPF (opcional)
  if (!cpf) {
    cpf = "ND"
  } else {
    const cpfRaw = cpf.replace(/\D/g, '')
    if (!validarCPF(cpfRaw)) {
      cpfInput.classList.add('is-invalid')
      mostrarMensagem('CPF inválido. Verifique e tente novamente.', 'danger')
      temErro = true
    } else {
      cpf = cpfRaw // envia sem máscara
    }
  }

  // Validação e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) {
    emailInput.classList.add('is-invalid')
    mostrarMensagem('E-mail inválido. Verifique e tente novamente.', 'danger')
    temErro = true
  }

  // Checagem extra de CPF duplicado antes de enviar
  if (!temErro && cpf !== "ND" && validarCPF(cpf)) {
    try {
      const resposta = await fetch(`${API_BASE_URL}/cpf?cpf=${cpf}`)
      const existe = await resposta.json()
      if (existe.cadastrado) {
        cpfInput.classList.add('is-invalid')
        mostrarMensagem('CPF já cadastrado.', 'danger')
        temErro = true
      }
    } catch (erro) {
      // Ignora erro de conexão
    }
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
