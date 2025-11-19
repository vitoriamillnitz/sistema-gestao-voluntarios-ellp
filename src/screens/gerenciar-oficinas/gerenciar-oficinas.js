// ======================================================
// 1. IMPORTAÇÕES
// ======================================================
import { auth, db } from '../../firebase/firebase-config.js';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { signOut } from "firebase/auth";

document.addEventListener('DOMContentLoaded', () => {

    // ======================================================
    // 2. SELEÇÃO DE ELEMENTOS
    // ======================================================
    const tabelaOficinasTbody = document.querySelector('#oficinas-table tbody');
    const btnNovaOficina = document.getElementById('btn-nova-oficina');
    const modal = document.getElementById('oficina-modal');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Filtros
    const searchInput = document.getElementById('search-oficina');
    const filterStatusSelect = document.getElementById('filter-status');

    // Elementos do Modal
    const oficinaForm = document.getElementById('oficina-form');
    const btnCancelar = document.getElementById('btn-cancelar');
    const closeBtn = document.querySelector('.close-btn');

    // Inputs do formulário
    const nomeInput = document.getElementById('nome-oficina');
    const dataInput = document.getElementById('data-oficina');
    const cargaHorariaInput = document.getElementById('carga-horaria');

    let listaOficinas = []; // Array local para busca/filtro

    // ======================================================
    // 3. CARREGAR DADOS (READ)
    // ======================================================
    const carregarOficinas = async () => {
        tabelaOficinasTbody.innerHTML = '<tr><td colspan="4" style="text-align:center">Carregando...</td></tr>';
        
        try {
            // Busca na coleção "oficinas", tentando ordenar por data
            // Nota: Se der erro de índice no console, remova o orderBy temporariamente
            const q = query(collection(db, "oficinas"), orderBy("data", "asc")); 
            // Se preferir sem ordenação por enquanto: const q = collection(db, "oficinas");
            
            const querySnapshot = await getDocs(q);
            listaOficinas = [];

            querySnapshot.forEach((doc) => {
                listaOficinas.push({ id: doc.id, ...doc.data() });
            });

            renderizarTabela();

        } catch (error) {
            console.error("Erro ao listar oficinas:", error);
            // Fallback: tenta buscar sem ordenação se falhar (índice não criado)
            if (error.code === 'failed-precondition') {
                const snap = await getDocs(collection(db, "oficinas"));
                listaOficinas = [];
                snap.forEach(doc => listaOficinas.push({ id: doc.id, ...doc.data() }));
                renderizarTabela();
            } else {
                tabelaOficinasTbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:red">Erro ao carregar dados.</td></tr>';
            }
        }
    };

    // ======================================================
    // 4. RENDERIZAR TABELA
    // ======================================================
    const renderizarTabela = () => {
        const termo = searchInput.value.toLowerCase();
        const statusFiltro = filterStatusSelect.value; // 'agendada', 'realizada', 'todos'

        // Hoje para comparação de status
        const hoje = new Date().toISOString().split('T')[0];

        const filtradas = listaOficinas.filter(oficina => {
            const matchNome = oficina.nome.toLowerCase().includes(termo);
            const matchData = oficina.data.includes(termo);
            
            // Lógica simples de status baseada na data
            let statusReal = oficina.data < hoje ? 'realizada' : 'agendada';
            if (oficina.status) statusReal = oficina.status; // Se tiver status salvo no banco, usa ele

            const matchStatus = statusFiltro === 'todos' || statusReal === statusFiltro;

            return (matchNome || matchData) && matchStatus;
        });

        tabelaOficinasTbody.innerHTML = '';

        if (filtradas.length === 0) {
            tabelaOficinasTbody.innerHTML = '<tr><td colspan="4" style="text-align:center">Nenhuma oficina encontrada.</td></tr>';
            return;
        }

        filtradas.forEach(oficina => {
            // Formata data (PT-BR)
            const dataFormatada = new Date(oficina.data + 'T12:00:00').toLocaleDateString('pt-BR');
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${oficina.nome}</td>
                <td>${dataFormatada}</td>
                <td>${oficina.cargaHoraria}h</td>
                <td class="actions-icons">
                    <a href="../registrar-presenca/registrar-presenca.html?id=${oficina.id}" class="btn-action btn-presenca" title="Registrar Presença">
                        <i class="fas fa-user-check"></i>
                    </a>
                    <button class="btn-action btn-delete" data-id="${oficina.id}" title="Excluir">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            tabelaOficinasTbody.appendChild(row);
        });
    };

    // ======================================================
    // 5. CRIAR OFICINA (CREATE)
    // ======================================================
    oficinaForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const novaOficina = {
            nome: nomeInput.value,
            data: dataInput.value,
            cargaHoraria: Number(cargaHorariaInput.value),
            status: 'agendada' // Status inicial padrão
        };

        try {
            await addDoc(collection(db, "oficinas"), novaOficina);
            alert('Oficina cadastrada com sucesso!');
            fecharModal();
            carregarOficinas(); // Recarrega a tabela

        } catch (error) {
            console.error("Erro ao cadastrar:", error);
            alert("Erro ao cadastrar oficina.");
        }
    });

    // ======================================================
    // 6. EXCLUIR OFICINA (DELETE)
    // ======================================================
    tabelaOficinasTbody.addEventListener('click', async (e) => {
        const btn = e.target.closest('.btn-delete');
        if (!btn) return;

        const id = btn.dataset.id;
        if (confirm("Tem certeza que deseja excluir esta oficina? Isso não pode ser desfeito.")) {
            try {
                await deleteDoc(doc(db, "oficinas", id));
                alert("Oficina excluída!");
                carregarOficinas();
            } catch (error) {
                console.error("Erro ao excluir:", error);
                alert("Erro ao excluir oficina.");
            }
        }
    });

    // ======================================================
    // 7. MODAL, FILTROS E LOGOUT
    // ======================================================
    
    const fecharModal = () => {
        modal.style.display = "none";
        oficinaForm.reset();
    };

    if (btnNovaOficina) btnNovaOficina.addEventListener('click', () => modal.style.display = "flex");
    if (btnCancelar) btnCancelar.addEventListener('click', fecharModal);
    if (closeBtn) closeBtn.addEventListener('click', fecharModal);
    
    window.onclick = (event) => {
        if (event.target == modal) fecharModal();
    };

    // Filtros
    searchInput.addEventListener('input', renderizarTabela);
    filterStatusSelect.addEventListener('change', renderizarTabela);

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await signOut(auth);
            window.location.href = '../login/login.html';
        });
    }

    // Garante modal fechado no início
    if (modal) modal.style.display = 'none';

    // Inicializa
    carregarOficinas();
});