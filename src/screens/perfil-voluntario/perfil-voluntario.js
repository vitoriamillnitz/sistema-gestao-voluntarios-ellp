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
    const form = document.getElementById('perfil-voluntario-form');
    const nomeInput = document.getElementById('nome');
    const raInput = document.getElementById('ra');
    const cursoInput = document.getElementById('curso');
    const periodoInput = document.getElementById('periodo');
    const emailInput = document.getElementById('email');
    const telefoneInput = document.getElementById('telefone');

    const btnEditar = document.getElementById('btn-editar');
    const btnSalvar = document.getElementById('btn-salvar');
    const btnCancelar = document.getElementById('btn-cancelar');
    const logoutBtn = document.getElementById('logout-btn');

    let currentUser = null;
    let originalData = {};

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
            // Busca na coleção VOLUNTARIOS
            const docRef = doc(db, "voluntarios", currentUser.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                
                // Preenche campos
                nomeInput.value = data.nome || '';
                raInput.value = data.ra || '';
                cursoInput.value = data.curso || '';
                periodoInput.value = data.periodo || '';
                emailInput.value = data.email || currentUser.email;
                telefoneInput.value = data.telefone || '';

                // Guarda estado original (apenas campos editáveis)
                originalData = {
                    nome: nomeInput.value,
                    curso: cursoInput.value,
                    periodo: periodoInput.value,
                    telefone: telefoneInput.value
                };
            }
        } catch (error) {
            console.error("Erro ao carregar perfil:", error);
        }
    };

    // ======================================================
    // 4. MODOS DE VISUALIZAÇÃO / EDIÇÃO
    // ======================================================
    const entrarModoEdicao = () => {
        // Habilita campos (RA e Email geralmente não mudam fácil)
        nomeInput.disabled = false;
        cursoInput.disabled = false;
        periodoInput.disabled = false;
        telefoneInput.disabled = false;
        
        btnEditar.style.display = 'none';
        btnSalvar.style.display = 'inline-block';
        btnCancelar.style.display = 'inline-block';
    };

    const sairModoEdicao = () => {
        // Desabilita tudo
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => input.disabled = true);

        btnEditar.style.display = 'inline-block';
        btnSalvar.style.display = 'none';
        btnCancelar.style.display = 'none';
    };

    btnEditar.addEventListener('click', entrarModoEdicao);

    btnCancelar.addEventListener('click', () => {
        // Restaura
        nomeInput.value = originalData.nome;
        cursoInput.value = originalData.curso;
        periodoInput.value = originalData.periodo;
        telefoneInput.value = originalData.telefone;
        sairModoEdicao();
    });

    // ======================================================
    // 5. SALVAR DADOS (UPDATE)
    // ======================================================
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const originalBtnText = btnSalvar.innerHTML;
        btnSalvar.textContent = "Salvando...";
        btnSalvar.disabled = true;

        try {
            const docRef = doc(db, "voluntarios", currentUser.uid);

            await updateDoc(docRef, {
                nome: nomeInput.value,
                curso: cursoInput.value,
                periodo: periodoInput.value,
                telefone: telefoneInput.value
            });

            // Atualiza cache local
            originalData = {
                nome: nomeInput.value,
                curso: cursoInput.value,
                periodo: periodoInput.value,
                telefone: telefoneInput.value
            };

            alert("Dados salvos com sucesso!");
            sairModoEdicao();

        } catch (error) {
            console.error("Erro ao atualizar:", error);
            alert("Erro ao salvar dados.");
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
