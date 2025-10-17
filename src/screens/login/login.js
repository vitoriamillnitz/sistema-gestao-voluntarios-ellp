// Aguarda o HTML da página ser completamente carregado para executar o script
document.addEventListener('DOMContentLoaded', () => {

    // 1. SELECIONAR OS ELEMENTOS DO HTML
    // Selecionamos o formulário, os campos de input e o local da mensagem de erro
    // Usamos os IDs que estão no seu arquivo HTML
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('senha'); // Seu ID é "senha"
    const errorMessage = document.getElementById('login-error-message');

    // 2. ADICIONAR UM "OUVINTE" DE EVENTO AO FORMULÁRIO
    // Isso faz com que uma função seja executada sempre que o formulário for enviado (botão "Entrar" clicado)
    loginForm.addEventListener('submit', (event) => {
        // event.preventDefault() é MUITO IMPORTANTE. Impede que a página recarregue ao enviar o formulário.
        event.preventDefault();

        // 3. CAPTURAR OS VALORES DOS INPUTS
        // Pegamos o texto digitado pelo usuário e usamos .trim() para remover espaços em branco no início e no fim.
        const email = emailInput.value.trim();
        const senha = passwordInput.value.trim();

        // Limpa mensagens de erro antigas
        errorMessage.textContent = '';

        // 4. FAZER A VALIDAÇÃO BÁSICA
        // Verificamos se os campos não estão vazios antes de prosseguir
        if (email === '' || senha === '') {
            errorMessage.textContent = 'Por favor, preencha todos os campos.';
            return; // Para a execução da função aqui se houver erro
        }

        // --- PONTO DE INTEGRAÇÃO COM O FIREBASE ---
        // Por enquanto, vamos apenas simular o sucesso e mostrar os dados no console.
        // Na próxima fase, substituiremos este trecho pela chamada real ao Firebase.
        
        console.log('Tentativa de login com:');
        console.log('Email:', email);
        console.log('Senha:', senha); // Não se preocupe, a senha no console é só para teste local

        alert('Lógica do formulário funcionando! Verifique o console (F12) para ver os dados capturados.');
        
        // Aqui, no futuro, você redirecionaria o usuário em caso de sucesso
        // Ex: window.location.href = '../dashboard-coordenador/dashboard-coordenador.html';
    });
});