document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // 1. MOCK DATA (usando 'let' para podermos alterar o status)
    // =================================================================
    let mockVoluntarios = [
        { id: 'v01', nome: 'Brenda Beatriz', ra: 'a234567', curso: 'Engenharia de Software', status: 'Ativo' },
        { id: 'v02', nome: 'Giovana Kaori', ra: 'g765432', curso: 'Engenharia de Software', status: 'Ativo' },
        { id: 'v03', nome: 'Vitória Millnitz', ra: 'v543210', curso: 'Ciência da Computação', status: 'Inativo' },
        { id: 'v04', nome: 'Thaisse Kirian', ra: 't112233', curso: 'Engenharia de Software', status: 'Ativo' },
    ];

    // =================================================================
    // 2. SELEÇÃO DOS ELEMENTOS DO HTML
    // =================================================================
    const tabelaVoluntariosTbody = document.querySelector('#voluntarios-table tbody');
    const searchInput = document.getElementById('search-voluntario');
    const filterStatusSelect = document.getElementById('filter-status');

    // =================================================================
    // 3. FUNÇÃO DE RENDERIZAÇÃO COM FILTROS
    // =================================================================

    const renderizarTabela = () => {
        // Pega os valores atuais dos filtros
        const termoBusca = searchInput.value.toLowerCase();
        const statusFiltro = filterStatusSelect.value;

        // Começa com a lista completa
        let voluntariosFiltrados = mockVoluntarios;

        // 1. Aplica o filtro de status
        if (statusFiltro !== 'todos') {
            voluntariosFiltrados = voluntariosFiltrados.filter(voluntario => voluntario.status.toLowerCase() === statusFiltro);
        }

        // 2. Aplica o filtro de busca (no resultado do filtro anterior)
        if (termoBusca) {
            voluntariosFiltrados = voluntariosFiltrados.filter(voluntario => 
                voluntario.nome.toLowerCase().includes(termoBusca) || 
                voluntario.ra.toLowerCase().includes(termoBusca)
            );
        }

        // Limpa a tabela
        tabelaVoluntariosTbody.innerHTML = '';

        // Renderiza as linhas com os dados filtrados
        if (voluntariosFiltrados.length === 0) {
            tabelaVoluntariosTbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhum voluntário encontrado.</td></tr>';
            return;
        }

        voluntariosFiltrados.forEach(voluntario => {
            const isAtivo = voluntario.status === 'Ativo';
            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td>${voluntario.nome}</td>
                <td>${voluntario.ra}</td>
                <td>${voluntario.curso}</td>
                <td><span class="status-${isAtivo ? 'ativo' : 'inativo'}">${voluntario.status}</span></td>
                <td class="actions">
                    <a href="../detalhes-voluntario/detalhes-voluntario.html?id=${voluntario.id}" class="btn-action btn-details">Detalhes</a>
                    <button class="btn-action ${isAtivo ? 'btn-deactivate' : 'btn-activate'}" data-id="${voluntario.id}">
                        ${isAtivo ? 'Desativar' : 'Ativar'}
                    </button>
                </td>
            `;
            tabelaVoluntariosTbody.appendChild(linha);
        });
    };

    // =================================================================
    // 4. EVENT LISTENERS
    // =================================================================

    // "Escuta" o campo de busca a cada tecla digitada
    searchInput.addEventListener('input', renderizarTabela);

    // "Escuta" o menu dropdown quando uma opção é selecionada
    filterStatusSelect.addEventListener('change', renderizarTabela);

    // Usa delegação de eventos para os botões de Ativar/Desativar
    tabelaVoluntariosTbody.addEventListener('click', (event) => {
        const target = event.target;
        const id = target.dataset.id;
        
        if (target.classList.contains('btn-activate') || target.classList.contains('btn-deactivate')) {
            const index = mockVoluntarios.findIndex(v => v.id === id);
            if (index !== -1) {
                // Alterna o status
                mockVoluntarios[index].status = mockVoluntarios[index].status === 'Ativo' ? 'Inativo' : 'Ativo';
                // Redesenha a tabela para refletir a mudança
                renderizarTabela();
            }
        }
    });

    // =================================================================
    // 5. EXECUÇÃO INICIAL
    // =================================================================
    renderizarTabela();
});