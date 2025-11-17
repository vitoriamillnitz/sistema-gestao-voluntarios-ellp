// ======================================================
// 1. IMPORTAÇÕES DO FIREBASE
// ======================================================
import { auth, db } from '../../firebase/config';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// Aguarda o HTML ser completamente carregado
document.addEventListener('DOMContentLoaded', () => {

    // ======================================================
    // 2. SELECIONAR OS ELEMENTOS
    // ======================================================
    const form = document.getElementById('cadastro-voluntario-form');
    const nomeInput = document.getElementById('nome');
    const raInput = document.getElementById('ra');
    const cursoInput = document.getElementById('curso');
    const periodoInput = document.getElementById('periodo');
    const emailInput = document.getElementById('email');
    const telefoneInput = document.getElementById('telefone');
    const senhaInput = document.getElementById('senha');
    const confirmarSenhaInput = document.getElementById('confirmarSenha'); 
    
    const emailError = document.getElementById('email-error');
    const senhaError = document.getElementById('senha-error');

    // ======================================================
    // 3. OUVINTE DE SUBMISSÃO (AGORA É ASYNC)
    // ======================================================
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Limpa erros antigos
        emailError.textContent = '';
        senhaError.textContent = '';

        // ======================================================
        // 4. CAPTURAR OS VALORES
        // ======================================================
        const nome = nomeInput.value.trim();
        const ra = raInput.value.trim();
        const curso = cursoInput.value.trim();
        const periodo = periodoInput.value.trim();
        const email = emailInput.value.trim();
        const telefone = telefoneInput.value.trim(); 
        const senha = senhaInput.value.trim();
        const confirmarSenha = confirmarSenhaInput.value.trim();
        
        // ======================================================
        // 5. VALIDAÇÃO DOS DADOS (MANTIDA DA SUA COLEGA)
        // ======================================================
        // a) Verifica campos obrigatórios
        if (!nome || !ra || !curso || !periodo || !email || !senha || !confirmarSenha) {
            senhaError.textContent = 'Por favor, preencha todos os campos obrigatórios.';
            return;
        }

        // b) Verifica senhas iguais
        if (senha !== confirmarSenha) {
            senhaError.textContent = 'As senhas não coincidem.';
            return;
        }

        // c) Verifica complexidade da senha
        if (senha.length < 8 || !/[A-Z]/.test(senha) || !/[a-z]/.test(senha) || !/[0-9]/.test(senha)) {
            senhaError.textContent = 'A senha não atende aos requisitos de segurança.';
            return;
        }
        
        // ======================================================
        // 6. INTEGRAÇÃO COM O FIREBASE
        // ======================================================
        try {
            // 6a: Cria o usuário (Login/Senha)
            const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
            const user = userCredential.user;

            // 6b: Salva os dados detalhados no Firestore
            // Nota: Salvamos na coleção "voluntarios" desta vez
            await setDoc(doc(db, "voluntarios", user.uid), {
                nome: nome,
                ra: ra,
                curso: curso,
                periodo: periodo,
                email: email,
                telefone: telefone, // Pode estar vazio, sem problemas
                tipoUsuario: 'voluntario', // Para diferenciar no login
                status: 'ativo', // Já nasce ativo, conforme combinado
                horasAcumuladas: 0 // Inicializa com 0 horas
            });

            // 6c: Sucesso!
            alert('Voluntário cadastrado com sucesso! Redirecionando para login...');
            window.location.href = "../login/login.html";

        } catch (error) {
            // 6d: Tratamento de Erros
            console.error("Erro ao cadastrar voluntário:", error);
            
            if (error.code === 'auth/email-already-in-use') {
                emailError.textContent = "Este e-mail já está cadastrado.";
            } else if (error.code === 'auth/weak-password') {
                senhaError.textContent = "A senha escolhida é muito fraca.";
            } else {
                emailError.textContent = "Erro ao realizar cadastro. Tente novamente.";
            }
        }
    });
});