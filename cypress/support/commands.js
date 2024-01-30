// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('customVisit', (url) => {
  return new Cypress.Promise((resolve, reject) => {
    // You can perform any custom logic here before or after visiting the URL
    // For example, you can log information, set cookies, etc.

    // Visit the specified URL
    cy.visit(url)
      .then(() => {
        // You can perform additional actions after visiting the URL
        // For example, you might want to wait for an element to be visible
        // or perform some assertions
        // ...

        // Resolve the promise to indicate success
        resolve();
      })
      .catch((error) => {
        // Reject the promise if there's an error during the visit
        reject(error);
      });
  });
});