document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // 1. SIMULAÇÃO DE DADOS E USUÁRIO LOGADO
    // =================================================================

    // Vamos fingir que o voluntário "Brenda Beatriz" (ID 'v01') fez login.
    const loggedInVoluntarioId = 'v01';

    // "Tabela" de Voluntários
    const mockVoluntarios = [
        { id: 'v01', nome: 'Brenda Beatriz' },
        { id: 'v02', nome: 'Giovana Kaori' },
        { id: 'v03', nome: 'Carlos Silva' },
    ];

    // "Tabela" de Oficinas
    const mockOficinas = [
        { id: 'o01', nome: 'Lógica com Blocos', data: '2025-09-25', cargaHoraria: 4 },
        { id: 'o02', nome: 'Introdução a HTML/CSS', data: '2025-08-10', cargaHoraria: 6 },
        { id: 'o03', nome: 'Robótica com Arduino', data: '2025-07-15', cargaHoraria: 8 },
    ];

    // "Tabela" de Participações - A ligação entre voluntários e oficinas
    const mockParticipacoes = [
        { voluntarioId: 'v01', oficinaId: 'o01' }, // Brenda participou da oficina o01
        { voluntarioId: 'v01', oficinaId: 'o03' }, // Brenda participou da oficina o03
        { voluntarioId: 'v02', oficinaId: 'o01' }, // Giovana participou da oficina o01
    ];

    // =================================================================
    // 2. SELEÇÃO DOS ELEMENTOS DO HTML
    // =================================================================

    const welcomeMessageEl = document.getElementById('welcome-message');
    const totalOficinasEl = document.getElementById('total-oficinas-realizadas');
    const totalHorasEl = document.getElementById('total-horas-acumuladas');
    const historicoTbody = document.querySelector('#historico-table tbody');
    const semHistoricoRow = document.getElementById('sem-historico-row');
    const logoutBtn = document.getElementById('logout-btn');

    // =================================================================
    // 3. LÓGICA PRINCIPAL
    // =================================================================

    // Encontra o objeto do voluntário logado
    const voluntarioLogado = mockVoluntarios.find(v => v.id === loggedInVoluntarioId);

    // Se não encontrar o voluntário (improvável com mock data), para a execução
    if (!voluntarioLogado) {
        console.error('Voluntário não encontrado!');
        return;
    }
    
    // Filtra as participações apenas do voluntário logado
    const participacoesDoVoluntario = mockParticipacoes.filter(p => p.voluntarioId === voluntarioLogado.id);
    
    // Mapeia as participações para obter os dados completos das oficinas
    const historicoDeOficinas = participacoesDoVoluntario.map(participacao => {
        return mockOficinas.find(oficina => oficina.id === participacao.oficinaId);
    });

    // --- Funções de Renderização ---

    function renderizarBoasVindas() {
        welcomeMessageEl.textContent = `Bem-vindo(a), ${voluntarioLogado.nome}!`;
    }

    function renderizarEstatisticas() {
        const totalOficinas = historicoDeOficinas.length;
        const totalHoras = historicoDeOficinas.reduce((soma, oficina) => soma + oficina.cargaHoraria, 0);

        totalOficinasEl.textContent = totalOficinas;
        totalHorasEl.textContent = `${totalHoras}h`;
    }

    function renderizarHistorico() {
        // Limpa as linhas de exemplo do HTML
        historicoTbody.innerHTML = ''; 

        if (historicoDeOficinas.length === 0) {
            // Mostra a linha "sem histórico" se não houver participações
            semHistoricoRow.style.display = 'table-row'; 
            historicoTbody.appendChild(semHistoricoRow);
        } else {
            // Cria e insere as linhas do histórico
            historicoDeOficinas.forEach(oficina => {
                const dataFormatada = new Date(oficina.data + 'T00:00:00').toLocaleDateString('pt-BR');
                const linha = document.createElement('tr');
                linha.innerHTML = `
                    <td>${oficina.nome}</td>
                    <td>${dataFormatada}</td>
                    <td>${oficina.cargaHoraria}h</td>
                `;
                historicoTbody.appendChild(linha);
            });
        }
    }

    // Lógica do botão de Sair
    logoutBtn.addEventListener('click', () => {
        alert('Logout simulado! Redirecionando para a página de login.');
        // No futuro, aqui virá a função de logout do Firebase
        window.location.href = '../login/login.html'; // Ajuste o caminho se necessário
    });

    // =================================================================
    // 4. EXECUÇÃO INICIAL
    // =================================================================
    
    renderizarBoasVindas();
    renderizarEstatisticas();
    renderizarHistorico();

});