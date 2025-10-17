describe('Testes de Autenticação', () => {

    // Teste de login bem-sucedido para Coordenador
    it('deve logar como Coordenador e navegar para o dashboard', () => {
        // Usa o comando customizado definido no support/commands.js
        cy.loginCoordenador(); 
        
        // Verifica se a URL mudou para o dashboard do coordenador
        cy.url().should('include', '/dashboard-coordenador');
        
        // Verifica se há um elemento de boas-vindas na página
        cy.contains('h1', 'Dashboard Coordenador').should('be.visible'); 
    });

    // Teste de login bem-sucedido para Voluntário
    it('deve logar como Voluntário e navegar para o dashboard', () => {
        cy.loginVoluntario(); 
        
        // Verifica se a URL mudou para o dashboard do voluntário
        cy.url().should('include', '/dashboard-voluntario');
        
        // Verifica se há um elemento de boas-vindas na página
        cy.contains('h1', 'Dashboard Voluntário').should('be.visible'); 
    });

    // Teste de login com credenciais incorretas (exemplo)
    it('deve mostrar mensagem de erro com credenciais inválidas', () => {
        cy.visit('/src/screens/login/login.html');
        cy.get('#email').type('usuario@invalido.com');
        cy.get('#senha').type('senhaerrada');
        cy.get('#login-form').submit();

        // **Ajuste este seletor e o texto** para o elemento que mostra o erro no seu HTML
        cy.contains('.mensagem-erro', 'Email ou senha incorretos.').should('be.visible');
        cy.url().should('include', '/login.html'); // Permanece na página de login
    });
});