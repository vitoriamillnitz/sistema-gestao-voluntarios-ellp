describe('Testes de Funcionalidades do Voluntário', () => {

    // Hook para logar antes de cada teste deste bloco
    beforeEach(() => {
        cy.loginVoluntario(); // Usa o comando customizado para garantir que estamos logados
    });

    it('deve navegar para a tela de registro de presença', () => {
        // Encontra o link ou botão para Registrar Presença e clica.
        // **Ajuste o seletor (#link-presenca)**
        cy.get('#link-presenca').click(); 
        
        // Verifica se a URL e o conteúdo da página estão corretos
        cy.url().should('include', '/registrar-presenca');
        cy.contains('h1', 'Registro de Presença').should('be.visible');
    });

    it('deve visualizar o próprio perfil', () => {
        // Encontra o link ou botão para Perfil e clica.
        // **Ajuste o seletor (#link-perfil)**
        cy.get('#link-perfil').click(); 
        
        // Verifica se a URL e o conteúdo do perfil estão corretos
        cy.url().should('include', '/perfil-voluntario');
        cy.contains('h1', 'Meu Perfil').should('be.visible');
    });
});