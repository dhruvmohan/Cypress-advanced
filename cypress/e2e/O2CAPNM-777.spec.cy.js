describe('O2CAPNM-777', function () {
  /* 
    Cypress unterdrückt das Standardverhalten, bei dem der Test fehlschlägt, wenn eine nicht abgefangene Ausnahme auftritt
*/
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  /* 
   Testfalle Beschreibung - Belegungsplan: Preisauskunft
   */
  it('O2CAPNM-777', function () {

    let Var_rowsLength
    let Var_preisInEuro
    let Var_applicationnumber
    let Var_anmeldung
    let test
    let Var_Nutzungsentgelt
    let Var_Nutzungsentgelt_inclusiveZA

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

        cy.contains('Belegungsplan').should('exist')
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

        /* Netzwerkanfragen erfassen */
        cy.intercept({
          method: 'GET',
          path: '/service-gateway/anmeldungen?anmeldeverfahren=NFP&fahrplanjahr=2024&betriebsstelle=443'
        }).as('apiCheck1')

        cy.get('[title="Suchen"]').click({ force: true })

        cy.wait(5000)

        cy.contains('Ergebnisse').should('exist')

        cy.contains('für Betriebsstelle').should('exist')

        cy.wait(5000)

        /* Wählen Alle Kundennummer */
        cy.get('.mat-mdc-select-arrow-wrapper.ng-tns-c50-5').click({ force: true })
        cy.wait(5000)
        cy.get('#mat-option-1').click({ force: true })

        cy.wait(15000)

        cy.get('#einklappen').click({ force: true })

        cy.wait('@apiCheck1').then(({ response }) => {

          expect(response.statusCode).to.eq(200);

          //  for (let i = 0; i <= response.body.length - 1; i++) {

          /* Finden Sie die erste Anmeldung aus */
          cy.get('.b-sch-event.b-sch-event-resizable-true.b-has-content').then(elm => {
            test = elm.length
            //  for (let i = 0; i <= test - 1; i++) {

            /*  Wählen Sie die erste Anmeldung aus und finden Sie die erste Anmeldung nummer */
            cy.get('.b-sch-event.b-sch-event-resizable-true.b-has-content').eq(0).click({ force: true })
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

                // cy.log(response.body[this.Var_anmeldung].Anmeldepositionen[0].preisInEuro)
                // this.Var_preisInEuro = (response.body[Var_anmeldung].Anmeldepositionen[0].preisInEuro)

                cy.wait(5000)


                /*  Wählen Sie die erste Anmeldung aus und finden Sie die Preis für die Anmeldung */
                cy.get('.b-sch-event.b-sch-event-resizable-true.b-has-content').eq(0).then(elm1 => {

                  // cy.wait(5000)
                  //  cy.log(elm.length)
                  // cy.get('.b-sch-event.b-sch-event-resizable-true.b-has-content').eq([Var_anmeldung]).click({ force: true })

                  cy.get(elm1).click({ force: true })

                  cy.contains('Nutzungsentgelt (Gleis)').should('exist')
                  cy.contains('Nutzungsentgelt (Gleis + ZA):').should('exist')

                  cy.xpath('/html/body/app-root/app-wrapper/div[2]/div/app-belegungsplan/div[1]/app-side-nav-selektierte-anmeldung/div/div[2]/div[10]/span[2]/b')
                    .invoke('text')
                    .then((Nutzungsentgelt) => {
                      // Use the captured text or perform further actions
                      cy.log('Captured text:', Nutzungsentgelt);
                      cy.wrap(Nutzungsentgelt).as('Var_Nutzungsentgelt')

                    });

                  cy.xpath('/html/body/app-root/app-wrapper/div[2]/div/app-belegungsplan/div[1]/app-side-nav-selektierte-anmeldung/div/div[2]/div[11]/span[2]/b')
                    .invoke('text')
                    .then((Nutzungsentgelt_inclusiveZA) => {
                      // Use the captured text or perform further actions
                      cy.log('Captured text:', Nutzungsentgelt_inclusiveZA);
                      cy.wrap(Nutzungsentgelt_inclusiveZA).as('Var_Nutzungsentgelt_inclusiveZA')

                    });

                  /*   Bearbeiten Sie die Anmeldedaten */

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

                  cy.get(elm1).click({ force: true })
                  // cy.get('.b-sch-event.b-sch-event-resizable-true.b-has-content').eq([i]).click({ force: true })

                  cy.contains('Nutzungsentgelt (Gleis)').should('exist')
                  cy.contains('Nutzungsentgelt (Gleis + ZA):').should('exist')

                  cy.xpath('/html/body/app-root/app-wrapper/div[2]/div/app-belegungsplan/div[1]/app-side-nav-selektierte-anmeldung/div/div[2]/div[10]/span[2]/b')
                    .invoke('text')
                    .then((Nutzungsentgelt_change) => {
                      // Use the captured text or perform further actions
                      cy.log('Captured text:', Nutzungsentgelt_change);
                      if (Nutzungsentgelt_change == Var_Nutzungsentgelt) {
                        throw new Error('Nutzungsentgelt (Gleis) should be different after modifications of Anmeldung')
                      }
                    });

                  cy.xpath('/html/body/app-root/app-wrapper/div[2]/div/app-belegungsplan/div[1]/app-side-nav-selektierte-anmeldung/div/div[2]/div[11]/span[2]/b')
                    .invoke('text')
                    .then((Nutzungsentgelt_inclusiveZA_change) => {
                      // Use the captured text or perform further actions
                      cy.log('Captured text:', Nutzungsentgelt_inclusiveZA_change);
                      if (Nutzungsentgelt_inclusiveZA_change == Var_Nutzungsentgelt_inclusiveZA) {
                        throw new Error('Nutzungsentgelt (Gleis + ZA) should be different after modifications of Anmeldung')
                      }
                    });

                })
              })
            })
          })
        })

        cy.get('[data-mat-icon-name="logout"]').click({ force: true })

      }
    })









  })

})


