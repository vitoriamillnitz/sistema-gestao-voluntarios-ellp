document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // 1. MOCK DATA 
    // =================================================================
    let mockOficinas = [
        { id: 'o01', nome: 'Lógica com Blocos', data: '2025-10-25', cargaHoraria: 4, status: 'Agendada' },
        { id: 'o02', nome: 'Introdução a HTML/CSS', data: '2025-11-08', cargaHoraria: 6, status: 'Agendada' },
        { id: 'o03', nome: 'Robótica com Arduino', data: '2025-09-15', cargaHoraria: 8, status: 'Realizada' },
        { id: 'o04', nome: 'Oficina de UX Design', data: '2025-08-01', cargaHoraria: 3, status: 'Realizada' },
        { id: 'o05', nome: 'Metodologias Ágeis', data: '2025-12-05', cargaHoraria: 4, status: 'Agendada' },
    ];
    let nextIdNumber = 6;

    // =================================================================
    // 2. SELEÇÃO DOS ELEMENTOS DO HTML (CORRIGIDO: Apenas uma seleção)
    // =================================================================
    const tabelaOficinasTbody = document.querySelector('#oficinas-table tbody');
    const btnNovaOficina = document.getElementById('btn-nova-oficina');
    const modal = document.getElementById('oficina-modal'); 
    
    // Novos Controles de Busca/Filtro
    const searchInput = document.getElementById('search-oficina');
    const filterStatusSelect = document.getElementById('filter-status');

    // Elementos internos do Modal
    const modalTitle = document.getElementById('modal-title');
    const oficinaForm = document.getElementById('oficina-form');
    const oficinaIdInput = document.getElementById('oficina-id');
    const nomeOficinaInput = document.getElementById('nome-oficina');
    const dataOficinaInput = document.getElementById('data-oficina');
    const cargaHorariaInput = document.getElementById('carga-horaria');
    const closeButtons = modal.querySelectorAll('[data-close-modal], #btn-cancelar, .close-btn');

    // SELEÇÃO CORRETA: O botão de Logout é selecionado aqui
    const logoutBtn = document.getElementById('logout-btn');

    // =================================================================
    // 3. FUNÇÕES DO MODAL
    // =================================================================

    const abrirModal = (oficina = null) => {
        oficinaForm.reset(); 
        if (oficina) { 
            modalTitle.textContent = 'Editar Oficina';
            oficinaIdInput.value = oficina.id;
            nomeOficinaInput.value = oficina.nome;
            dataOficinaInput.value = oficina.data;
            cargaHorariaInput.value = oficina.cargaHoraria;
        } else { 
            modalTitle.textContent = 'Adicionar Nova Oficina';
            oficinaIdInput.value = '';
        }
        modal.style.display = 'flex'; 
    };

    const fecharModal = () => {
        modal.style.display = 'none';
        oficinaForm.reset();
    };

    // =================================================================
    // 4. FUNÇÃO DE RENDERIZAÇÃO E FILTRO
    // =================================================================

    const renderizarTabela = () => {
        const termoBusca = searchInput.value.toLowerCase();
        const statusFiltro = filterStatusSelect.value;
        let oficinasFiltradas = mockOficinas;
        
        // 1. Aplica filtro de status
        if (statusFiltro !== 'todos') {
            oficinasFiltradas = oficinasFiltradas.filter(o => o.status.toLowerCase() === statusFiltro);
        }

        // 2. Aplica filtro de busca
        if (termoBusca) {
            oficinasFiltradas = oficinasFiltradas.filter(o => 
                o.nome.toLowerCase().includes(termoBusca) || 
                o.data.includes(termoBusca)
            );
        }

        tabelaOficinasTbody.innerHTML = ''; 
        
        if (oficinasFiltradas.length === 0) {
            tabelaOficinasTbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Nenhuma oficina encontrada.</td></tr>';
            return;
        }

        oficinasFiltradas.forEach(oficina => {
            const dataFormatada = new Date(oficina.data + 'T00:00:00').toLocaleDateString('pt-BR');
            const linha = document.createElement('tr');
            
            linha.innerHTML = `
                <td>${oficina.nome}</td>
                <td>${dataFormatada}</td>
                <td>${oficina.cargaHoraria}h</td>
                <td class="actions-icons">
                    <a href="../registrar-presenca/registrar-presenca.html?id=${oficina.id}" class="btn-action btn-presenca" title="Registrar Presença">
                        <i class="fas fa-user-check"></i>
                    </a>
                    <button class="btn-action btn-edit" title="Editar" data-id="${oficina.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" title="Excluir" data-id="${oficina.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            tabelaOficinasTbody.appendChild(linha);
        });
    };
    
    // =================================================================
    // 5. LÓGICA DE SALVAR
    // =================================================================

    oficinaForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const id = oficinaIdInput.value;
        const novaOficina = {
            nome: nomeOficinaInput.value,
            data: dataOficinaInput.value,
            cargaHoraria: parseInt(cargaHorariaInput.value),
            status: 'Agendada', 
        };

        if (id) { 
            const index = mockOficinas.findIndex(o => o.id === id);
            mockOficinas[index] = { ...mockOficinas[index], ...novaOficina };
        } else { 
            novaOficina.id = 'o' + new Date().getTime() + nextIdNumber++; 
            mockOficinas.push(novaOficina);
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
    if (btnNovaOficina) {
        btnNovaOficina.addEventListener('click', (event) => {
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

    // --- Funcionalidade 3: Ações da Tabela (Editar/Excluir) ---
    tabelaOficinasTbody.addEventListener('click', (event) => {
        const targetButton = event.target.closest('button');
        if (!targetButton) return;
        
        const id = targetButton.dataset.id;
        if (!id) return; 

        if (targetButton.classList.contains('btn-delete')) {
            if (confirm(`Tem certeza que deseja excluir a oficina?`)) {
                mockOficinas = mockOficinas.filter(o => o.id !== id);
                renderizarTabela();
            }
        } else if (targetButton.classList.contains('btn-edit')) {
            const oficinaParaEditar = mockOficinas.find(o => o.id === id);
            if (oficinaParaEditar) {
                 abrirModal(oficinaParaEditar);
            }
        }
    });

    // =================================================================
    // 7. LÓGICA DE LOGOUT (AGORA FUNCIONANDO)
    // =================================================================
    // Usamos a variável 'logoutBtn' selecionada na Seção 2
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            alert('Logout simulado! Redirecionando para a página de login.');
            // Redirecionamento para a página de login
            window.location.href = '../login/login.html'; 
        });
    }


    // =================================================================
    // 8. EXECUÇÃO INICIAL
    // =================================================================
    // GARANTIA DE FECHAMENTO AO CARREGAR
    if (modal) {
        modal.style.display = 'none'; 
    }
    renderizarTabela();
});