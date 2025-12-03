// ======================================================
// 1. IMPORTAÇÕES DO FIREBASE
// ======================================================
import { auth, db } from '../../firebase/config.js';
import { collection, getDocs, getDoc, doc, addDoc, deleteDoc, query, where, updateDoc, increment, writeBatch } from "firebase/firestore";
import { signOut } from "firebase/auth";

document.addEventListener('DOMContentLoaded', () => {

    // ======================================================
    // 2. SELEÇÃO DE ELEMENTOS
    // ======================================================
    const nomeOficinaEl = document.getElementById('nome-oficina');
    const form = document.getElementById('presenca-form');
    const listaVoluntariosEl = document.querySelector('.lista-presenca');
    const checkboxMarcarTodos = document.getElementById('marcar-todos');
    const logoutBtn = document.getElementById('logout-btn');

    const urlParams = new URLSearchParams(window.location.search);
    const oficinaId = urlParams.get('id');

    let oficinaAtual = null;
    let voluntariosAtivos = [];
    
    // MUDANÇA: Agora guardamos um mapa { voluntarioId: presencaDocId }
    // Isso nos permite saber QUAL documento deletar se desmarcarem
    let mapaPresencasExistentes = {}; 

    // ======================================================
    // 3. CARREGAR DADOS
    // ======================================================
    const carregarDados = async () => {
        if (!oficinaId) {
            alert("Erro: Nenhuma oficina selecionada.");
            window.location.href = '../gerenciar-oficinas/gerenciar-oficinas.html';
            return;
        }

        try {
            // A. Buscar Oficina
            const oficinaRef = doc(db, "oficinas", oficinaId);
            const oficinaSnap = await getDoc(oficinaRef);

            if (!oficinaSnap.exists()) {
                alert("Oficina não encontrada.");
                return;
            }
            oficinaAtual = oficinaSnap.data();
            nomeOficinaEl.textContent = oficinaAtual.nome;

            // B. Buscar Voluntários Ativos
            const qVoluntarios = query(collection(db, "voluntarios"), where("status", "==", "ativo"));
            const snapVoluntarios = await getDocs(qVoluntarios);
            
            voluntariosAtivos = [];
            snapVoluntarios.forEach(doc => {
                voluntariosAtivos.push({ id: doc.id, ...doc.data() });
            });

            // C. Buscar Presenças Já Registradas (Mapear ID -> Documento)
            const qPresencas = query(collection(db, "presencas"), where("oficinaId", "==", oficinaId));
            const snapPresencas = await getDocs(qPresencas);
            
            mapaPresencasExistentes = {};
            snapPresencas.forEach(doc => {
                const dados = doc.data();
                // Guarda o ID do documento da presença vinculado ao ID do voluntário
                mapaPresencasExistentes[dados.voluntarioId] = doc.id;
            });

            renderizarLista();

        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            alert("Erro ao carregar lista.");
        }
    };

    // ======================================================
    // 4. RENDERIZAR LISTA
    // ======================================================
    const renderizarLista = () => {
        listaVoluntariosEl.innerHTML = '';

        if (voluntariosAtivos.length === 0) {
            listaVoluntariosEl.innerHTML = '<p style="padding:10px">Nenhum voluntário ativo.</p>';
            return;
        }

        voluntariosAtivos.forEach(vol => {
            // Verifica se existe no mapa
            const isPresente = !!mapaPresencasExistentes[vol.id];
            
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="checkbox-wrapper">
                    <input type="checkbox" id="vol-${vol.id}" name="voluntarios" value="${vol.id}" 
                           ${isPresente ? 'checked' : ''}>
                    <label for="vol-${vol.id}">
                        <strong>${vol.nome}</strong> 
                        <br>
                        <small>${vol.email} | RA: ${vol.ra || 'N/A'}</small>
                    </label>
                </div>
            `;
            listaVoluntariosEl.appendChild(li);
        });
    };

    // ======================================================
    // 5. MARCAR TODOS
    // ======================================================
    checkboxMarcarTodos.addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('input[name="voluntarios"]');
        checkboxes.forEach(cb => cb.checked = e.target.checked);
    });

    // ======================================================
    // 6. SALVAR (ADICIONAR E REMOVER)
    // ======================================================
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btnSubmit = form.querySelector('button[type="submit"]');
        btnSubmit.textContent = "Processando...";
        btnSubmit.disabled = true;

        try {
            const batch = writeBatch(db); // Lote de operações
            let alteracoesCount = 0;

            // Pega TODOS os checkboxes da tela
            const checkboxes = document.querySelectorAll('input[name="voluntarios"]');

            checkboxes.forEach(checkbox => {
                const voluntarioId = checkbox.value;
                const isChecked = checkbox.checked;
                
                // Verifica se já estava salvo antes (usando nosso mapa)
                const presencaDocId = mapaPresencasExistentes[voluntarioId];
                const estavaPresente = !!presencaDocId;

                // CASO 1: Não estava presente -> Marcou (ADICIONAR)
                if (isChecked && !estavaPresente) {
                    // Criar doc em 'presencas'
                    const novaRef = doc(collection(db, "presencas"));
                    batch.set(novaRef, {
                        voluntarioId: voluntarioId,
                        oficinaId: oficinaId,
                        nomeOficina: oficinaAtual.nome,
                        dataOficina: oficinaAtual.data,
                        cargaHoraria: Number(oficinaAtual.cargaHoraria),
                        dataRegistro: new Date().toISOString()
                    });

                    // Somar horas no voluntário
                    const volRef = doc(db, "voluntarios", voluntarioId);
                    batch.update(volRef, {
                        horasAcumuladas: increment(Number(oficinaAtual.cargaHoraria))
                    });
                    
                    alteracoesCount++;
                }

                // CASO 2: Estava presente -> Desmarcou (REMOVER)
                else if (!isChecked && estavaPresente) {
                    // Deletar doc em 'presencas' (usando o ID que guardamos no mapa)
                    const presencaRef = doc(db, "presencas", presencaDocId);
                    batch.delete(presencaRef);

                    // Subtrair horas no voluntário
                    const volRef = doc(db, "voluntarios", voluntarioId);
                    batch.update(volRef, {
                        horasAcumuladas: increment(-Number(oficinaAtual.cargaHoraria)) // Negativo para subtrair
                    });

                    alteracoesCount++;
                }
            });

            if (alteracoesCount === 0) {
                alert("Nenhuma alteração realizada.");
                window.location.href = '../gerenciar-oficinas/gerenciar-oficinas.html';
                return;
            }

            await batch.commit(); // Executa tudo

            alert(`Alterações salvas com sucesso!`);
            window.location.href = '../gerenciar-oficinas/gerenciar-oficinas.html';

        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar presenças.");
            btnSubmit.textContent = "Salvar Presenças";
            btnSubmit.disabled = false;
        }
    });

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await signOut(auth);
            window.location.href = '../login/login.html';
        });
    }

    carregarDados();
});