document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // 1. MOCK DATA 
    // =================================================================
    let mockVoluntarios = [
        { id: 'v01', nome: 'Brenda Beatriz', email: 'brenda.b@alunos.utfpr.edu.br', telefone: '(44) 91111-2222', status: 'ativo' },
        { id: 'v02', nome: 'Giovana Kaori', email: 'giovana.k@alunos.utfpr.edu.br', telefone: '(43) 93333-4444', status: 'inativo' },
        { id: 'v03', nome: 'Vitória Millnitz', email: 'vitoria.m@alunos.utfpr.edu.br', telefone: '(21) 91234-5678', status: 'ativo' },
        { id: 'v04', nome: 'Thaisse Kirian', email: 'thaisse.k@alunos.utfpr.edu.br', telefone: '(11) 99876-5432', status: 'ativo' },
        { id: 'v05', nome: 'João Pedro Souza', email: 'joao.souza@email.com', telefone: '', status: 'inativo' },
    ];
    let nextIdNumber = 6;

    // =================================================================
    // 2. SELEÇÃO DOS ELEMENTOS DO HTML (ID do Logout Corrigido)
    // =================================================================
    const tabelaVoluntariosTbody = document.querySelector('#voluntarios-table tbody');
    const btnNovoVoluntario = document.getElementById('btn-novo-voluntario');
    const modal = document.getElementById('voluntario-modal'); 
    
    // Controles de Busca/Filtro
    const searchInput = document.getElementById('search-voluntario');
    const filterStatusSelect = document.getElementById('filter-status');

    // Elementos internos do Modal
    const modalTitle = document.getElementById('modal-title');
    const voluntarioForm = document.getElementById('voluntario-form');
    const voluntarioIdInput = document.getElementById('voluntario-id');
    const nomeCompletoInput = document.getElementById('nome-completo');
    const emailInput = document.getElementById('email');
    const telefoneInput = document.getElementById('telefone');
    const closeButtons = modal.querySelectorAll('[data-close-modal], #btn-cancelar, .close-btn');

    // CORREÇÃO: Seleção do botão de Logout (ID CORRIGIDO PARA 'logout-btn')
    const logoutBtn = document.getElementById('logout-btn');


    // =================================================================
    // 3. FUNÇÕES DO MODAL
    // =================================================================

    const abrirModal = (voluntario = null) => {
        voluntarioForm.reset(); 
        if (voluntario) { 
            modalTitle.textContent = 'Editar Voluntário';
            voluntarioIdInput.value = voluntario.id;
            nomeCompletoInput.value = voluntario.nome;
            emailInput.value = voluntario.email;
            telefoneInput.value = voluntario.telefone;
        } else { 
            modalTitle.textContent = 'Adicionar Novo Voluntário';
            voluntarioIdInput.value = '';
        }
        modal.style.display = 'flex'; 
    };

    const fecharModal = () => {
        modal.style.display = 'none';
        voluntarioForm.reset();
    };

    // =================================================================
    // 4. FUNÇÃO DE RENDERIZAÇÃO E FILTRO (CORRIGIDA)
    // =================================================================
    
    const renderizarTabela = () => {
        const termoBusca = searchInput.value.toLowerCase();
        const statusFiltro = filterStatusSelect.value;
        let voluntariosFiltrados = mockVoluntarios;
        
        // 1. Aplica filtro de status
        if (statusFiltro !== 'todos') {
            voluntariosFiltrados = voluntariosFiltrados.filter(v => v.status === statusFiltro);
        }

        // 2. Aplica filtro de busca
        if (termoBusca) {
            voluntariosFiltrados = voluntariosFiltrados.filter(v => 
                v.nome.toLowerCase().includes(termoBusca) || 
                v.email.toLowerCase().includes(termoBusca)
            );
        }

        tabelaVoluntariosTbody.innerHTML = ''; 
        
        if (voluntariosFiltrados.length === 0) {
            tabelaVoluntariosTbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Nenhum voluntário encontrado.</td></tr>';
            return;
        }

        voluntariosFiltrados.forEach(voluntario => {
            const statusClass = voluntario.status === 'ativo' ? 'status-active' : 'status-inativo';
            const statusText = voluntario.status === 'ativo' ? 'Ativo' : 'Inativo';
            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td>${voluntario.nome}</td>
                <td>${voluntario.email}</td>
                <td><span class="${statusClass}">${statusText}</span></td>
                <td class="actions-icons">
                    <a href="../detalhes-voluntario/detalhes-voluntario.html?id=${voluntario.id}" class="btn-action btn-details" title="Ver Detalhes">
                        <i class="fas fa-eye"></i>
                    </a>
                    <button class="btn-action btn-edit" title="Editar" data-id="${voluntario.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action ${voluntario.status === 'ativo' ? 'btn-deactivate' : 'btn-activate'}" 
                            title="${voluntario.status === 'ativo' ? 'Desativar' : 'Ativar'}" 
                            data-id="${voluntario.id}" 
                            data-action="${voluntario.status === 'ativo' ? 'desativar' : 'ativar'}">
                        <i class="fas ${voluntario.status === 'ativo' ? 'fa-user-times' : 'fa-user-check'}"></i>
                    </button>
                </td>
            `;
            tabelaVoluntariosTbody.appendChild(linha);
        });
    };
    
    // =================================================================
    // 5. LÓGICA DE SALVAR
    // =================================================================

    voluntarioForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const id = voluntarioIdInput.value;
        const novoVoluntario = {
            nome: nomeCompletoInput.value,
            email: emailInput.value,
            telefone: telefoneInput.value,
            status: 'ativo', // Novo voluntário sempre inicia como ativo
        };

        if (id) { 
            const index = mockVoluntarios.findIndex(v => v.id === id);
            mockVoluntarios[index] = { ...mockVoluntarios[index], ...novoVoluntario };
        } else { 
            novoVoluntario.id = 'v' + new Date().getTime() + nextIdNumber++; 
            mockVoluntarios.push(novoVoluntario);
        }
        
        renderizarTabela();
        fecharModal();
    });

    // =================================================================
    // 6. EVENT LISTENERS (CONEXÃO FINAL)
    // =================================================================

    // Filtros e Busca
    searchInput.addEventListener('input', renderizarTabela);
    filterStatusSelect.addEventListener('change', renderizarTabela);

    // --- Funcionalidade 1: Abrir Modal (Botão Laranja) ---
    if (btnNovoVoluntario) {
        // Garantir que SÓ o botão com ID abra o modal
        btnNovoVoluntario.addEventListener('click', (event) => {
            event.preventDefault(); 
            abrirModal();
        });
    }

    // --- Funcionalidade 2: Fechar Modal ---
    closeButtons.forEach(button => {
        button.addEventListener('click', fecharModal);
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            fecharModal();
        }
    });

    // Ações da Tabela (Editar/Ativar/Desativar)
    tabelaVoluntariosTbody.addEventListener('click', (event) => {
        const targetButton = event.target.closest('button');
        if (!targetButton) return;
        
        const id = targetButton.dataset.id;
        const action = targetButton.dataset.action; 
        if (!id) return; 

        if (targetButton.classList.contains('btn-edit')) {
            const voluntarioParaEditar = mockVoluntarios.find(v => v.id === id);
            if (voluntarioParaEditar) {
                 abrirModal(voluntarioParaEditar);
            }
        } 
        else if (action === 'desativar') {
            if (confirm(`Tem certeza que deseja desativar este voluntário?`)) {
                const index = mockVoluntarios.findIndex(v => v.id === id);
                if (index !== -1) {
                    mockVoluntarios[index].status = 'inativo';
                    renderizarTabela();
                }
            }
        }
        else if (action === 'ativar') {
            if (confirm(`Tem certeza que deseja ativar este voluntário?`)) {
                const index = mockVoluntarios.findIndex(v => v.id === id);
                if (index !== -1) {
                    mockVoluntarios[index].status = 'ativo';
                    renderizarTabela();
                }
            }
        }
    });

    // --- LÓGICA DE LOGOUT ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            alert('Logout simulado! Redirecionando para a página de login.');
            // Redirecionamento para a página de login
            window.location.href = '../login/login.html'; 
        });
    }


    // =================================================================
    // 7. EXECUÇÃO INICIAL
    // =================================================================
    // GARANTIA DE FECHAMENTO AO CARREGAR
    if (modal) {
        modal.style.display = 'none'; 
    }
    renderizarTabela();
});