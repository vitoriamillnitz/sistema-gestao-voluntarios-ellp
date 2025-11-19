// ======================================================
// 1. IMPORTAÇÕES
// ======================================================
// Certifique-se que o caminho aponta para o SEU arquivo de config
import { auth, db } from '../../firebase/config.js'; 
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { signOut } from "firebase/auth";

document.addEventListener('DOMContentLoaded', () => {

    // 2. SELEÇÃO DE ELEMENTOS
    const tabelaVoluntariosTbody = document.querySelector('#voluntarios-table tbody');
    // Botão "Novo" removido daqui
    const modal = document.getElementById('voluntario-modal'); 
    const searchInput = document.getElementById('search-voluntario');
    const filterStatusSelect = document.getElementById('filter-status');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Modal Elements
    const voluntarioForm = document.getElementById('voluntario-form');
    const voluntarioIdInput = document.getElementById('voluntario-id');
    const nomeCompletoInput = document.getElementById('nome-completo');
    const emailInput = document.getElementById('email');
    const telefoneInput = document.getElementById('telefone');
    const closeButtons = document.querySelectorAll('[data-close-modal], #btn-cancelar, .close-btn');

    let listaVoluntarios = [];

    // ======================================================
    // 3. CARREGAR DADOS (READ)
    // ======================================================
    const carregarVoluntarios = async () => {
        tabelaVoluntariosTbody.innerHTML = '<tr><td colspan="4" style="text-align:center">Carregando...</td></tr>';
        
        try {
            const querySnapshot = await getDocs(collection(db, "voluntarios"));
            listaVoluntarios = [];

            querySnapshot.forEach((doc) => {
                listaVoluntarios.push({ id: doc.id, ...doc.data() });
            });

            renderizarTabela();

        } catch (error) {
            console.error("Erro ao buscar voluntários:", error);
            tabelaVoluntariosTbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:red">Erro ao carregar dados.</td></tr>';
        }
    };

    // ======================================================
    // 4. RENDERIZAR TABELA
    // ======================================================
    const renderizarTabela = () => {
        const termo = searchInput.value.toLowerCase();
        const statusFiltro = filterStatusSelect.value;

        const filtrados = listaVoluntarios.filter(v => {
            const nome = v.nome ? v.nome.toLowerCase() : '';
            const email = v.email ? v.email.toLowerCase() : '';
            
            const matchNome = nome.includes(termo);
            const matchEmail = email.includes(termo);
            const matchStatus = statusFiltro === 'todos' || v.status === statusFiltro;
            return (matchNome || matchEmail) && matchStatus;
        });

        tabelaVoluntariosTbody.innerHTML = '';

        if (filtrados.length === 0) {
            tabelaVoluntariosTbody.innerHTML = '<tr><td colspan="4" style="text-align:center">Nenhum voluntário encontrado.</td></tr>';
            return;
        }

        filtrados.forEach(voluntario => {
            const statusClass = voluntario.status === 'ativo' ? 'status-active' : 'status-inativo';
            const statusText = voluntario.status === 'ativo' ? 'Ativo' : 'Inativo';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${voluntario.nome}</td>
                <td>${voluntario.email}</td>
                <td><span class="${statusClass}">${statusText}</span></td>
                <td class="actions-icons">
                    <a href="../detalhes-voluntario/detalhes-voluntario.html?id=${voluntario.id}" class="btn-action btn-details" title="Ver Detalhes">
                        <i class="fas fa-eye"></i>
                    </a>
                    <button class="btn-action btn-edit" title="Editar Dados" data-id="${voluntario.id}">
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
            tabelaVoluntariosTbody.appendChild(tr);
        });
    };

    // ======================================================
    // 5. FUNÇÕES DO MODAL (APENAS EDIÇÃO)
    // ======================================================
    const abrirModalEdicao = (voluntario) => {
        voluntarioForm.reset();
        // Preenche com os dados atuais
        voluntarioIdInput.value = voluntario.id;
        nomeCompletoInput.value = voluntario.nome;
        emailInput.value = voluntario.email;
        telefoneInput.value = voluntario.telefone || '';
        
        modal.style.display = 'flex'; 
    };

    const fecharModal = () => {
        modal.style.display = 'none';
        voluntarioForm.reset();
    };

    // Fecha ao clicar fora ou nos botões X
    closeButtons.forEach(btn => btn.addEventListener('click', fecharModal));
    window.addEventListener('click', (e) => {
        if (e.target === modal) fecharModal();
    });

    // ======================================================
    // 6. LÓGICA DE SALVAR (UPDATE)
    // ======================================================
    voluntarioForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const id = voluntarioIdInput.value;
        const novosDados = {
            nome: nomeCompletoInput.value,
            telefone: telefoneInput.value
            // Não atualizamos o email aqui para evitar complexidade com Auth
        };

        if (!id) return; // Segurança extra

        try {
            const volRef = doc(db, "voluntarios", id);
            await updateDoc(volRef, novosDados);
            
            alert('Dados do voluntário atualizados com sucesso!');
            fecharModal();
            carregarVoluntarios(); // Atualiza a tabela

        } catch (error) {
            console.error("Erro ao atualizar:", error);
            alert("Erro ao salvar alterações.");
        }
    });

    // ======================================================
    // 7. LISTENERS DA TABELA (EDITAR / ATIVAR / DESATIVAR)
    // ======================================================
    tabelaVoluntariosTbody.addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        const id = btn.dataset.id;

        // --- AÇÃO DE EDITAR ---
        if (btn.classList.contains('btn-edit')) {
            // Encontra os dados no array local para não ter que ir no banco de novo
            const voluntario = listaVoluntarios.find(v => v.id === id);
            if (voluntario) {
                abrirModalEdicao(voluntario);
            }
        }
        
        // --- AÇÃO DE ALTERAR STATUS ---
        else if (btn.dataset.action) {
            const action = btn.dataset.action;
            const novoStatus = action === 'desativar' ? 'inativo' : 'ativo';
            const confirmMsg = `Tem certeza que deseja ${action} este voluntário?`;

            if (confirm(confirmMsg)) {
                try {
                    const volRef = doc(db, "voluntarios", id);
                    await updateDoc(volRef, { status: novoStatus });
                    
                    alert(`Voluntário ${action === 'desativar' ? 'desativado' : 'ativado'} com sucesso!`);
                    carregarVoluntarios(); 

                } catch (error) {
                    console.error("Erro ao atualizar status:", error);
                    alert("Erro ao atualizar status.");
                }
            }
        }
    });

    // ======================================================
    // 8. FILTROS E LOGOUT
    // ======================================================
    searchInput.addEventListener('input', renderizarTabela);
    filterStatusSelect.addEventListener('change', renderizarTabela);

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await signOut(auth);
            window.location.href = '../login/login.html';
        });
    }

    // Inicializa
    carregarVoluntarios();
});