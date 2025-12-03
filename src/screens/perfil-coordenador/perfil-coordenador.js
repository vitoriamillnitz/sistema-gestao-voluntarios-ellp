// ======================================================
// 1. IMPORTAÇÕES DO FIREBASE
// ======================================================
import { auth, db } from '../../firebase/config';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";

document.addEventListener('DOMContentLoaded', () => {

    // ======================================================
    // 2. SELEÇÃO DE ELEMENTOS
    // ======================================================
    const form = document.getElementById('perfil-coordenador-form');
    const nomeInput = document.getElementById('nome');
    const departamentoInput = document.getElementById('departamento');
    const emailInput = document.getElementById('email');
    
    // Campos de senha (Opcionais/Desativados na lógica simples)
    const novaSenhaInput = document.getElementById('nova-senha');
    const confirmarSenhaInput = document.getElementById('confirmar-senha');

    const btnEditar = document.getElementById('btn-editar');
    const btnSalvar = document.getElementById('btn-salvar');
    const btnCancelar = document.getElementById('btn-cancelar');
    const logoutBtn = document.getElementById('logout-btn');

    let currentUser = null;
    let originalData = {}; // Para restaurar ao cancelar

    // ======================================================
    // 3. AUTENTICAÇÃO E CARREGAMENTO
    // ======================================================
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            await carregarDados();
        } else {
            window.location.href = '../login/login.html';
        }
    });

    const carregarDados = async () => {
        try {
            const docRef = doc(db, "coordenadores", currentUser.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                
                // Preenche os campos
                nomeInput.value = data.nome || '';
                departamentoInput.value = data.departamento || '';
                emailInput.value = data.email || currentUser.email;

                // Guarda estado original
                originalData = {
                    nome: nomeInput.value,
                    departamento: departamentoInput.value
                };
            } else {
                console.error("Documento do coordenador não encontrado!");
            }
        } catch (error) {
            console.error("Erro ao carregar perfil:", error);
            alert("Erro ao carregar seus dados.");
        }
    };

    // ======================================================
    // 4. MODOS DE VISUALIZAÇÃO / EDIÇÃO
    // ======================================================
    const entrarModoEdicao = () => {
        nomeInput.disabled = false;
        departamentoInput.disabled = false;
        // Email não editável
        
        // Exibe botões de ação
        btnEditar.style.display = 'none';
        btnSalvar.style.display = 'inline-block';
        btnCancelar.style.display = 'inline-block';
    };

    const sairModoEdicao = () => {
        nomeInput.disabled = true;
        departamentoInput.disabled = true;
        
        // Esconde botões de ação
        btnEditar.style.display = 'inline-block';
        btnSalvar.style.display = 'none';
        btnCancelar.style.display = 'none';
    };

    // Listeners de botões
    btnEditar.addEventListener('click', entrarModoEdicao);

    btnCancelar.addEventListener('click', () => {
        // Restaura valores
        nomeInput.value = originalData.nome;
        departamentoInput.value = originalData.departamento;
        sairModoEdicao();
    });

    // ======================================================
    // 5. SALVAR DADOS (UPDATE)
    // ======================================================
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Feedback visual
        const originalBtnText = btnSalvar.innerHTML;
        btnSalvar.textContent = "Salvando...";
        btnSalvar.disabled = true;

        try {
            const docRef = doc(db, "coordenadores", currentUser.uid);

            // Atualiza no Firestore
            await updateDoc(docRef, {
                nome: nomeInput.value,
                departamento: departamentoInput.value
            });

            // Atualiza dados originais
            originalData = {
                nome: nomeInput.value,
                departamento: departamentoInput.value
            };

            alert("Perfil atualizado com sucesso!");
            sairModoEdicao();

        } catch (error) {
            console.error("Erro ao atualizar:", error);
            alert("Erro ao salvar alterações.");
        } finally {
            btnSalvar.innerHTML = originalBtnText;
            btnSalvar.disabled = false;
        }
    });

    // ======================================================
    // 6. LOGOUT
    // ======================================================
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await signOut(auth);
            window.location.href = '../login/login.html';
        });
    }
});