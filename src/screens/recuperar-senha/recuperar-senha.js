document.addEventListener('DOMContentLoaded', () => {

    // 1. SELECIONAR OS ELEMENTOS DO HTML
    const form = document.getElementById('recuperar-senha-form');
    const emailInput = document.getElementById('email');
    const messageDiv = document.getElementById('recuperar-message');
    const submitButton = form.querySelector('.btn');

    // 2. ADICIONAR O "OUVINTE" DE SUBMISSÃO AO FORMULÁRIO
    form.addEventListener('submit', (event) => {
        // Impede o recarregamento padrão da página
        event.preventDefault();

        // Limpa mensagens e estilos de tentativas anteriores
        messageDiv.textContent = '';
        messageDiv.style.color = ''; // Reseta a cor

        // 3. CAPTURAR O VALOR DO CAMPO DE E-MAIL
        const email = emailInput.value.trim();

        // 4. VALIDAÇÃO BÁSICA
        if (email === '') {
            messageDiv.textContent = 'Por favor, informe seu e-mail.';
            messageDiv.style.color = '#d93025'; // Cor de erro
            return;
        }

        // --- PONTO DE INTEGRAÇÃO COM O FIREBASE ---
        // Aqui, no futuro, chamaremos a função `sendPasswordResetEmail` do Firebase.
        // Por enquanto, vamos apenas simular o sucesso.
        
        console.log(`Simulando envio de e-mail de recuperação para: ${email}`);
        
        // Exibe uma mensagem de sucesso para o usuário
        messageDiv.textContent = 'Se este e-mail estiver cadastrado, um link de recuperação será enviado em breve.';
        messageDiv.style.color = '#1a73e8'; // Cor de sucesso/informação

        // Desabilita o botão para evitar múltiplos cliques
        submitButton.disabled = true;
        
        // Opcional: Limpa o campo de e-mail após o envio
        emailInput.value = '';
        
        // Reabilita o botão após alguns segundos
        setTimeout(() => {
            submitButton.disabled = false;
        }, 5000); // 5 segundos
    });
});