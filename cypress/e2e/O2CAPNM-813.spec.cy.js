describe('O2CAPNM-813', function () {
  /* 
       Cypress unterdrückt das Standardverhalten, bei dem der Test fehlschlägt, wenn eine nicht abgefangene Ausnahme auftritt
   */
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  /* 
    Testfalle Beschreibung - Belegungsplan - Anmeldung
    */
  it('O2CAPNM-813', function () {

    let rowsLength

    /*     Lesen Sie Daten aus Excel CypressParam.xlsx */
    cy.task('readXlsx', { file: 'cypress/fixtures/CypressParam.xlsx', sheet: "Param" }).then((rows) => {
      rowsLength = rows.length;
      cy.writeFile("cypress/fixtures/xlsxData.json", { rows })
    })

    cy.fixture('xlsxData').then((data) => {
      for (let i = 0; i < rowsLength; i++) {

        var url = data.rows[i].URL
        var username = data.rows[i].Username
        var password = data.rows[i].Password

        /*   Melden Sie sich bei der neuen APN-Anwendung an
        */
        cy.visit(url)
        cy.wait(5000)
        cy.get('#login').click({ force: true })
        cy.wait(5000)
        cy.get('input[name="username"]').type(username)
        cy.wait(5000)
        cy.get('input[name="password"]').type(password)
        cy.wait(5000)
        cy.contains(' Anmelden ').click({ force: true })
        cy.wait(10000)

        cy.contains('Kundenmanagement').click({ force: true }).then(response => {
          cy.contains('Belegungsplan').click({ force: true })
        })

        cy.contains('apntest').should('exist')

        cy.get('[data-mat-icon-name="logout"]').click({ force: true })
      }
    })
  })
})


