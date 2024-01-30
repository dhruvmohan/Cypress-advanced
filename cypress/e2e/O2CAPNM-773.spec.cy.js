describe('O2CAPNM-773', function () {
    /* 
        Cypress unterdrückt das Standardverhalten, bei dem der Test fehlschlägt, wenn eine nicht abgefangene Ausnahme auftritt
    */
    Cypress.on('uncaught:exception', (err, runnable) => {
      return false;
    });
  
    /* 
      Testfalle Beschreibung - Belegungsplan: Einlesen der Anmeldungen
      */
    it('O2CAPNM-773', function () {
  
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
  
            // for (let j = 0; j <= response.body[i].Anmeldepositionen[0].Belegungen.length - 1; j++) {
  
  
            for (let j = 0; j <= response.body[i].Anmeldepositionen[0].Belegungen[0].Verkehrstage.length - 1; j++) {
  
              Var_Verkehrstage_idWochentag = (response.body[0].Anmeldepositionen[0].Belegungen[0].Verkehrstage[j].idWochentag)
              Var_Verkehrstage_uhrzeitVon = (response.body[0].Anmeldepositionen[0].Belegungen[0].Verkehrstage[j].uhrzeitVon)
              Var_Verkehrstage_uhrzeitBis = (response.body[0].Anmeldepositionen[0].Belegungen[0].Verkehrstage[j].uhrzeitBis)
  
              cy.log('Verkehrstage idWochentag ' + Var_Verkehrstage_idWochentag + ' uhrzeitVon ' + Var_Verkehrstage_uhrzeitVon)
  
              cy.log('Verkehrstage idWochentag ' + Var_Verkehrstage_idWochentag + ' uhrzeitBis ' + Var_Verkehrstage_uhrzeitBis)
  
            }
            // }
  
            // }
  
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
  
          cy.get('[data-mat-icon-name="logout"]').click({ force: true })
  
        }
  
      })
  
    })
  
  
    /* Überprüfen Sie die Anmeldedetails in der alten Anwendung mit Selenium */
    it('Überprüfen Sie die Anmeldedetails', function () {
  
      let var_url = 'https://URL:PORT/'
      let username = 'test'
      let password = 'test'
  
      /* Überprüfen Sie die Anmeldedetails in der alten Anwendung unter KundenManagement optionen */
      cy.task('seleniumBrowser', { var_url, username, password })
  
    })
  
  })
  
  
  