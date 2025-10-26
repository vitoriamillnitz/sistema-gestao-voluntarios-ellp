// =================================================================
// FUNÇÃO GLOBAL DE LOGOUT (Chamada pelo HTML onclick)
// =================================================================
function handleLogout() { // Usando 'function' para garantir compatibilidade
    console.log("Tentando executar handleLogout()..."); 
    alert('Logout simulado! Redirecionando para a página de login.');
    window.location.href = '../login/login.html'; 
}

document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // 1. MOCK DATA 
    // =================================================================
    const loggedInVoluntarioId = 'v01';
    const mockVoluntarios = [ { id: 'v01', nome: 'Brenda Beatriz' }, /* ... */ ];
    const mockOficinas = [ { id: 'o01', nome: 'Lógica com Blocos', data: '2025-09-25', cargaHoraria: 4 }, /* ... */ ];
    const mockParticipacoes = [ { voluntarioId: 'v01', oficinaId: 'o01' }, /* ... */ ];
    
    // Certifique-se que os IDs são strings
    let mockTarefas = [
        { id: 't1', descricao: 'Preparar material para a oficina de Scratch', dataVencimento: '2025-09-28', concluida: false },
        { id: 't2', descricao: 'Enviar e-mail de lembrete para o grupo', dataVencimento: '2025-09-30', concluida: false },
    ];
    let nextTaskId = 3;

    // =================================================================
    // 2. SELEÇÃO DOS ELEMENTOS DO HTML
    // =================================================================
    const welcomeMessageEl = document.getElementById('welcome-message');
    const totalOficinasEl = document.getElementById('total-oficinas-realizadas');
    const totalHorasEl = document.getElementById('total-horas-acumuladas');
    const historicoTbody = document.querySelector('#historico-table tbody');
    const novaTarefaForm = document.getElementById('nova-tarefa-form');
    const descricaoInput = document.getElementById('descricao-tarefa');
    const dataInput = document.getElementById('data-tarefa');
    const listaTarefasUl = document.getElementById('lista-tarefas');

    // =================================================================
    // 3. LÓGICA PRINCIPAL E FUNÇÕES DE RENDERIZAÇÃO
    // =================================================================
    const voluntarioLogado = mockVoluntarios.find(v => v.id === loggedInVoluntarioId);
    if (!voluntarioLogado) { console.error('Voluntário não encontrado!'); }
    
    const participacoesDoVoluntario = mockParticipacoes.filter(p => p.voluntarioId === voluntarioLogado.id);
    const historicoDeOficinas = participacoesDoVoluntario.map(p => mockOficinas.find(o => o.id === p.oficinaId)).filter(o => o);

    const formatarData = (dataString) => {
        if (!dataString) return '';
        try {
            // Se já estiver formatado, retorna
            if (dataString.includes('/')) return dataString; 
            // Assume AAAA-MM-DD
            const date = new Date(dataString + 'T00:00:00'); // Adiciona T00:00 para evitar fuso horário
            if (isNaN(date.getTime())) return dataString; 
            return date.toLocaleDateString('pt-BR'); 
        } catch (e) { return dataString; }
    };

    function renderizarBoasVindas() { 
        if (welcomeMessageEl && voluntarioLogado) welcomeMessageEl.textContent = `Bem-vindo(a), ${voluntarioLogado.nome}!`;
    }
    function renderizarEstatisticas() { 
        const totalOficinas = historicoDeOficinas.length;
        const totalHoras = historicoDeOficinas.reduce((soma, oficina) => soma + (oficina ? oficina.cargaHoraria : 0), 0);
        if (totalOficinasEl) totalOficinasEl.textContent = totalOficinas;
        if (totalHorasEl) totalHorasEl.textContent = `${totalHoras}h`;
     }
    function renderizarHistorico() { 
        if (!historicoTbody) return;
        historicoTbody.innerHTML = ''; 
        if (historicoDeOficinas.length === 0) {
            historicoTbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Nenhuma participação registrada.</td></tr>';
        } else {
            historicoDeOficinas.forEach(oficina => {
                if (!oficina) return;
                const linha = document.createElement('tr');
                linha.innerHTML = `<td>${oficina.nome}</td><td>${formatarData(oficina.data)}</td><td>${oficina.cargaHoraria}h</td>`;
                historicoTbody.appendChild(linha);
            });
        }
     }

    // Função para renderizar a agenda (com aria-label)
    function renderizarAgenda() {
        if (!listaTarefasUl) return;
        const tarefasPendentes = mockTarefas.filter(t => !t.concluida);
        if (tarefasPendentes.length === 0) {
            listaTarefasUl.innerHTML = '<li class="empty-list-message"><p>Você não tem tarefas pendentes. Adicione uma acima!</p></li>';
            return;
        }
        
        listaTarefasUl.innerHTML = tarefasPendentes.map(tarefa => {
            const dataFormatada = formatarData(tarefa.dataVencimento);
            const descricaoSanitizada = tarefa.descricao.replace(/"/g, "'"); 
            
            return `
                <li class="task-item">
                    <div class="tarefa-info">
                        <span class="tarefa-descricao">${tarefa.descricao}</span>
                        <span class="tarefa-data">Vencimento: ${dataFormatada}</span>
                    </div>
                    <div class="tarefa-actions">
                        <button class="btn-action btn-concluir" data-id="${tarefa.id}" title="Concluir Tarefa" aria-label="Concluir tarefa: ${descricaoSanitizada}">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn-action btn-excluir" data-id="${tarefa.id}" title="Excluir Tarefa" aria-label="Excluir tarefa: ${descricaoSanitizada}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </li>
            `;
        }).join('');
    }

    // =================================================================
    // 4. LISTENERS DA AGENDA E LOGOUT - CORREÇÃO FINAL E DETALHADA
    // =================================================================

    // --- Ação 1: Adicionar Nova Tarefa ---
    if (novaTarefaForm) {
        novaTarefaForm.addEventListener('submit', (event) => {
             event.preventDefault(); 
             const descricao = descricaoInput.value.trim();
             const dataVencimento = dataInput.value;
             if (descricao && dataVencimento) {
                 // Certifique-se de que o ID seja uma string
                 const novoId = `t${new Date().getTime() + nextTaskId++}`; 
                 mockTarefas.push({ id: novoId, descricao, dataVencimento, concluida: false });
                 novaTarefaForm.reset(); 
                 renderizarAgenda(); 
                 console.log("Nova tarefa adicionada:", mockTarefas); // Debug
             }
        });
    }

    // --- Ação 2: Concluir/Excluir Tarefas ---
    if (listaTarefasUl) {
        listaTarefasUl.addEventListener('click', (event) => {
            // Encontra o botão de ação mais próximo que tenha o data-id
            const target = event.target.closest('.btn-action[data-id]'); 
            
            if (!target) {
                console.log("Clique não foi em um botão de ação com data-id."); // Debug
                return; // Ignora se o clique não foi em um botão de ação válido
            }

            // Captura o ID da tarefa (string)
            const taskId = target.dataset.id;
            console.log("Botão clicado! Tarefa ID:", taskId); // Debug

            // Encontra o índice da tarefa no array de dados (comparando strings)
            const index = mockTarefas.findIndex(t => String(t.id) === String(taskId)); 
            
            if (index === -1) {
                console.error("Erro: Tarefa com ID", taskId, "não encontrada no array mockTarefas."); // Debug
                return; // Tarefa não encontrada
            }

            if (target.classList.contains('btn-concluir')) {
                // Ação de Concluir
                console.log("Concluindo tarefa:", mockTarefas[index].descricao); // Debug
                mockTarefas[index].concluida = true;
            } 
            else if (target.classList.contains('btn-excluir')) {
                // Ação de Excluir
                if (confirm(`Tem certeza que deseja excluir a tarefa "${mockTarefas[index].descricao}"?`)) {
                    console.log("Excluindo tarefa:", mockTarefas[index].descricao); // Debug
                    mockTarefas.splice(index, 1); 
                }
            }
            
            console.log("Array mockTarefas após ação:", mockTarefas); // Debug
            renderizarAgenda(); // Atualiza a visualização
        });
    }

    // --- Ação 3: Lógica do botão de Sair (EventListener, como fallback) ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        // Remove listener anterior se existir (segurança)
        logoutBtn.removeEventListener('click', handleLogout); 
        logoutBtn.addEventListener('click', handleLogout); 
        console.log("Listener de Logout (backup) anexado."); 
    } else {
        console.error("ERRO: Botão de Logout (id='logout-btn') não encontrado para o listener de backup.");
    }
    
    // =================================================================
    // 5. EXECUÇÃO INICIAL
    // =================================================================
    try {
        if (voluntarioLogado) {
             renderizarBoasVindas();
             renderizarEstatisticas();
             renderizarHistorico();
             renderizarAgenda(); 
        } else {
             console.error("Dados do voluntário logado não encontrados para renderização.");
        }
    } catch (error) {
        console.error("Erro durante a renderização inicial:", error);
    }

});