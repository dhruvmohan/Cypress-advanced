describe('O2CAPNM-1090', () => {

  let Var_token;
  let Var_rowsLength

  /* Schritt zum Generieren eines Session token mit hilfe von  amazonaws*/

  it('Generate Session-token', function () {

    /*     Lesen Sie Daten aus Excel Abrechnungs_Position.xlsx */
    cy.task('readXlsx', { file: 'cypress/fixtures/Abrechnungs_Position.xlsx', sheet: "Param" }).then((rows) => {
      Var_rowsLength = rows.length;
      cy.writeFile("cypress/fixtures/Abrechnungs_Position.json", { rows })
    })

    cy.fixture('Abrechnungs_Position').then((data) => {
      for (let i = 0; i < Var_rowsLength; i++) {

        var Var_username = data.rows[i].Username
        var Var_password = data.rows[i].Password

        let headersList = {
          "Accept": "*/*",
          "User-Agent": "Thunder Client (https://www.thunderclient.com)",
          "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
          "Content-Type": "application/x-amz-json-1.1"
        }

        let bodyContent = JSON.stringify({
          "AuthParameters": {
            "USERNAME": Var_username,
            "PASSWORD": Var_password
          },
          "AuthFlow": "USER_PASSWORD_AUTH",
          "ClientId": "client"
        });

        cy.request({
          method: 'POST',
          headers: headersList,
          body: bodyContent,
          url: 'https://cognito-idp.eu-central-1.amazonaws.com/',

        }).then(($response) => {
          let AWSResponse = (($response.body));
          var AWS_Response = JSON.parse(AWSResponse)
          var AuthenticationResult = (AWS_Response['AuthenticationResult'])
          this.Var_token = (AuthenticationResult['AccessToken'])

        });
      } // end of for
    })
  })

  /* 
   Testfalle Beschreibung -  Abrechnungspositionen: Suche (Backend) mit Filter, Sortierung und Paginierung
   */

  it('O2CAPNM-1090', function () {

    /*     Lesen Sie Daten aus Excel Abrechnungs_Position.xlsx */
    cy.task('readXlsx', { file: 'cypress/fixtures/Abrechnungs_Position.xlsx', sheet: "Param" }).then((rows) => {
      Var_rowsLength = rows.length;
      cy.writeFile("cypress/fixtures/Abrechnungs_Position.json", { rows })
    })


    cy.fixture('Abrechnungs_Position').then((data1) => {

      for (let i = 0; i < Var_rowsLength; i++) {

        var Var_url = data1.rows[i].URL
        var Var_betriebsstelleId = data1.rows[i].BetriebsstelleId


        const data2 = JSON.stringify({
          "filterOptions": {
            "betriebsstelleId": Var_betriebsstelleId
          },
          "pageSize": 10,
          "pageNumber": 1,
          "sorts": [
            {
              "sortProperty": "uuid",
              "sortDirection": "ASC"
            }
          ]
        });


        const access_token = this.Var_token


        /* Postanfrage für Abrechnungspositionen */
        cy.request({
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            'authorization': 'Bearer ' + access_token
          },
          body: data2,
          url: Var_url + '/service-gateway/abrechnungspositionen',
        }).then(($response) => {
          expect($response.status).to.eq(200);
          cy.log(JSON.stringify($response.body));
        });
      }
    })
  })
})

