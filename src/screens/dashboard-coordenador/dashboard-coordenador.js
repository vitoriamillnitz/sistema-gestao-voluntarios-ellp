// ======================================================
// 1. IMPORTAÇÕES DO FIREBASE
// ======================================================
import { auth, db } from '../../firebase/config.js';
import { collection, getDocs, query, where } from "firebase/firestore";
import { signOut } from "firebase/auth";

document.addEventListener('DOMContentLoaded', () => {

    // ======================================================
    // 2. SELEÇÃO DE ELEMENTOS
    // ======================================================
    const totalVoluntariosEl = document.getElementById('total-voluntarios');
    const totalOficinasEl = document.getElementById('total-oficinas');
    const totalHorasProjetoEl = document.getElementById('total-horas-projeto');
    const tabelaOficinasTbody = document.querySelector('#proximas-oficinas-table tbody');
    const logoutBtn = document.getElementById('logout-btn');

    // ======================================================
    // 3. FUNÇÃO PRINCIPAL (CARREGAR DADOS)
    // ======================================================
    const carregarDashboard = async () => {
        try {
            // --- A. Buscar Voluntários ---
            // Busca todos os documentos da coleção "voluntarios"
            // Filtra apenas os que têm status "ativo" para contar como voluntários ativos
            const qVoluntarios = query(collection(db, "voluntarios"), where("status", "==", "ativo"));
            const snapshotVoluntarios = await getDocs(qVoluntarios);
            const totalVoluntarios = snapshotVoluntarios.size; // .size dá a contagem direta

            // --- B. Buscar Oficinas ---
            // Busca todas as oficinas para estatísticas
            const snapshotOficinas = await getDocs(collection(db, "oficinas"));
            const totalOficinas = snapshotOficinas.size;

            // --- C. Calcular Horas Totais ---
            // Vamos somar o campo 'cargaHoraria' de todas as oficinas que já aconteceram (opcional)
            // OU somar o campo 'horasAcumuladas' de todos os voluntários
            let totalHoras = 0;
            snapshotVoluntarios.forEach(doc => {
                const dados = doc.data();
                // Se o campo existir, soma. Se não, soma 0.
                totalHoras += dados.horasAcumuladas || 0;
            });

            // --- D. Atualizar os Cards ---
            totalVoluntariosEl.textContent = totalVoluntarios;
            totalOficinasEl.textContent = totalOficinas;
            totalHorasProjetoEl.textContent = `${totalHoras}h`;

            // --- E. Preencher Tabela de Próximas Oficinas ---
            renderizarTabelaOficinas(snapshotOficinas);

        } catch (error) {
            console.error("Erro ao carregar dashboard:", error);
            // Opcional: Mostrar erro na tela para o usuário saber
        }
    };

    // ======================================================
    // 4. FUNÇÃO AUXILIAR (RENDERIZAR TABELA)
    // ======================================================
    const renderizarTabelaOficinas = (snapshotOficinas) => {
        tabelaOficinasTbody.innerHTML = '';
        let encontrouAgendada = false;

        snapshotOficinas.forEach(doc => {
            const oficina = doc.data();
            
            // Filtra apenas as agendadas (pode ser feito na query também, mas aqui é mais simples agora)
            if (oficina.status === 'agendada') {
                encontrouAgendada = true;
                
                // Formata a data (YYYY-MM-DD para DD/MM/YYYY)
                // Previne erros de fuso horário adicionando hora fixa
                const dataObj = new Date(oficina.data + 'T12:00:00');
                const dataFormatada = dataObj.toLocaleDateString('pt-BR');

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${oficina.nome}</td>
                    <td>${dataFormatada}</td>
                    <td>${oficina.cargaHoraria}h</td>
                    <td class="status status-scheduled">${oficina.status}</td>
                `;
                tabelaOficinasTbody.appendChild(tr);
            }
        });

        if (!encontrouAgendada) {
            tabelaOficinasTbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center;">Nenhuma oficina agendada.</td>
                </tr>
            `;
        }
    };

    // ======================================================
    // 5. LOGOUT REAL
    // ======================================================
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOut(auth);
                alert('Logout realizado com sucesso!');
                window.location.href = '../login/login.html';
            } catch (error) {
                console.error("Erro ao sair:", error);
                alert("Erro ao fazer logout.");
            }
        });
    }

    // Inicializa
    carregarDashboard();
});