describe('O2CAPNM-778', function () {
  /* 
       Cypress unterdrückt das Standardverhalten, bei dem der Test fehlschlägt, wenn eine nicht abgefangene Ausnahme auftritt
   */
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  /* 
    Testfalle Beschreibung - Belegungsplan: Filter
    */
  it('O2CAPNM-778', function () {
    let Var_rowsLength
    let Var_anmeldenummer
    let Var_gliesno
    let Var_Zusatztage = []
    let Var_Ausfalltage = []
    let Var_konfliktstatusAnmeldeposition
    let Var_zeitraumVon
    let Var_zeitraumBis
    let Var_Verkehrstage_idWochentag
    let Var_Verkehrstage_uhrzeitVon
    let Var_Verkehrstage_uhrzeitBis
    let Var_laenge = []
    let Var_laengeOberleitung = []
    let Var_NoZusatzausstattungen = []
    let Var_gesperrtAm
    let Var_gesperrtBis
    let myArray = [];
    let myArray1 = [];
    let myArray2 = [];
    let myArray3 = [];
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

        cy.contains('Belegungsplan').should('exist')
        cy.wait(10000)

        /* Suchen und Wählen Sie die  Betriebstelle, z.B. Stuttgart-Zazenhausen */
        cy.get('#mat-input-1').type('Stuttgart-Zazenhausen')
        cy.get('.mat-mdc-option.mdc-list-item.mat-mdc-tooltip-trigger.option.ng-star-inserted').eq(0).
          then(elm => {
            cy.get(elm).invoke('text').then((innerHTML) => {
              this.betriebstelle = innerHTML
              cy.log(this.Var_betriebstelle)
            })
            cy.get(elm).click({ force: true })
          })

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

        cy.wait('@apiCheck1').then(({ response }) => {

          expect(response.statusCode).to.eq(200);

          //  for (let i = 0; i <= response.body.length - 1; i++) {

          Var_anmeldenummer = (response.body[0].anmeldenummer)
          Var_gliesno = (response.body[0].Anmeldepositionen[0].nutzungsobjekt.noGleis.gleisNr)
          Var_Zusatztage = (response.body[0].Anmeldepositionen[0].Belegungen[0].Zusatztage) // null
          Var_Ausfalltage = (response.body[0].Anmeldepositionen[0].Belegungen[0].Ausfalltage) // null
          Var_konfliktstatusAnmeldeposition = (response.body[0].Anmeldepositionen[0].konfliktstatusAnmeldeposition) // false
          Var_zeitraumVon = (response.body[0].Anmeldepositionen[0].Belegungen[0].zeitraumVon)
          Var_zeitraumBis = (response.body[0].Anmeldepositionen[0].Belegungen[0].zeitraumBis)

          cy.log('Anmeldungen - Anmeldenummer ' + Var_anmeldenummer)
          cy.log('Anmeldungen - gliesno ' + Var_gliesno)
          cy.log('Anmeldungen - No. of Zusatztage ' + Var_Zusatztage)
          cy.log('Anmeldungen - No. of Ausfalltage ' + Var_Ausfalltage)
          cy.log('Anmeldungen - Konflikt status Anmeldeposition ' + Var_konfliktstatusAnmeldeposition)
          cy.log('Anmeldungen - zeitraumVon ' + Var_zeitraumVon)
          cy.log('Anmeldungen - Verkehrstage  - zeitraumBis ' + Var_zeitraumBis)

        })

        cy.wait('@apiCheck2').then(({ response }) => {

          expect(response.statusCode).to.eq(200);
          //  for (let i = 0; i <= response.body.length - 1; i++) {
          Var_laenge = JSON.stringify(response.body[1].laenge)
          Var_laengeOberleitung = JSON.stringify(response.body[1].laengeOberleitung)
          Var_NoZusatzausstattungen = response.body[1].NoZusatzausstattungen

          cy.log('Eigenschaften der Gleise - Länge ' + Var_laenge)
          cy.log('Eigenschaften der Gleise - Oberleitung ' + Var_laengeOberleitung)
          cy.log('No of Zusatzausstattungen ' + Var_NoZusatzausstattungen)
          // }
        })

        cy.wait('@apiCheck3').then(({ response }) => {

          expect(response.statusCode).to.eq(200);

          if (response.body.length == 0) {
            cy.log('Es gibt keine Sperrung der Betriebsstelle')
          }
          else {
            cy.log('Es gibt Sperrung der Betriebsstelle')

            Var_gesperrtAm = (response.body[0].gesperrtAm)
            Var_gesperrtBis = (response.body[0].gesperrtBis)

            let Var_Sperrung_duration = new Date(Var_gesperrtBis) - new Date(Var_gesperrtAm);
            const seconds = Math.abs(Var_Sperrung_duration / 1000);

            if (seconds == 86400) {
              cy.log('Die Betriebsstelle ist für 24 Stunden gesperrt')
            } else {
              throw new Error('Die Betriebsstelle ist nicht für 24 Stunden gesperrt')
            }
          }
        })

        cy.get('#einklappen').click({ force: true })

        /* Ob Glies doppelt Werte hat */
        cy.get('.mat-mdc-select-arrow-wrapper.ng-tns-c50-11').click({ force: true })
        cy.get('.mdc-list-item__primary-text')
          .then(elm => {
            for (let i = 0; i <= elm.length - 1; i++) {
              cy.get(elm[i]).invoke('text').then((GliesNummer) => {
                // Log or use the elementText as needed
                cy.log(GliesNummer)
                myArray.push(GliesNummer)
                cy.wrap(myArray).as('myArray123')
              });
            }
          })
        cy.get('@myArray123').then(myArray123 => {
          cy.log(myArray123);

          if (new Set(myArray123).size !== myArray123.length) {
            throw new Error('Glies hat doppelt Werte');
          };

          /* Ob Produktkategorie doppelt Werte hat */
          cy.get('.mat-mdc-select-value.ng-tns-c50-1').click({ force: true })
          cy.get('.mdc-list-item__primary-text')
            .then(elm => {
              for (let i = myArray123.length + 1; i <= elm.length - 1; i++) {
                cy.get(elm[i]).invoke('text').then((Produktkategorie) => {
                  // Log or use the elementText as needed
                  cy.log(Produktkategorie)
                  myArray1.push(Produktkategorie)
                  cy.wrap(myArray1).as('myArray1234')
                });
              }
            })

          cy.get('@myArray1234').then(myArray1234 => {
            cy.log(myArray1234);

            if (new Set(myArray1234).size !== myArray1234.length) {
              throw new Error('Produktkategorie hat doppelt Werte');
            };

            /* Ob Kundennummer doppelt Werte hat */
            cy.get('.mat-mdc-select-arrow-wrapper.ng-tns-c50-5').click({ force: true })
            cy.wait(5000)
            cy.get('.mdc-list-item__primary-text')
              .then(elm => {
                for (let i = myArray123.length + myArray1234.length + 1; i <= elm.length - 1; i++) {
                  cy.get(elm[i]).invoke('text').then((Kundennummer) => {
                    // Log or use the elementText as needed
                    cy.log(Kundennummer)
                    myArray2.push(Kundennummer)
                    cy.wrap(myArray2).as('myArray12345')
                  });
                }
              })
            cy.get('@myArray12345').then(myArray12345 => {
              cy.log(myArray12345);
              if (new Set(myArray12345).size !== myArray12345.length) {
                throw new Error('Produktkategorie hat doppelt Werte');
              };
            });
          });
        });

        cy.get('.b-sch-event.b-sch-event-fixed.b-sch-event-resizable-false.b-has-content').first().
          invoke('show').realHover().should('have.css', 'background-color', 'rgb(212, 212, 207)')
        cy.wait(5000)
        cy.get('.mat-mdc-select-arrow-wrapper.ng-tns-c50-5').click({ force: true })
        cy.wait(5000)
        cy.get('#mat-option-1').click({ force: true })
        cy.wait(5000)
        cy.get('.b-sch-event.b-sch-event-resizable-true.b-has-content').first().
          invoke('show').realHover().should('have.css', 'background-color', 'rgb(66, 165, 245)')

        cy.wait(5000)

        cy.get('[data-mat-icon-name="logout"]').click({ force: true })

      }

    })









  })

})


