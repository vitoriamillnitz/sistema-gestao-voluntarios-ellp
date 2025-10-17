// Aguarda o HTML ser completamente carregado
document.addEventListener('DOMContentLoaded', () => {

    // 1. SELECIONAR OS ELEMENTOS
    const form = document.getElementById('cadastro-voluntario-form');
    const nomeInput = document.getElementById('nome');
    const raInput = document.getElementById('ra');
    const cursoInput = document.getElementById('curso');
    const periodoInput = document.getElementById('periodo');
    const emailInput = document.getElementById('email');
    const telefoneInput = document.getElementById('telefone');
    const senhaInput = document.getElementById('senha');
    // Usamos o ID corrigido que você ajustou no HTML
    const confirmarSenhaInput = document.getElementById('confirmarSenha'); 
    
    // Selecionamos os divs de erro
    const emailError = document.getElementById('email-error');
    const senhaError = document.getElementById('senha-error');

    // 2. ADICIONAR O "OUVINTE" DE SUBMISSÃO
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        // Limpa erros antigos
        emailError.textContent = '';
        senhaError.textContent = '';

        // 3. CAPTURAR OS VALORES
        const nome = nomeInput.value.trim();
        const ra = raInput.value.trim();
        const curso = cursoInput.value.trim();
        const periodo = periodoInput.value.trim();
        const email = emailInput.value.trim();
        const telefone = telefoneInput.value.trim(); // Telefone é opcional, mas pegamos o valor mesmo assim
        const senha = senhaInput.value.trim();
        const confirmarSenha = confirmarSenhaInput.value.trim();
        
        // 4. VALIDAÇÃO DOS DADOS
        // a) Verifica se os campos obrigatórios (todos menos telefone) estão preenchidos
        if (!nome || !ra || !curso || !periodo || !email || !senha || !confirmarSenha) {
            senhaError.textContent = 'Por favor, preencha todos os campos obrigatórios.';
            return;
        }

        // b) Verifica se as senhas são iguais
        if (senha !== confirmarSenha) {
            senhaError.textContent = 'As senhas não coincidem.';
            return;
        }

        // c) Verifica a complexidade da senha
        if (senha.length < 8 || !/[A-Z]/.test(senha) || !/[a-z]/.test(senha) || !/[0-9]/.test(senha)) {
            senhaError.textContent = 'A senha não atende aos requisitos de segurança.';
            return;
        }
        
        // --- PONTO DE INTEGRAÇÃO COM O FIREBASE ---
        console.log('Dados do novo voluntário prontos para envio:');
        console.log({ nome, ra, curso, periodo, email, telefone, senha });

        alert('Cadastro de voluntário simulado com sucesso! Verifique o console (F12).');
        
        form.reset(); // Limpa os campos do formulário
    });
});