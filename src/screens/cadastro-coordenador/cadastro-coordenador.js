// ======================================================
// 1. IMPORTAÇÕES DO FIREBASE (ADICIONADO)
// ======================================================
import { auth, db } from '../../firebase/config';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// Aguarda o HTML ser completamente carregado
document.addEventListener('DOMContentLoaded', () => {

    // ======================================================
    // 2. SELECIONAR OS ELEMENTOS (CÓDIGO DA SUA COLEGA)
    // ======================================================
    const cadastroForm = document.getElementById('cadastro-form');
    const nomeInput = document.getElementById('nome');
    const departamentoInput = document.getElementById('departamento');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const confirmarSenhaInput = document.getElementById('confirmarSenha');
    
    const emailError = document.getElementById('email-error');
    const senhaError = document.getElementById('senha-error');

    // ======================================================
    // 3. OUVINTE DO FORMULÁRIO (MUDANÇA PEQUENA)
    // ======================================================
    // Trocamos para 'async' para podermos usar o 'await' do Firebase
    cadastroForm.addEventListener('submit', async (event) => {
        // Impede o recarregamento padrão da página
        event.preventDefault();

        // Limpa mensagens de erro de tentativas anteriores
        emailError.textContent = '';
        senhaError.textContent = '';

        // ======================================================
        // 4. VALIDAÇÃO DOS DADOS (CÓDIGO DA SUA COLEGA)
        // ======================================================
        const nome = nomeInput.value.trim();
        const departamento = departamentoInput.value.trim();
        const email = emailInput.value.trim();
        const senha = senhaInput.value.trim();
        const confirmarSenha = confirmarSenhaInput.value.trim();
        
        // a) Verifica se todos os campos estão preenchidos
        if (!nome || !departamento || !email || !senha || !confirmarSenha) {
            senhaError.textContent = 'Todos os campos são obrigatórios.';
            return;
        }

        // b) Verifica se as senhas são iguais
        if (senha !== confirmarSenha) {
            senhaError.textContent = 'As senhas não coincidem.';
            return;
        }

        // c) Verifica a complexidade da senha
        const temMaiuscula = /[A-Z]/.test(senha);
        const temMinuscula = /[a-z]/.test(senha);
        const temNumero = /[0-9]/.test(senha);
        
        if (senha.length < 8 || !temMaiuscula || !temMinuscula || !temNumero) {
            senhaError.textContent = 'A senha não atende aos requisitos de segurança.';
            return;
        }
        
        // ======================================================
        // 5. LÓGICA DO FIREBASE (SUBSTITUI A SIMULAÇÃO)
        // ======================================================
        try {
            // 5a: Tenta criar o usuário no Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
            const user = userCredential.user;

            // 5b: Se deu certo, salva os dados extras no Firestore
            // Usamos o 'user.uid' para garantir que os dados do Firestore
            // tenham o mesmo ID do usuário no Auth
            await setDoc(doc(db, "coordenadores", user.uid), {
                nome: nome,
                departamento: departamento,
                email: email,
                tipoUsuario: 'coordenador' // Importante para diferenciar de 'voluntario'
            });

            // 5c: Sucesso!
            alert('Cadastro realizado com sucesso! Redirecionando para o login...');
            window.location.href = "../login/login.html"; // Manda para o login

        } catch (error) {
            // 5d: Lida com erros do Firebase (e-mail já em uso, etc.)
            console.error("Erro ao cadastrar:", error.code, error.message);
            if (error.code === 'auth/email-already-in-use') {
                emailError.textContent = "Este e-mail já está em uso.";
            } else if (error.code === 'auth/weak-password') {
                // A validação do Firebase é mais forte que a nossa
                senhaError.textContent = "A senha é muito fraca (erro do Firebase).";
            } else {
                emailError.textContent = "Ocorreu um erro ao criar seu cadastro.";
            }
        }
    });
});