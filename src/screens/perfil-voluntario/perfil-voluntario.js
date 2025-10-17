document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // 1. MOCK DATA E SIMULAÇÃO DE USUÁRIO LOGADO
    // =================================================================
    const loggedInVoluntarioId = 'v01'; // Simulando que a Giovana está logada
    let mockVoluntarios = [
        { id: 'v01', nome: 'Brenda Beatriz', ra: 'a234567', curso: 'Engenharia de Software', periodo: 8, email: 'brenda.b@alunos.utfpr.edu.br', telefone: '(44) 91111-2222', status: 'Ativo' },
        { id: 'v02', nome: 'Giovana Kaori', ra: 'g765432', curso: 'Engenharia de Software', periodo: 8, email: 'giovana.k@alunos.utfpr.edu.br', telefone: '(43) 93333-4444', status: 'Ativo' },
        { id: 'v03', nome: 'Vitória Millnitz', ra: 'v543210', curso: 'Ciência da Computação', periodo: 6, email: 'vitoria.m@alunos.utfpr.edu.br', telefone: '(45) 95555-6666', status: 'Inativo' },
    ];

    let originalData = {};

    // =================================================================
    // 2. SELEÇÃO DOS ELEMENTOS DO HTML
    // =================================================================
    const form = document.getElementById('perfil-voluntario-form');
    const nomeInput = document.getElementById('nome');
    const raInput = document.getElementById('ra');
    const cursoInput = document.getElementById('curso');
    const periodoInput = document.getElementById('periodo');
    const emailInput = document.getElementById('email');
    const telefoneInput = document.getElementById('telefone');

    const btnEditar = document.getElementById('btn-editar');
    const btnSalvar = document.getElementById('btn-salvar');
    const btnCancelar = document.getElementById('btn-cancelar');
    const logoutBtn = document.getElementById('logout-btn');

    // =================================================================
    // 3. FUNÇÕES DE CONTROLE DE MODO (VISUALIZAÇÃO/EDIÇÃO)
    // =================================================================

    const entrarModoEdicao = () => {
        // Guarda os valores atuais para o caso de cancelamento
        originalData = {
            nome: nomeInput.value,
            curso: cursoInput.value,
            periodo: periodoInput.value,
            telefone: telefoneInput.value,
        };

        // Habilita campos editáveis (RA e E-mail geralmente não são)
        nomeInput.disabled = false;
        cursoInput.disabled = false;
        periodoInput.disabled = false;
        telefoneInput.disabled = false;

        // Alterna a visibilidade dos botões
        btnEditar.style.display = 'none';
        btnSalvar.style.display = 'inline-block';
        btnCancelar.style.display = 'inline-block';
    };

    const sairModoEdicao = () => {
        // Desabilita todos os campos
        Object.values(form.elements).forEach(el => el.disabled = true);

        // Alterna a visibilidade dos botões de volta ao estado inicial
        btnEditar.style.display = 'inline-block';
        btnSalvar.style.display = 'none';
        btnCancelar.style.display = 'none';
    };
    
    // =================================================================
    // 4. LÓGICA DE CARREGAMENTO E EVENTOS
    // =================================================================

    const carregarDados = () => {
        const voluntario = mockVoluntarios.find(v => v.id === loggedInVoluntarioId);
        if (voluntario) {
            nomeInput.value = voluntario.nome;
            raInput.value = voluntario.ra;
            cursoInput.value = voluntario.curso;
            periodoInput.value = voluntario.periodo;
            emailInput.value = voluntario.email;
            telefoneInput.value = voluntario.telefone || ''; // Usa '' se não houver telefone
        }
    };

    btnEditar.addEventListener('click', entrarModoEdicao);
    
    btnCancelar.addEventListener('click', () => {
        // Restaura os valores originais
        nomeInput.value = originalData.nome;
        cursoInput.value = originalData.curso;
        periodoInput.value = originalData.periodo;
        telefoneInput.value = originalData.telefone;
        sairModoEdicao();
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        // Atualiza os dados no array mock
        const index = mockVoluntarios.findIndex(v => v.id === loggedInVoluntarioId);
        if (index !== -1) {
            mockVoluntarios[index].nome = nomeInput.value;
            mockVoluntarios[index].curso = cursoInput.value;
            mockVoluntarios[index].periodo = periodoInput.value;
            mockVoluntarios[index].telefone = telefoneInput.value;
        }

        console.log('Dados do voluntário atualizados:', mockVoluntarios[index]);
        alert('Dados salvos com sucesso!');

        sairModoEdicao();
    });

    logoutBtn.addEventListener('click', () => {
        alert('Logout simulado! Redirecionando para a página de login.');
        window.location.href = '../login/login.html'; // Ajuste o caminho se necessário
    });

    // =================================================================
    // 5. EXECUÇÃO INICIAL
    // =================================================================
    carregarDados();
});