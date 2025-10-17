// Aguarda o HTML ser completamente carregado
document.addEventListener('DOMContentLoaded', () => {

    // 1. SELECIONAR OS ELEMENTOS COM BASE NOS SEUS IDs
    const cadastroForm = document.getElementById('cadastro-form');
    const nomeInput = document.getElementById('nome');
    const departamentoInput = document.getElementById('departamento');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const confirmarSenhaInput = document.getElementById('confirmarSenha');
    
    // Selecionamos os divs específicos para mensagens de erro
    const emailError = document.getElementById('email-error');
    const senhaError = document.getElementById('senha-error');

    // 2. ADICIONAR O "OUVINTE" DE SUBMISSÃO DO FORMULÁRIO
    cadastroForm.addEventListener('submit', (event) => {
        // Impede o recarregamento padrão da página
        event.preventDefault();

        // Limpa mensagens de erro de tentativas anteriores
        emailError.textContent = '';
        senhaError.textContent = '';

        // 3. CAPTURAR OS VALORES DOS CAMPOS
        const nome = nomeInput.value.trim();
        const departamento = departamentoInput.value.trim();
        const email = emailInput.value.trim();
        const senha = senhaInput.value.trim();
        const confirmarSenha = confirmarSenhaInput.value.trim();
        
        // 4. VALIDAÇÃO DOS DADOS
        // a) Verifica se todos os campos estão preenchidos
        if (!nome || !departamento || !email || !senha || !confirmarSenha) {
            senhaError.textContent = 'Todos os campos são obrigatórios.';
            return;
        }

        // b) Verifica se as senhas são iguais
        if (senha !== confirmarSenha) {
            senhaError.textContent = 'As senhas não coincidem.';
            return;
        }

        // c) Verifica a complexidade da senha (de acordo com as regras no seu HTML)
        const temMaiuscula = /[A-Z]/.test(senha);
        const temMinuscula = /[a-z]/.test(senha);
        const temNumero = /[0-9]/.test(senha);
        
        if (senha.length < 8 || !temMaiuscula || !temMinuscula || !temNumero) {
            senhaError.textContent = 'A senha não atende aos requisitos de segurança.';
            return;
        }
        
        // --- PONTO DE INTEGRAÇÃO COM O FIREBASE ---
        // Se todas as validações foram aprovadas, simulamos o sucesso
        console.log('Dados do novo coordenador prontos para envio:');
        console.log({ nome, departamento, email, senha });

        alert('Cadastro simulado com sucesso! Verifique o console (F12) para ver os dados.');
        
        cadastroForm.reset(); // Limpa os campos do formulário
    });
});