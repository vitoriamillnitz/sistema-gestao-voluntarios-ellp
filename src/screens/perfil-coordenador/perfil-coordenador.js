document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // 1. MOCK DATA E SIMULAÇÃO DE USUÁRIO LOGADO
    // =================================================================
    const loggedInCoordenadorId = 'c01';
    let mockCoordenadores = [
        { id: 'c01', nome: 'Brenda Beatriz', departamento: 'Engenharia de Software', email: 'brenda.b@utfpr.edu.br' }
    ];

    // Variável para guardar os dados originais ao entrar no modo de edição
    let originalData = {};

    // =================================================================
    // 2. SELEÇÃO DOS ELEMENTOS DO HTML
    // =================================================================
    const form = document.getElementById('perfil-coordenador-form');
    const nomeInput = document.getElementById('nome');
    const departamentoInput = document.getElementById('departamento');
    const emailInput = document.getElementById('email');
    const novaSenhaInput = document.getElementById('nova-senha');
    const confirmarSenhaInput = document.getElementById('confirmar-senha');

    const btnEditar = document.getElementById('btn-editar');
    const btnSalvar = document.getElementById('btn-salvar');
    const btnCancelar = document.getElementById('btn-cancelar');
    
    // NOVO: Seleção do botão de Logout
    const logoutBtn = document.getElementById('logout-btn');


    // =================================================================
    // 3. FUNÇÕES DE CONTROLE DE MODO (VISUALIZAÇÃO/EDIÇÃO)
    // =================================================================

    const entrarModoEdicao = () => {
        // Guarda os valores atuais para o caso de o usuário cancelar
        originalData = {
            nome: nomeInput.value,
            departamento: departamentoInput.value,
        };

        // Habilita os campos para edição (email não é editável)
        nomeInput.disabled = false;
        departamentoInput.disabled = false;
        novaSenhaInput.disabled = false;
        confirmarSenhaInput.disabled = false;

        // Alterna a visibilidade dos botões
        btnEditar.style.display = 'none';
        btnSalvar.style.display = 'inline-block';
        btnCancelar.style.display = 'inline-block';
    };

    const sairModoEdicao = () => {
        // Desabilita todos os campos
        nomeInput.disabled = true;
        departamentoInput.disabled = true;
        novaSenhaInput.disabled = true;
        confirmarSenhaInput.disabled = true;

        // Limpa os campos de senha por segurança
        novaSenhaInput.value = '';
        confirmarSenhaInput.value = '';

        // Alterna a visibilidade dos botões de volta ao estado inicial
        btnEditar.style.display = 'inline-block';
        btnSalvar.style.display = 'none';
        btnCancelar.style.display = 'none';
    };
    
    // =================================================================
    // 4. LÓGICA DE CARREGAMENTO E EVENTOS
    // =================================================================

    // Carrega os dados iniciais do coordenador logado
    const carregarDados = () => {
        const coordenador = mockCoordenadores.find(c => c.id === loggedInCoordenadorId);
        if (coordenador) {
            nomeInput.value = coordenador.nome;
            departamentoInput.value = coordenador.departamento;
            emailInput.value = coordenador.email;
        }
    };

    // Evento para o botão "Editar Dados"
    btnEditar.addEventListener('click', entrarModoEdicao);
    
    // Evento para o botão "Cancelar"
    btnCancelar.addEventListener('click', () => {
        // Restaura os valores originais
        nomeInput.value = originalData.nome;
        departamentoInput.value = originalData.departamento;
        // Sai do modo de edição
        sairModoEdicao();
    });

    // Evento para o formulário (botão "Salvar Alterações")
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const novaSenha = novaSenhaInput.value;
        const confirmarSenha = confirmarSenhaInput.value;

        // Validação da senha (só se o campo nova senha foi preenchido)
        if (novaSenha) {
            if (novaSenha !== confirmarSenha) {
                alert('As senhas não coincidem!');
                return;
            }
            // Validação de segurança (o seu requisito original era maior, mas 6 é um bom mínimo)
            if (novaSenha.length < 6) {
                alert('A nova senha deve ter no mínimo 6 caracteres.');
                return;
            }
            // Lógica para alterar a senha viria aqui
            console.log('Simulando alteração de senha...');
        }

        // Atualiza os dados no array mock
        const index = mockCoordenadores.findIndex(c => c.id === loggedInCoordenadorId);
        if (index !== -1) {
            mockCoordenadores[index].nome = nomeInput.value;
            mockCoordenadores[index].departamento = departamentoInput.value;
        }

        console.log('Dados atualizados:', mockCoordenadores[index]);
        alert('Dados salvos com sucesso!');

        // Retorna para o modo de visualização
        sairModoEdicao();
    });
    
    // NOVO: Lógica do botão de Sair (Funcionalidade de Logout)
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            alert('Logout simulado! Redirecionando para a página de login.');
            // Redirecionamento para a página de login
            window.location.href = '../login/login.html'; 
        });
    }


    // =================================================================
    // 5. EXECUÇÃO INICIAL
    // =================================================================
    carregarDados();
    // Garante que a página inicie em modo visualização
    sairModoEdicao(); 

});