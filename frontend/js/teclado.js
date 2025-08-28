let campoFocado = null
let capsLockAtivo = false

// Alterna CapsLock
function toggleCapsLock() {
    capsLockAtivo = !capsLockAtivo

    // Atualiza visual das letras no teclado
    document.querySelectorAll('.tecla.letra').forEach(tecla => {
        tecla.textContent = capsLockAtivo
            ? tecla.dataset.char.toUpperCase()
            : tecla.dataset.char.toLowerCase()
    })

    // Atualiza o estilo do botão CapsLock
    const capsBtn = document.getElementById('capsLock')
    if (capsLockAtivo) {
        capsBtn.classList.add('ativo')
    } else {
        capsBtn.classList.remove('ativo')
    }
}

// Detecta qual campo está focado
document.querySelectorAll("input[type='text'], input[type='email'], textarea").forEach(campo => {
    campo.addEventListener('focus', () => {
        campoFocado = campo
    })
})

// Insere caracteres no campo focado
function inserirCaractere(char) {
    if (!campoFocado) return

    const caractereFinal = capsLockAtivo ? char.toUpperCase() : char.toLowerCase()
    const inicio = campoFocado.selectionStart
    const fim = campoFocado.selectionEnd
    const texto = campoFocado.value

    // Insere o caractere na posição atual do cursor
    campoFocado.value = texto.slice(0, inicio) + caractereFinal + texto.slice(fim)

    // Atualiza a posição do cursor corretamente
    const novaPos = inicio + 1
    campoFocado.setSelectionRange(novaPos, novaPos)
    campoFocado.focus()
}

// Apaga o caractere antes do cursor ou seleção
function backspace() {
    if (!campoFocado) return

    const inicio = campoFocado.selectionStart
    const fim = campoFocado.selectionEnd
    const texto = campoFocado.value

    if (inicio === fim && inicio > 0) {
        // Remove o caractere anterior
        campoFocado.value = texto.slice(0, inicio - 1) + texto.slice(fim)
        campoFocado.setSelectionRange(inicio - 1, inicio - 1)
    } else {
        // Remove a seleção
        campoFocado.value = texto.slice(0, inicio) + texto.slice(fim)
        campoFocado.setSelectionRange(inicio, inicio)
    }
    campoFocado.focus()
}
