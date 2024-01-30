describe('O2CAPNM-774', function () {
  /* 
         Cypress unterdrückt das Standardverhalten, bei dem der Test fehlschlägt, wenn eine nicht abgefangene Ausnahme auftritt
     */
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  /*  Testfalle Beschreibung - Belegungsplan: Suche nach Betriebsstelle */

  it('O2CAPNM-774', function () {

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
        var betriebstelle = data.rows[i].Betriebstelle

        cy.visit('https://apn-dev.cnp-test.comp.db.de/')

        cy.wait(5000)

        /*   Melden Sie sich bei der neuen APN-Anwendung an
*/
        cy.get('#Triangle-Copy').click({ force: true })
        //  cy.contains('DB Web SSO').click({ force: true })
        cy.get('#login').click({ force: true })
        cy.wait(5000)
        cy.get('input[name="username"]').type(username)
        cy.wait(5000)
        cy.get('input[name="password"]').type(password)
        cy.wait(5000)
        cy.contains(' Anmelden ').click({ force: true })
        cy.wait(5000)

        cy.contains('Kundenmanagement').click({ force: true }).then(response => {

          cy.contains('Eingegangene Anmeldungen').should('exist')
          cy.contains('Detailsuche Anmeldungen').should('exist')
          cy.contains('Entscheidungsverfahren').should('exist')
          cy.contains('Vertragsverwaltung').should('exist')
          cy.contains('Belegungsplan').click({ force: true })

        })

        cy.wait(5000)

        cy.contains('Belegungsplan').should('exist')

        cy.wait(10000)

        /* Suchen und Wählen Sie die  Betriebstelle, z.B. Stuttgart-Zazenhausen */
        cy.get('#mat-input-1').type('Stuttgart-Zazenhausen').
          then(response => {
            cy.get('.mat-mdc-option.mdc-list-item.mat-mdc-tooltip-trigger.option.ng-star-inserted').then(elm => {
              for (let i = 0; i < elm.length - 1; i++) {
                if (elm[i] > elm[i + 1]) {
                  throw new Error('Namens sollten zuerst in der Liste angezeigt und sind ab der Übereinstimmung alphabetisch sortiert.')
                }
              }
            })
          })
        cy.get('.mat-mdc-option.mdc-list-item.mat-mdc-tooltip-trigger.option.ng-star-inserted').eq(0).click({ force: true })

        cy.wait(5000)
        cy.get('#einklappen').click({ force: true })
        cy.wait(5000)

        cy.get('.generic.primary').eq(0).should('have.css', 'background-color', 'rgb(52, 125, 224)')
        cy.get('.generic.primary').eq(0).invoke('show').realHover().should('have.css', 'background-color', 'rgb(12, 57, 146)')

        cy.wait(5000)


        /*  cy.window().then((win) => {
 
           let elements = win.document.getElementsByClassName("generic primary");
           cy.log(elements)
           // Check if the elements collection is not empty and access the first element
           if (elements.length > 0) {
             const element = elements[0];
 
             // Create and dispatch a mouseover event
             const event = new win.MouseEvent('mouseover', {
               bubbles: true,
               cancelable: true,
             });
 
             // wir brauchen hier assertion
             element.dispatchEvent(event)
             const backgroundColor = window.getComputedStyle(element).backgroundColor;
             cy.log(backgroundColor)
             cy.log('Mouseover event dispatched, and background color asserted');
           } else {
             cy.log('No elements found with the specified class name');
           }
 
         }); */

        cy.wait(5000)

        /*  Wählen Sie das Jahr 2024 */
        cy.get('#mat-select-value-5').eq(0).click({ force: true })
        cy.wait(5000)
        cy.get('#mat-option-9 > .mdc-list-item__primary-text > span.ng-star-inserted').click({ force: true })

        cy.wait(5000)

        cy.get('[title="Suchen"]').click({ force: true })

        cy.wait(5000)

        cy.contains('Ergebnisse').should('exist')

        cy.contains('für Betriebsstelle').should('exist')

        cy.get('[data-mat-icon-name="logout"]').click({ force: true })

      }

    })


  })



})


