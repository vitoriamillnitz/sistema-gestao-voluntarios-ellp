// Aguarda o HTML ser completamente carregado
document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // 1. DADOS MOCADOS (MOCK DATA)
    // Simula os dados que viriam do banco de dados (Firebase)
    // =================================================================

    const mockVoluntarios = [
        { id: 'v01', nome: 'Brenda Beatriz', horasAcumuladas: 22 },
        { id: 'v02', nome: 'Giovana Kaori', horasAcumuladas: 18 },
        { id: 'v03', nome: 'Vitória Millnitz', horasAcumuladas: 30 },
        { id: 'v04', nome: 'Thaisse Kirian', horasAcumuladas: 12 },
    ];

    const mockOficinas = [
        { id: 'o01', nome: 'Lógica com Blocos', data: '2025-10-25', cargaHoraria: 4, status: 'Agendada' },
        { id: 'o02', nome: 'Introdução a HTML/CSS', data: '2025-11-08', cargaHoraria: 6, status: 'Agendada' },
        { id: 'o03', nome: 'Robótica com Arduino', data: '2025-09-15', cargaHoraria: 8, status: 'Realizada' },
    ];

    // =================================================================
    // 2. SELEÇÃO DOS ELEMENTOS DO HTML
    // =================================================================
    
    const totalVoluntariosEl = document.getElementById('total-voluntarios');
    const totalOficinasEl = document.getElementById('total-oficinas');
    const totalHorasProjetoEl = document.getElementById('total-horas-projeto');
    const tabelaOficinasTbody = document.querySelector('#proximas-oficinas-table tbody');
    // NOVO: Seleção do botão de Logout
    const logoutBtn = document.getElementById('logout-btn');


    // =================================================================
    // 3. FUNÇÕES PARA RENDERIZAR OS DADOS
    // =================================================================

    /**
     * Calcula as estatísticas e atualiza os cards no topo da página.
     */
    function renderizarEstatisticas() {
        // Calcula o total de voluntários
        const totalVoluntarios = mockVoluntarios.length;
        
        // Calcula o total de oficinas
        const totalOficinas = mockOficinas.length;

        // Calcula o total de horas somando as horas de todos os voluntários
        const totalHoras = mockVoluntarios.reduce((soma, voluntario) => soma + voluntario.horasAcumuladas, 0);

        // Atualiza o texto dos elementos no HTML
        totalVoluntariosEl.textContent = totalVoluntarios;
        totalOficinasEl.textContent = totalOficinas;
        totalHorasProjetoEl.textContent = `${totalHoras}h`;
    }

    /**
     * Filtra as próximas oficinas e as exibe na tabela.
     */
    function renderizarProximasOficinas() {
        // Limpa a tabela, removendo as linhas de exemplo do HTML
        tabelaOficinasTbody.innerHTML = '';

        // Filtra apenas as oficinas com status "Agendada"
        const proximasOficinas = mockOficinas.filter(oficina => oficina.status === 'Agendada');

        // Se não houver oficinas agendadas, exibe a mensagem padrão
        if (proximasOficinas.length === 0) {
            const linhaVazia = `
                <tr>
                    <td colspan="4" style="text-align: center;">Nenhuma oficina agendada.</td>
                </tr>
            `;
            tabelaOficinasTbody.innerHTML = linhaVazia;
            return; // Encerra a função aqui
        }

        // Para cada oficina agendada, cria uma nova linha na tabela
        proximasOficinas.forEach(oficina => {
            // NOTA: A data precisa ser formatada corretamente. O JS usará '2025-10-25T00:00:00'
            const dataFormatada = new Date(oficina.data + 'T00:00:00').toLocaleDateString('pt-BR');

            const linha = document.createElement('tr');
            // A classe 'status status-scheduled' seria ideal aqui no <td>
            linha.innerHTML = `
                <td>${oficina.nome}</td>
                <td>${dataFormatada}</td>
                <td>${oficina.cargaHoraria}h</td>
                <td class="status status-scheduled">${oficina.status}</td>
            `;
            tabelaOficinasTbody.appendChild(linha);
        });
    }

    // =================================================================
    // 4. LÓGICA DE LOGOUT (NOVO)
    // =================================================================

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // 1. Simulação de limpeza de sessão (opcional)
            // localStorage.removeItem('authToken'); 
            
            // 2. Feedback
            alert('Logout simulado! Redirecionando para a página de login.');

            // 3. Redirecionamento (ajustado para sair da pasta do coordenador)
            window.location.href = '../login/login.html'; 
        });
    }

    // =================================================================
    // 5. EXECUÇÃO INICIAL
    // Chama as funções para popular a página assim que ela carrega.
    // =================================================================
    
    renderizarEstatisticas();
    renderizarProximasOficinas();

});