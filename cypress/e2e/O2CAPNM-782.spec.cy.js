describe('O2CAPNM-782', function () {
  /* 
       Cypress unterdrückt das Standardverhalten, bei dem der Test fehlschlägt, wenn eine nicht abgefangene Ausnahme auftritt
   */
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  /* 
 Testfalle Beschreibung - Belegungsplan: Export/Import
 */
  it('O2CAPNM-782', function () {

    var Var_rowsLength
    var Var_Registration
    var Var_gesperrtAm
    let Var_anmeldung

    /*     Lesen Sie Daten aus Excel CypressParam.xlsx */
    cy.task('readXlsx', { file: 'cypress/fixtures/CypressParam.xlsx', sheet: "Param" }).then((rows) => {
      Var_rowsLength = rows.length;
      cy.writeFile("cypress/fixtures/xlsxData.json", { rows })
    })

    cy.fixture('xlsxData').then((data) => {
      for (let i = 0; i < Var_rowsLength; i++) {

        var url = data.rows[i].URL
        var username = data.rows[i].Username
        var password = data.rows[i].Password
        var betriebstelle = data.rows[i].Betriebstelle

        cy.visit('https://apn-dev.cnp-test.comp.db.de/')

        cy.wait(5000)

        /*   Melden Sie sich bei der neuen APN-Anwendung an
*/
        cy.get('#Triangle-Copy').click({ force: true })
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

        cy.contains('Belegungsplan').should('exist')

        cy.wait(10000)

        /* Suchen und Wählen Sie die  Betriebstelle, z.B. Stuttgart-Zazenhausen */
        cy.get('#mat-input-1').type('Stuttgart')
        cy.get('.mat-mdc-option.mdc-list-item.mat-mdc-tooltip-trigger.option.ng-star-inserted').eq(0).click({ force: true })

        cy.wait(5000)

        /*  Wählen Sie das Jahr 2024 */
        cy.get('#mat-select-value-5').eq(0).click({ force: true })
        cy.wait(5000)
        cy.get('#mat-option-9 > .mdc-list-item__primary-text > span.ng-star-inserted').click({ force: true })

        cy.wait(5000)

        /* Netzwerkanfragen erfassen */
        cy.intercept({
          method: 'GET',
          path: '/service-gateway/anmeldungen?anmeldeverfahren=NFP&fahrplanjahr=2024&betriebsstelle=443'
        }).as('apiCheck1')

        cy.intercept({
          method: 'POST',
          path: '/service-gateway/no-gleis'
        }).as('apiCheck2')

        cy.intercept({
          method: 'GET',
          path: '443'
        }).as('apiCheck3')

        cy.get('[title="Suchen"]').click({ force: true })

        cy.wait(5000)

        cy.contains('Ergebnisse').should('exist')

        cy.contains('für Betriebsstelle').should('exist')


        /* Wählen Alle Kundennummer */
        cy.get('.mat-mdc-select-arrow-wrapper.ng-tns-c50-5').click({ force: true })
        cy.wait(5000)
        cy.get('#mat-option-1').click({ force: true })
        cy.wait(10000)


        cy.get('#einklappen').click({ force: true })

        cy.wait('@apiCheck1').then(({ response }) => {

          expect(response.statusCode).to.eq(200);

          Var_Registration = response.body.length
          cy.log(Var_Registration)

          if (Var_Registration == 0) {
            throw new Error('No registrations available for this Betribstelle. Please select a different Betribstelle')
          }
          // cy.log(response.body[this.Var_anmeldung].Anmeldepositionen[0].preisInEuro)

          cy.wait(5000)

          /* Finden Sie die erste Anmeldung aus */
          cy.get('.b-sch-event.b-sch-event-resizable-true.b-has-content').then(elm1 => {

            /*  Wählen Sie die erste Anmeldung und bearbeiten  */
            cy.get(elm1).first().click({ force: true })
            cy.get('.mat-mdc-button-touch-target').eq(1).click({ force: true })
            cy.wait(5000)
            cy.get('[placeholder="Von"]').clear()
            cy.get('[placeholder="Von"]').type('10.12.2023')
            cy.wait(5000)
            cy.get('[placeholder="Bis"]').clear()
            cy.get('[placeholder="Bis"]').type('11.1.2024')
            cy.wait(5000)
            cy.get('.mat-icon.notranslate.regular.material-icons.mat-ligature-font.mat-icon-no-color').eq(2).click({ force: true })
            cy.get('.mat-icon.notranslate.regular.material-icons.mat-ligature-font.mat-icon-no-color').eq(3).click({ force: true })
            cy.get('.mat-icon.notranslate.regular.material-icons.mat-ligature-font.mat-icon-no-color').eq(0).click({ force: true })
            cy.get('.mat-mdc-button-touch-target').eq(8).click({ force: true })
            cy.get('.mat-calendar-body-cell-content.mat-focus-indicator.mat-calendar-body-today').click({ force: true })
            cy.contains('Übernehmen').click({ force: true })
            cy.contains('Änderung übernehmen ').click({ force: true })

            /* Suchen Sie das erste Glies-Element und verschieben Sie die Registrierung dorthin */
            cy.get('.b-grid-cell.b-widget-cell.b-sch-timeaxis-cell').eq(0).then(elm2 => {
              cy.get(elm1).click({ force: true }).then(elm3 => {
                cy.get(elm3).drag(elm2, { force: true })
                  .then((success) => {
                    assert.isTrue(success)
                  })
                cy.get('[id="mat-input-3"]').click({ force: true })
                cy.get('[id="mat-input-3"]').type('Verschieben')
                cy.contains(' Speichern ').click({ force: true })
                cy.contains(' Fortfahren ').click({ force: true })
                cy.contains(' Die Anmeldung wurde erfolgreich verschoben. ')
                cy.wait(10000)
              })
            })
          })
        })

        cy.contains(' cloud_download ').click({ force: true })

        cy.get('.cdk-overlay-pane.dialog-export-import')
          .then(elm => {
            cy.get(elm).get('[placeholder="Datenabzug"]').click({ force: true })
            cy.get(elm).get('[value="Zwischenstand"]').click({ force: true })
            cy.wait(5000)
            cy.get(elm).get('[placeholder="Dateiformat"]').click({ force: true })
            cy.get(elm).get('mat-option[role="option"]').eq(2).click({ force: true })
            cy.get(elm).contains('Herunterladen').click({ force: true })
          })

        cy.wait(5000)
        cy.get('#importBelplan').attachFile('Stuttgart-Zazenhausen.json')
        cy.wait(5000)



        cy.contains(' cloud_download ').click({ force: true })
        cy.get('.cdk-overlay-pane.dialog-export-import')
          .then(elm => {
            cy.get(elm).get('[placeholder="Datenabzug"]').click({ force: true })
            cy.get(elm).get('[value="Koordinierungsprotokoll"]').click({ force: true })
            cy.wait(5000)
            cy.get(elm).get('[placeholder="Dateiformat"]').click({ force: true })
            cy.get(elm).get('mat-option[role="option"]').eq(0).click({ force: true })
            cy.get(elm).contains('Herunterladen').click({ force: true })
          })

        cy.wait(5000)

        cy.get('#importBelplan').attachFile('Koordinierungsprotokoll.pdf')

        cy.wait(5000)

        cy.contains(' cloud_download ').click({ force: true })
        cy.get('.cdk-overlay-pane.dialog-export-import')
          .then(elm => {
            cy.get(elm).get('[placeholder="Datenabzug"]').click({ force: true })
            cy.get(elm).get('[value="Bearbeitungsprotokoll"]').click({ force: true })
            cy.wait(5000)
            cy.get(elm).get('[placeholder="Dateiformat"]').click({ force: true })
            cy.get(elm).get('mat-option[role="option"]').click({ force: true })
            cy.get(elm).contains('Herunterladen').click({ force: true })
          })

        cy.wait(5000)

        cy.get('#importBelplan').attachFile('Bearbeitungsprotokoll.xlsx')

        cy.get('[data-mat-icon-name="logout"]').click({ force: true })

      }

    })


  })



})


