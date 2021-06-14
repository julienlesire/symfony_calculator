describe('Complete calculator test', () => {
    it('Tests the calculator', () => {
        cy.visit("/");

        cy.get('.calculator__result')
            .should('have.text', '0');

        cy.get('button')
            .contains('1')
            .click();

        cy.get('.calculator__result')
            .should('have.text', '1');

        cy.get('button')
            .contains('1')
            .click();

        cy.get('.calculator__result')
            .should('have.text', '11');

        cy.get('button')
            .contains('+')
            .click();

        cy.get('.calculator__result')
            .should('have.text', '11 + ');

        cy.get('button')
            .contains('2')
            .click();

        cy.get('.calculator__result')
            .should('have.text', '11 + 2');

        cy.get('.calculator__equals')
            .click();

        cy.get('.calculator__expression')
            .should('have.text', '11 + 2');

        cy.get('.calculator__result')
            .should('have.text', '13');

        cy.get('button')
            .contains('AC')
            .click();

        cy.get('.calculator__result')
            .should('have.text', '0');

        cy.get('button')
            .contains('.')
            .click();

        cy.get('.calculator__result')
            .should('have.text', '0.');

        cy.get('button')
            .contains('1')
            .click();

        cy.get('.calculator__result')
            .should('have.text', '0.1');

        cy.get('button')
            .contains('+')
            .click();

        cy.get('.calculator__result')
            .should('have.text', '0.1 + ');

        cy.get('button')
            .contains('+')
            .click();

        cy.get('.calculator__result')
            .should('have.text', '0.1 + ');

        cy.get('button')
            .contains('-')
            .click();

        cy.get('.calculator__result')
            .should('have.text', '0.1 + ');

        // opens the history
        cy.get('.calculator__history')
            .click();

        const menu = cy.get('.calculator__menu');
        menu.should('be.visible');

        const menuEntry = cy
            .get('.calculator__menu .calculator__menu_entry')
            .eq(0);

        const expression = menuEntry.get(".calculator__menu_expression");

        expression
            .should('have.text', '11 + 2');

        expression.click();
        menu.should('not.be.visible');

        cy.get('.calculator__result')
            .should('have.text', '11 + 2');

        // opens the history again
        cy.get('.calculator__history')
            .click();

        menu.should('be.visible');

        const result = menuEntry.get(".calculator__menu_result");

        result
            .should('have.text', '13');

        result.click();
        menu.should('not.be.visible');

        cy.get('.calculator__result')
            .should('have.text', '13');

        cy.get('button')
            .contains("AC")
            .click();

        cy.get('.calculator__expression_expression')
            .should('have.text', 'Ans');

        cy.get('.calculator__expression_answer')
            .should('have.text', '13');
    });

});