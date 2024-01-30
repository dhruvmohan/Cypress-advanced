
describe('O2CAPNM-779', function () {
  /* 
      Cypress unterdrückt das Standardverhalten, bei dem der Test fehlschlägt, wenn eine nicht abgefangene Ausnahme auftritt
  */
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  /* 
Testfalle Beschreibung - Belegungsplan: Bearbeitung von Anmeldungen
*/
  it('O2CAPNM-779', function () {

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

        cy.visit('https://apn-dev.cnp-test.comp.db.de/')

        cy.wait(5000)

        /*   Melden Sie sich bei der neuen APN-Anwendung an
        */
        cy.wait(5000)
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
          cy.contains('Belegungsplan').click({ force: true })
        })

        cy.wait(10000)


        /* Suchen und Wählen Sie die  Betriebstelle, z.B. Stuttgart-Zazenhausen */
        cy.get('#mat-input-1').type('Stuttgart-Zazenhausen')
        cy.get('.mat-mdc-option.mdc-list-item.mat-mdc-tooltip-trigger.option.ng-star-inserted').eq(0).click({ force: true })

        cy.wait(5000)

        /*  Wählen Sie das Jahr 2024 */
        cy.get('#mat-select-value-5').eq(0).click({ force: true })
        cy.wait(5000)
        cy.get('#mat-option-9 > .mdc-list-item__primary-text > span.ng-star-inserted').click({ force: true })

        cy.wait(5000)

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

        cy.wait('@apiCheck3').then(({ response }) => {
          expect(response.statusCode).to.eq(200);

          Var_gesperrtAm = JSON.stringify(response.body.gesperrtAm)
          cy.log(Var_gesperrtAm)

          if (Var_gesperrtAm != null) {
            throw new Error('The Betribstelle is blocked. Please select a different Betribstelle')
          }

        })

        cy.wait('@apiCheck1').then(({ response }) => {

          expect(response.statusCode).to.eq(200);

          Var_Registration = response.body.length
          cy.log(Var_Registration)

          if (Var_Registration == 0) {
            throw new Error('No registrations available for this Betribstelle. Please select a different Betribstelle')
          }

          cy.get('.b-sch-event.b-sch-event-resizable-true.b-has-content').first().click({ force: true })
          cy.get('.detail-Content.contentArea > .ng-star-inserted').eq(0)
            .invoke('text').then((innerHTML) => {
              this.Var_applicationnumber = innerHTML
              cy.log(this.Var_applicationnumber)
              cy.wrap(this.Var_applicationnumber).as('Var_applicationnumber')

            })

          cy.get('@Var_applicationnumber').then(Var_applicationnumber => {

            cy.log(Var_applicationnumber)

            for (let i = 0; i <= response.body.length - 1; i++) {
              if (response.body[i].anmeldenummer == Var_applicationnumber) {

                this.Var_anmeldung = i;
                cy.wrap(this.Var_anmeldung).as('Var_anmeldung')

                break;
              }
            }

            cy.get('@Var_anmeldung').then(Var_anmeldung => {

              cy.log(Var_anmeldung)

              cy.wait(5000)

              cy.get('.b-sch-event.b-sch-event-resizable-true.b-has-content').then(elm1 => {

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

                    cy.contains('Verschobene Anmeldungen').click({ force: true })
                    cy.contains(Var_anmeldung).should('exist')

                    cy.get(elm3).click({ force: true })

                    cy.get('.mat-mdc-button-touch-target').eq(6).click({ force: true })
                    cy.get('[value="ablehnen"]').click({ force: true })
                    cy.get('[placeholder="Kommentar eingeben"]').click({ force: true })
                    cy.get('[placeholder="Kommentar eingeben"]').type('Ablehnen')
                    cy.contains(' Fortfahren ').click({ force: true })
                    cy.wait(5000)
                    cy.contains(' Fortfahren ').click({ force: true })

                    cy.wait(5000)

                



                  })

                })

              })

            })

          })
          cy.contains('Aktive Anmeldungen').click({ force: true })

          cy.get('.b-sch-event.b-sch-event-resizable-true.b-has-content').first().click({ force: true })

          cy.get('.mat-mdc-button-touch-target').eq(3).click({ force: true })
          
          cy.contains(' Fortfahren ').click({ force: true })


        })



        /*

        cy.get('.generic.secondary.error').focused().realHover().
        then(elm => {

         cy.log(elm)
          cy.get(elm).invoke('text').then((innerHTML) => {
            let text = innerHTML
            cy.log(text)

          })

        })
        */

        cy.get('.generic.secondary.error').trigger('mouseover', { force: true }).invoke('show').
          then(elm => {

            cy.log(elm)
            cy.get(elm).invoke('text').then((innerHTML) => {
              let text = innerHTML
              cy.log(text)

            })

          })


        cy.get('[data-mat-icon-name="logout"]').click({ force: true })

      }

    })


  })



})


