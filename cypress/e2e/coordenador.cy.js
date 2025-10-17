describe('Testes de Funcionalidades do Coordenador', () => {

    // Hook para logar antes de cada teste deste bloco
    beforeEach(() => {
        cy.loginCoordenador(); // Usa o comando customizado para garantir que estamos logados
    });

    it('deve navegar para a tela de gerenciamento de voluntários', () => {
        // Encontra o link ou botão para Gerenciar Voluntários e clica.
        // **Ajuste o seletor (#link-voluntarios)**
        cy.get('#link-voluntarios').click(); 
        
        // Verifica se a URL e o conteúdo da página de gerenciamento estão corretos
        cy.url().should('include', '/gerenciar-voluntarios');
        cy.contains('h1', 'Gerenciamento de Voluntários').should('be.visible');
    });

    it('deve navegar para a tela de gerenciamento de oficinas', () => {
        // Encontra o link ou botão para Gerenciar Oficinas e clica.
        // **Ajuste o seletor (#link-oficinas)**
        cy.get('#link-oficinas').click(); 
        
        // Verifica se a URL e o conteúdo da página de oficinas estão corretos
        cy.url().should('include', '/gerenciar-oficinas');
        cy.contains('h1', 'Gerenciamento de Oficinas').should('be.visible');
    });
});