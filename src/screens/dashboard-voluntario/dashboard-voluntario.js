// ======================================================
// 1. IMPORTAÇÕES DO FIREBASE
// ======================================================
import { auth, db } from '../../firebase/config';
import { doc, getDoc, collection, query, where, getDocs, addDoc, deleteDoc, updateDoc, orderBy } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";

document.addEventListener('DOMContentLoaded', () => {

    // ======================================================
    // 2. SELEÇÃO DOS ELEMENTOS DO HTML
    // ======================================================
    const welcomeMessageEl = document.getElementById('welcome-message');
    const totalOficinasEl = document.getElementById('total-oficinas-realizadas');
    const totalHorasEl = document.getElementById('total-horas-acumuladas');
    const historicoTbody = document.querySelector('#historico-table tbody');
    
    // Elementos da Agenda
    const novaTarefaForm = document.getElementById('nova-tarefa-form');
    const descricaoInput = document.getElementById('descricao-tarefa');
    const dataInput = document.getElementById('data-tarefa');
    const listaTarefasUl = document.getElementById('lista-tarefas');
    
    // Botão Sair
    const logoutBtn = document.getElementById('logout-btn');

    let currentUser = null;

    // ======================================================
    // 3. VERIFICAR AUTENTICAÇÃO (O Porteiro)
    // ======================================================
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            await carregarDadosPrincipais();
            await carregarAgenda();
        } else {
            // Se não estiver logado, manda pro login
            window.location.href = '../login/login.html';
        }
    });

    // ======================================================
    // 4. FUNÇÕES AUXILIARES
    // ======================================================
    const formatarData = (dataString) => {
        if (!dataString) return '--/--/----';
        try {
            // Adiciona T12:00:00 para evitar problemas de fuso horário subtraindo um dia
            const date = new Date(dataString + 'T12:00:00'); 
            return date.toLocaleDateString('pt-BR'); 
        } catch (e) { return dataString; }
    };

    // ======================================================
    // 5. CARREGAR DADOS DO PERFIL E HISTÓRICO
    // ======================================================
    const carregarDadosPrincipais = async () => {
        try {
            // A. Buscar Dados do Voluntário (Nome e Horas)
            const docRef = doc(db, "voluntarios", currentUser.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const dados = docSnap.data();
                welcomeMessageEl.textContent = `Bem-vindo(a), ${dados.nome}!`;
                
                // Mostra o total de horas salvo no perfil
                const totalHoras = dados.horasAcumuladas || 0;
                totalHorasEl.textContent = `${totalHoras}h`;
            }

            // B. Buscar Histórico de Presenças (Coleção 'presencas')
            const q = query(
                collection(db, "presencas"), 
                where("voluntarioId", "==", currentUser.uid)
            );
            const querySnapshot = await getDocs(q);

            // Atualiza contador de oficinas
            totalOficinasEl.textContent = querySnapshot.size;

            // Renderiza Tabela
            historicoTbody.innerHTML = '';
            
            if (querySnapshot.empty) {
                historicoTbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Nenhuma participação registrada.</td></tr>';
            } else {
                // Converter para array para poder ordenar por data
                let presencas = [];
                querySnapshot.forEach(doc => presencas.push(doc.data()));
                
                // Ordena (mais recente primeiro)
                presencas.sort((a, b) => new Date(b.dataOficina) - new Date(a.dataOficina));

                presencas.forEach(p => {
                    const linha = document.createElement('tr');
                    linha.innerHTML = `
                        <td>${p.nomeOficina}</td>
                        <td>${formatarData(p.dataOficina)}</td>
                        <td>${p.cargaHoraria}h</td>
                    `;
                    historicoTbody.appendChild(linha);
                });
            }

        } catch (error) {
            console.error("Erro ao carregar dados principais:", error);
        }
    };

    // ======================================================
    // 6. AGENDA (CRUD REAL NO FIRESTORE)
    // ======================================================

    // --- READ: Ler Tarefas ---
    const carregarAgenda = async () => {
        listaTarefasUl.innerHTML = '<li class="loading-msg">Carregando agenda...</li>';
        const hoje = new Date().toISOString().split('T')[0];

        try {
            // Busca na subcoleção: voluntarios/{uid}/tarefas
            const tarefasRef = collection(db, "voluntarios", currentUser.uid, "tarefas");
            const q = query(tarefasRef, orderBy("dataVencimento", "asc")); // Ordena por vencimento
            const snapshot = await getDocs(q);

            listaTarefasUl.innerHTML = '';

            if (snapshot.empty) {
                listaTarefasUl.innerHTML = '<li class="empty-list-message"><p>Você não tem tarefas pendentes. Adicione uma acima!</p></li>';
                return;
            }

            snapshot.forEach(doc => {
                const tarefa = doc.data();
                const id = doc.id;
                const dataFormatada = formatarData(tarefa.dataVencimento);
                
                // Verifica status para estilização
                const isVencida = tarefa.dataVencimento < hoje && !tarefa.concluida;
                const isHoje = tarefa.dataVencimento === hoje && !tarefa.concluida;
                const estiloData = isVencida ? 'color: #dc3545; font-weight:bold;' : (isHoje ? 'color: #ffc107; font-weight:bold;' : '');
                const textoVencimento = isVencida ? 'Vencida: ' : (isHoje ? 'Vence Hoje: ' : 'Vencimento: ');
                
                // Escapar aspas para evitar bugs no HTML
                const descricaoSegura = tarefa.descricao.replace(/"/g, "&quot;");

                const li = document.createElement('li');
                li.className = 'task-item';
                if (tarefa.concluida) li.classList.add('task-completed'); // Adicione estilo CSS para opacidade se quiser

                li.innerHTML = `
                    <div class="tarefa-info">
                        <span class="tarefa-descricao" style="${tarefa.concluida ? 'text-decoration: line-through; color: gray;' : ''}">
                            ${tarefa.descricao}
                        </span>
                        <span class="tarefa-data" style="${estiloData}">
                            ${textoVencimento} ${dataFormatada}
                        </span>
                    </div>
                    <div class="tarefa-actions">
                        <button class="btn-action btn-concluir" data-id="${id}" title="${tarefa.concluida ? 'Reabrir' : 'Concluir'}">
                            <i class="fas ${tarefa.concluida ? 'fa-undo' : 'fa-check'}"></i>
                        </button>
                        <button class="btn-action btn-excluir" data-id="${id}" title="Excluir">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
                listaTarefasUl.appendChild(li);
            });

        } catch (error) {
            console.error("Erro ao carregar agenda:", error);
            listaTarefasUl.innerHTML = '<li>Erro ao carregar tarefas.</li>';
        }
    };

    // --- CREATE: Adicionar Tarefa ---
    if (novaTarefaForm) {
        novaTarefaForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const descricao = descricaoInput.value.trim();
            const dataVencimento = dataInput.value;

            if (!descricao || !dataVencimento) return;

            try {
                const tarefasRef = collection(db, "voluntarios", currentUser.uid, "tarefas");
                await addDoc(tarefasRef, {
                    descricao: descricao,
                    dataVencimento: dataVencimento,
                    concluida: false,
                    criadoEm: new Date().toISOString()
                });

                novaTarefaForm.reset();
                carregarAgenda(); // Recarrega a lista
            } catch (error) {
                console.error("Erro ao adicionar tarefa:", error);
                alert("Erro ao salvar tarefa.");
            }
        });
    }

    // --- UPDATE & DELETE: Manipular Cliques na Lista ---
    if (listaTarefasUl) {
        listaTarefasUl.addEventListener('click', async (event) => {
            const btn = event.target.closest('.btn-action');
            if (!btn) return;

            const id = btn.dataset.id;
            const tarefasRef = collection(db, "voluntarios", currentUser.uid, "tarefas");
            const docRef = doc(tarefasRef, id);

            // Ação: Concluir / Reabrir
            if (btn.classList.contains('btn-concluir')) {
                try {
                    // Primeiro pegamos o estado atual para inverter
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const statusAtual = docSnap.data().concluida;
                        await updateDoc(docRef, { concluida: !statusAtual });
                        carregarAgenda();
                    }
                } catch (error) {
                    console.error("Erro ao atualizar tarefa:", error);
                }
            } 
            
            // Ação: Excluir
            else if (btn.classList.contains('btn-excluir')) {
                if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
                    try {
                        await deleteDoc(docRef);
                        carregarAgenda();
                    } catch (error) {
                        console.error("Erro ao excluir tarefa:", error);
                    }
                }
            }
        });
    }

    // ======================================================
    // 7. LOGOUT
    // ======================================================
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOut(auth);
                window.location.href = '../login/login.html';
            } catch (error) {
                console.error("Erro ao sair:", error);
            }
        });
    }
});