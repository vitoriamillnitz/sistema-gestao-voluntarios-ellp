// ======================================================
// 1. IMPORTAÇÕES DO FIREBASE
// ======================================================
import { auth } from '../../firebase/config';
import { sendPasswordResetEmail } from "firebase/auth";

document.addEventListener('DOMContentLoaded', () => {

    // ======================================================
    // 2. SELECIONAR OS ELEMENTOS DO HTML
    // ======================================================
    const form = document.getElementById('recuperar-senha-form');
    const emailInput = document.getElementById('email');
    const messageDiv = document.getElementById('recuperar-message');
    const submitButton = form.querySelector('.btn');

    // ======================================================
    // 3. OUVINTE DE SUBMISSÃO
    // ======================================================
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Limpa mensagens anteriores
        messageDiv.textContent = '';
        messageDiv.className = 'error-text'; // Reseta classe se houver CSS específico
        messageDiv.style.color = '';

        const email = emailInput.value.trim();

        // Validação básica
        if (email === '') {
            messageDiv.textContent = 'Por favor, informe seu e-mail.';
            messageDiv.style.color = '#d93025';
            return;
        }

        // Bloqueia o botão para evitar cliques duplos
        submitButton.disabled = true;
        submitButton.textContent = "Enviando...";

        // ======================================================
        // 4. INTEGRAÇÃO COM O FIREBASE
        // ======================================================
        try {
            // Esta função envia o e-mail automaticamente se o usuário existir
            await sendPasswordResetEmail(auth, email);

            // Sucesso!
            messageDiv.textContent = 'Se este e-mail estiver cadastrado, um link de recuperação foi enviado. Verifique sua caixa de entrada e spam.';
            messageDiv.style.color = '#28a745'; // Verde sucesso
            
            // Limpa o campo
            emailInput.value = '';

        } catch (error) {
            console.error("Erro ao recuperar senha:", error);
            
            // Tratamento de erros comuns
            if (error.code === 'auth/invalid-email') {
                messageDiv.textContent = 'O e-mail informado é inválido.';
            } else if (error.code === 'auth/user-not-found') {
                // Por segurança, muitas vezes é melhor mostrar a mesma mensagem de sucesso
                // para não revelar quais e-mails estão cadastrados.
                // Mas para debug/desenvolvimento, você pode querer saber:
                messageDiv.textContent = 'E-mail não encontrado na base de dados.';
            } else {
                messageDiv.textContent = 'Erro ao enviar e-mail. Tente novamente mais tarde.';
            }
            messageDiv.style.color = '#d93025';
        } finally {
            // Restaura o botão após a operação
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-envelope"></i> Enviar Link de Recuperação';
        }
    });
});