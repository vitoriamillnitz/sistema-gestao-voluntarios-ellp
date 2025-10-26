/**
 * Script da página de Registro de Presença.
 * Desenvolvido por: [Seu Nome]
 * Data: 29/09/2025
 * * Funcionalidades:
 * - Carrega a oficina correta com base no ID da URL.
 * - Exibe a lista de voluntários ativos.
 * - Pré-seleciona os voluntários que já possuem presença registrada.
 * - Permite marcar/desmarcar todos os voluntários de uma vez.
 * - Salva o estado atual das presenças.
 */

// Garante que o script só será executado após o carregamento completo do HTML.
document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // 1. DADOS MOCADOS (MOCK DATA)
    // =================================================================
    const mockVoluntarios = [
        { id: 'v01', nome: 'Brenda Beatriz', ra: 'a234567', status: 'Ativo' },
        { id: 'v02', nome: 'Giovana Kaori', ra: 'g765432', status: 'Ativo' },
        { id: 'v03', nome: 'Vitória Millnitz', ra: 'v543210', status: 'Inativo' },
        { id: 'v04', nome: 'Thaisse Kirian', ra: 't112233', status: 'Ativo' },
    ];
    const mockOficinas = [
        { id: 'o01', nome: 'Lógica com Blocos', data: '2025-10-25', cargaHoraria: 4 },
        { id: 'o02', nome: 'Introdução a HTML/CSS', data: '2025-11-08', cargaHoraria: 6 },
    ];
    // Usamos 'let' pois esta lista será modificada ao salvar as presenças.
    let mockParticipacoes = [
        { voluntarioId: 'v01', oficinaId: 'o01' },
        { voluntarioId: 'v02', oficinaId: 'o01' },
    ];

    // =================================================================
    // 2. SELEÇÃO DOS ELEMENTOS E LÓGICA INICIAL
    // =================================================================

    // Seleção dos principais elementos da página com os quais vamos interagir.
    const nomeOficinaEl = document.getElementById('nome-oficina');
    const listaPresencaUl = document.querySelector('.lista-presenca');
    const marcarTodosCheckbox = document.getElementById('marcar-todos');
    const presencaForm = document.getElementById('presenca-form');
    
    // NOVO: Seleção do botão de Logout (Ele está na estrutura do menu lateral)
    const logoutBtn = document.getElementById('logout-btn');

    // Pega os parâmetros da URL (ex: ?id=o01) para saber de qual oficina se trata.
    const urlParams = new URLSearchParams(window.location.search);
    // Extrai o valor do parâmetro 'id'.
    const oficinaId = urlParams.get('id');

    // Busca o objeto completo da oficina atual no nosso array de mock data.
    const oficinaAtual = mockOficinas.find(o => o.id === oficinaId);

    // Validação de segurança: se a oficina não for encontrada, exibe uma mensagem de erro e para a execução.
    if (!oficinaAtual) {
        document.querySelector('.container').innerHTML = '<h1>Oficina não encontrada!</h1><p>Verifique o link e tente novamente.</p>';
        return;
    }

    // =================================================================
    // 3. FUNÇÕES DE RENDERIZAÇÃO
    // =================================================================
    
    /**
     * Responsável por popular a página com os dados da oficina e a lista de voluntários.
     * Atualiza o título e gera a lista de checkboxes com base nos voluntários ativos.
     */
    const renderizarLista = () => {
        // Atualiza o título <h1> com o nome da oficina encontrada.
        nomeOficinaEl.textContent = oficinaAtual.nome;
        
        // Limpa a lista de presenças para evitar duplicatas ao re-renderizar.
        listaPresencaUl.innerHTML = '';
        
        // Cria um array contendo apenas os IDs dos voluntários que já possuem presença registrada para esta oficina.
        const idsPresentes = mockParticipacoes
            .filter(p => p.oficinaId === oficinaId)
            .map(p => p.voluntarioId);

        // Filtra a lista de voluntários para exibir apenas aqueles com status 'Ativo'.
        const voluntariosAtivos = mockVoluntarios.filter(v => v.status === 'Ativo');
        
        // Itera sobre cada voluntário ativo para criar um item na lista.
        voluntariosAtivos.forEach(voluntario => {
            // Verifica se o voluntário atual já está na lista de presentes.
            const isPresente = idsPresentes.includes(voluntario.id);
            const li = document.createElement('li');

            // Cria o HTML do item da lista, marcando o checkbox com 'checked' se o voluntário já estava presente.
            li.innerHTML = `
                <input type="checkbox" id="vol-${voluntario.id}" name="voluntarios" value="${voluntario.id}" ${isPresente ? 'checked' : ''}>
                <label for="vol-${voluntario.id}">${voluntario.nome} (${voluntario.ra})</label>
            `;
            // Adiciona o novo item (<li>) à lista na página.
            listaPresencaUl.appendChild(li);
        });
    };

    // =================================================================
    // 4. EVENT LISTENERS (OUVINTES DE EVENTOS)
    // =================================================================

    // Adiciona o evento para o checkbox "Marcar/Desmarcar Todos".
    marcarTodosCheckbox.addEventListener('change', (event) => {
        const isChecked = event.target.checked;
        // Pega todos os checkboxes da lista e define o estado deles para ser o mesmo do checkbox principal.
        const checkboxes = listaPresencaUl.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
        });
    });

    // Adiciona o evento de 'submit' ao formulário para salvar as presenças.
    presencaForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Impede o recarregamento da página.

        // Passo 1: Limpa o registro de presença *apenas para esta oficina*.
        mockParticipacoes = mockParticipacoes.filter(p => p.oficinaId !== oficinaId);

        // Pega todos os checkboxes que estão atualmente marcados na tela.
        const checkboxesMarcados = listaPresencaUl.querySelectorAll('input[type="checkbox"]:checked');
        
        // Passo 2: Para cada checkbox marcado, cria um novo registro de participação e o adiciona ao nosso array principal.
        checkboxesMarcados.forEach(checkbox => {
            // Verifica se o ID do checkbox principal não está sendo incluído acidentalmente
            if (checkbox.id !== 'marcar-todos') {
                mockParticipacoes.push({
                    voluntarioId: checkbox.value,
                    oficinaId: oficinaId,
                });
            }
        });

        console.log('Lista de presença atualizada:', mockParticipacoes);
        alert('Presenças salvas com sucesso!');
        
        // Após salvar, redireciona o usuário de volta para a tela de gerenciamento.
        window.location.href = '../gerenciar-oficinas/gerenciar-oficinas.html';
    });
    
    // --- LÓGICA DE LOGOUT (NOVO) ---
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
    // Chama a função de renderização uma vez no início para popular a página assim que ela for carregada.
    renderizarLista();
});