describe('O2CAPNM-775', function () {
  /* 
      Cypress unterdrückt das Standardverhalten, bei dem der Test fehlschlägt, wenn eine nicht abgefangene Ausnahme auftritt
  */
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  /* Testfalle Beschreibung - Belegungsplan: Sperre der Betriebsstelle */

  it('O2CAPNM-775', function () {

    let rowsLength
    let elm
    let Var_gesperrtAm
    let Var_gesperrtBis
    let Var_Sperrung_duration = new Date()

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
        var betriebstelle = data.rows[i].Betriebstelle


        cy.visit('https://apn-dev.cnp-test.comp.db.de/')

        cy.wait(5000)

        cy.get('#Triangle-Copy').click({ force: true })

        /*   Melden Sie sich bei der neuen APN-Anwendung an
        */
        cy.get('#login').click({ force: true })
        cy.wait(5000)
        cy.get('input[name="username"]').type(username)
        cy.wait(5000)
        cy.get('input[name="password"]').type(password)
        cy.wait(5000)
        cy.contains(' Anmelden ').click({ force: true })

        cy.wait(5000)

        cy.contains('Kundenmanagement').click({ force: true }).then(response => {

          cy.wait(5000)

          cy.intercept({
            method: 'GET',
            path: '/service-gateway/me/rollen'
          }).as('rollen')

          cy.contains('Belegungsplan').click({ force: true })

          cy.wait(10000)

          cy.wait('@rollen').then(({ response }) => {

            cy.log(response.body)
            elm = response.body
            if (elm.includes('tester')) {

              cy.log('Role: TESTER')

            } else {
              throw new Error('Zum anzeigen wird eine Rolle benötigt. Aktuell die Rolle TESTER')
            }
          })
        })


        cy.contains('Belegungsplan').should('exist')

        /* Suchen und Wählen Sie die  Betriebstelle, z.B. Stuttgart-Zazenhausen */
        cy.get('#mat-input-1').type('Stuttgart-Zazenhausen')
        cy.get('.mat-mdc-option.mdc-list-item.mat-mdc-tooltip-trigger.option.ng-star-inserted').eq(0).click({ force: true })
        cy.wait(5000)

        /*  Wählen Sie das Jahr 2024 */
        cy.get('#mat-select-value-5').click({ force: true })
        cy.get('#mat-option-9 > .mdc-list-item__primary-text > span.ng-star-inserted').click({ force: true })

        cy.wait(5000)

        /* Netzwerkanfragen erfassen */
        cy.intercept({
          method: 'GET',
          path: '/service-gateway/anmeldungen?anmeldeverfahren=NFP&fahrplanjahr=2024&betriebsstelle=443'
        }).as('apiCheck1')

        cy.intercept({
          method: 'GET',
          path: '443'
        }).as('apiCheck3')


        cy.get('[title="Suchen"]').click({ force: true })

        cy.wait(5000)

        cy.wait('@apiCheck1').then(({ response }) => {

          expect(response.statusCode).to.eq(200);
          cy.log('Number of registrations =', response.body.length)

        })

        cy.wait('@apiCheck3').then(({ response }) => {

          expect(response.statusCode).to.eq(200);

          if (response.body.length != 0) {

            cy.log('Es gibt Sperrung der Betriebsstelle')

            Var_gesperrtAm = (response.body[0].gesperrtAm)
            Var_gesperrtBis = (response.body[0].gesperrtBis)

            let Var_Sperrung_duration = new Date(Var_gesperrtBis) - new Date(Var_gesperrtAm);
            const seconds = Math.abs(Var_Sperrung_duration / 1000);

            if (seconds == 86400) {
              cy.log('Die Betriebsstelle ist für 24 Stunden gesperrt')
            }
            else {
              throw new Error('Die Betriebsstelle ist nicht für 24 Stunden gesperrt')
            }
          }
          else {
            cy.log('Es gibt keine Sperrung der Betriebsstelle')
            cy.contains('Betriebsstelle sperren').click({ force: true })
            cy.contains('Hinweis - Sperrung der Betriebsstelle bis').should('exist')
          }
        })
      }
    })
  })


  /* Überprüfen Sie die Sperrung Details in der alten Anwendung mit Selenium */
  it('Sperrung Afheben', function () {

    let var_url = 'https:/URL:port/'
    let username = 'username'
    let password = 'password'
    cy.task('Sperrung_Afheben', { var_url, username, password })

  })

})


