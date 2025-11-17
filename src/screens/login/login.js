// ======================================================
// 1. IMPORTAÇÕES DO FIREBASE
// ======================================================
import { auth, db } from '../../firebase/config';
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

document.addEventListener('DOMContentLoaded', () => {

    // 2. SELECIONAR ELEMENTOS (Mantendo seu código original)
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('senha');
    const errorMessage = document.getElementById('login-error-message');

    // 3. OUVINTE DE SUBMISSÃO (Agora async)
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();
        const senha = passwordInput.value.trim();

        // Limpa erros antigos
        errorMessage.textContent = '';

        // 4. VALIDAÇÃO BÁSICA
        if (email === '' || senha === '') {
            errorMessage.textContent = 'Por favor, preencha todos os campos.';
            return;
        }

        // ======================================================
        // 5. LÓGICA DE LOGIN E ROTEAMENTO
        // ======================================================
        try {
            // 5a: Autentica o usuário (Verifica e-mail e senha)
            const userCredential = await signInWithEmailAndPassword(auth, email, senha);
            const user = userCredential.user;

            console.log("Usuário autenticado:", user.uid);

            // 5b: Verifica se é COORDENADOR
            // Tenta buscar um documento com o ID do usuário na coleção 'coordenadores'
            const coordRef = doc(db, "coordenadores", user.uid);
            const coordSnap = await getDoc(coordRef);

            if (coordSnap.exists()) {
                console.log("É um coordenador!");
                window.location.href = "../dashboard-coordenador/dashboard-coordenador.html";
                return; // Encerra a função aqui para garantir o redirecionamento
            }

            // 5c: Se não for coordenador, verifica se é VOLUNTÁRIO
            const volRef = doc(db, "voluntarios", user.uid);
            const volSnap = await getDoc(volRef);

            if (volSnap.exists()) {
                console.log("É um voluntário!");
                window.location.href = "../dashboard-voluntario/dashboard-voluntario.html";
                return;
            }

            // 5d: Se logou mas não está em nenhuma coleção (Erro de cadastro)
            errorMessage.textContent = "Perfil de usuário não encontrado no banco de dados.";
            console.error("Usuário autenticado mas sem perfil no Firestore.");

        } catch (error) {
            // 6. TRATAMENTO DE ERROS
            console.error("Erro no login:", error.code, error.message);

            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage.textContent = "E-mail ou senha incorretos.";
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage.textContent = "Muitas tentativas falhas. Tente novamente mais tarde.";
            } else {
                errorMessage.textContent = "Erro ao fazer login. Tente novamente.";
            }
        }
    });
});