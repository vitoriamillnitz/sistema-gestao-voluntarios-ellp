document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // 1. MOCK DATA (usaremos 'let' para poder modificar o array)
    // =================================================================
    let mockOficinas = [
        { id: 'o01', nome: 'Lógica com Blocos', data: '2025-10-25', cargaHoraria: 4, status: 'Agendada' },
        { id: 'o02', nome: 'Introdução a HTML/CSS', data: '2025-11-08', cargaHoraria: 6, status: 'Agendada' },
        { id: 'o03', nome: 'Robótica com Arduino', data: '2025-09-15', cargaHoraria: 8, status: 'Realizada' },
    ];

    // =================================================================
    // 2. SELEÇÃO DOS ELEMENTOS DO HTML
    // =================================================================
    const tabelaOficinasTbody = document.querySelector('#oficinas-table tbody');
    const btnNovaOficina = document.getElementById('btn-nova-oficina');
    const modal = document.getElementById('oficina-modal');
    const modalTitle = document.getElementById('modal-title');
    const closeBtn = document.querySelector('.close-btn');
    const btnCancelar = document.getElementById('btn-cancelar');
    const oficinaForm = document.getElementById('oficina-form');
    const oficinaIdInput = document.getElementById('oficina-id');
    const nomeOficinaInput = document.getElementById('nome-oficina');
    const dataOficinaInput = document.getElementById('data-oficina');
    const cargaHorariaInput = document.getElementById('carga-horaria');
    
    // =================================================================
    // 3. FUNÇÕES PRINCIPAIS
    // =================================================================

    /**
     * Limpa a tabela e a recria do zero com os dados do array mockOficinas.
     * Esta função será chamada sempre que os dados mudarem.
     */
    const renderizarTabela = () => {
        tabelaOficinasTbody.innerHTML = ''; // Limpa a tabela
        
        if (mockOficinas.length === 0) {
            tabelaOficinasTbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Nenhuma oficina cadastrada.</td></tr>';
            return;
        }

        mockOficinas.forEach(oficina => {
            const dataFormatada = new Date(oficina.data + 'T00:00:00').toLocaleDateString('pt-BR');
            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td>${oficina.nome}</td>
                <td>${dataFormatada}</td>
                <td>${oficina.cargaHoraria}h</td>
                <td class="actions">
                    <a href="../registrar-presenca/registrar-presenca.html?id=${oficina.id}" class="btn-action btn-presenca">Presença</a>
                    <button class="btn-action btn-edit" data-id="${oficina.id}">Editar</button>
                    <button class="btn-action btn-delete" data-id="${oficina.id}">Excluir</button>
                </td>
            `;
            tabelaOficinasTbody.appendChild(linha);
        });
    };

    /**
     * Abre o modal, opcionalmente preenchendo com dados para edição.
     * @param {object | null} oficina - O objeto da oficina para editar, ou null para criar uma nova.
     */
    const abrirModal = (oficina = null) => {
        oficinaForm.reset(); // Limpa o formulário
        if (oficina) { // Modo Edição
            modalTitle.textContent = 'Editar Oficina';
            oficinaIdInput.value = oficina.id;
            nomeOficinaInput.value = oficina.nome;
            dataOficinaInput.value = oficina.data;
            cargaHorariaInput.value = oficina.cargaHoraria;
        } else { // Modo Criação
            modalTitle.textContent = 'Adicionar Nova Oficina';
            oficinaIdInput.value = '';
        }
        modal.style.display = 'block';
    };

    /**
     * Fecha o modal.
     */
    const fecharModal = () => {
        modal.style.display = 'none';
    };

    // =================================================================
    // 4. EVENT LISTENERS (OUVINTES DE EVENTOS)
    // =================================================================

    // Lida com o salvamento do formulário (Criar ou Editar)
    oficinaForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const id = oficinaIdInput.value;
        const novaOficina = {
            nome: nomeOficinaInput.value,
            data: dataOficinaInput.value,
            cargaHoraria: parseInt(cargaHorariaInput.value),
            status: 'Agendada', // Status padrão para novas oficinas
        };

        if (id) { // Se tem ID, estamos editando
            const index = mockOficinas.findIndex(o => o.id === id);
            mockOficinas[index] = { ...mockOficinas[index], ...novaOficina };
        } else { // Se não tem ID, estamos criando
            novaOficina.id = 'o' + new Date().getTime(); // Gera um ID único
            mockOficinas.push(novaOficina);
        }
        
        renderizarTabela();
        fecharModal();
    });

    // Lida com cliques nos botões de Editar e Excluir usando DELEGAÇÃO DE EVENTOS
    tabelaOficinasTbody.addEventListener('click', (event) => {
        const target = event.target;
        const id = target.dataset.id;

        if (target.classList.contains('btn-edit')) {
            const oficinaParaEditar = mockOficinas.find(o => o.id === id);
            abrirModal(oficinaParaEditar);
        }

        if (target.classList.contains('btn-delete')) {
            if (confirm(`Tem certeza que deseja excluir a oficina?`)) {
                mockOficinas = mockOficinas.filter(o => o.id !== id);
                renderizarTabela();
            }
        }
    });

    // Eventos para abrir e fechar o modal
    btnNovaOficina.addEventListener('click', () => abrirModal());
    closeBtn.addEventListener('click', fecharModal);
    btnCancelar.addEventListener('click', fecharModal);
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            fecharModal();
        }
    });

    // =================================================================
    // 5. EXECUÇÃO INICIAL
    // =================================================================
    renderizarTabela();
});