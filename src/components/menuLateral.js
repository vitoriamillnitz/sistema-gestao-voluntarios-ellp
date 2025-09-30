/**
 * Script para carregar o componente do menu lateral reutilizável.
 * Este script deve ser incluído em todas as páginas que utilizam o menu.
 */
document.addEventListener('DOMContentLoaded', async () => {
    
    // Encontra o local na página onde o menu deve ser inserido.
    const menuPlaceholder = document.getElementById('menu-placeholder');
    if (!menuPlaceholder) return;

    try {
        // 1. CARREGAR O HTML DO MENU
        // Busca o conteúdo do arquivo HTML do menu.
        // O caminho '../' volta um nível (de 'screens/pagina' para 'src'), 
        // depois entra em 'components/menuLateral'.
        const response = await fetch('../../components/menuLateral/menuLateral.html');
        const menuHTML = await response.text();

        // Insere o HTML do menu no placeholder.
        menuPlaceholder.innerHTML = menuHTML;
        
        // 2. ADICIONAR FUNCIONALIDADE
        // Agora que o menu está na página, podemos adicionar lógica a ele.
        
        // Lógica do botão de Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                alert('Logout simulado! Redirecionando...');
                // Futuramente, aqui virá a chamada de logout do Firebase.
                window.location.href = '/src/screens/login/login.html'; // Caminho absoluto da raiz do site
            });
        }

        // Lógica para destacar o link da página atual (BÔNUS!)
        const currentPagePath = window.location.pathname;
        const navLinks = document.querySelectorAll('.sidebar-nav a');

        navLinks.forEach(link => {
            // Se o href do link corresponde ao caminho da página atual...
            if (link.getAttribute('href') === currentPagePath) {
                // ...adiciona uma classe 'active' para destacá-lo.
                link.classList.add('active');
            }
        });

    } catch (error) {
        console.error('Erro ao carregar o menu lateral:', error);
        menuPlaceholder.innerHTML = '<p>Erro ao carregar menu.</p>';
    }
});