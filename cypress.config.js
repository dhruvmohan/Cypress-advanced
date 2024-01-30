const { defineConfig } = require("cypress");

const xlsx = require("node-xlsx").default;
const fs = require("fs"); // for file
const path = require("path"); // for file path

const readXlsx = require("./read-xlsx");

const { Builder, By, until, ChromiumWebDriver } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const { Select } = require('selenium-webdriver');

const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const addCucumberPreprocessorPlugin =
  require("@badeball/cypress-cucumber-preprocessor").addCucumberPreprocessorPlugin;
const createEsBuildPlugin =
  require("@badeball/cypress-cucumber-preprocessor/esbuild").createEsbuildPlugin;

module.exports = defineConfig({
  e2e: {
    chromeWebSecurity: true,
    screenshotOnRunFailure: true,
    watchForFileChanges: false,
    screenshotsFolder: "cypress/results/mochawesome-report/assets",
    env: {
      log: {
        level: "warn" // Set the log level globally to "warn"
      }
    },
    // retries: {
    //  runMode: 1,
    //  openMode: 1,
    //},
    defaultCommandTimeout: 50000,
    pageLoadTimeout: 120000,
    reporter: "mochawesome",
    reporterOptions: {
      charts: true,
      reportDir: "cypress/results",
      reportFilename: "report",
      overwrite: false,
      html: true,
      json: true,
      charts: true,
      embeddedScreenshots: true,
      inlineAssets: true,
    },
    video: true,
    specPattern: ["**/*.feature", "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}"],

    async setupNodeEvents(on, config) {


      on("task", {
        readXlsx: readXlsx.read,

        seleniumBrowser: async ({ var_url, username, password }) => {
          const chromeCapabilities = new chrome.Options();
          const driver = await new Builder()
            .forBrowser("chrome")
            .setEdgeOptions(chromeCapabilities)
            .build();
          await driver.manage().window().maximize();
          await driver.get(var_url)
          await driver.findElement(By.id("wm_login-username")).sendKeys(username)
          await driver.findElement(By.id("pw-input-view")).click()
          await driver.findElement(By.id("wm_login-password")).click()
          await driver.findElement(By.id("wm_login-password")).sendKeys(password)
          await driver.findElement(By.id("submit_login")).click()
          await driver.findElement(By.xpath('//a[text()="Kundenmanagement"]')).click();
          await driver.findElement(By.xpath('//a[text()="Eingegangene Anmeldungen"]')).click();
          await driver.findElement(By.xpath('//input[contains(@class, "input20")]')).click()
          await driver.findElement(By.xpath('//input[contains(@class, "input20")]')).sendKeys("Stuttgart-Best")
          await driver.sleep(5000);
          await driver.findElement(By.xpath(`//*[contains(text(), 'Stuttgart-Best')]`)).click()
          await driver.findElement(By.css('input[type="checkbox"]')).click()
          await driver.findElement(By.xpath('//span[text()="Suchen"]')).click()
          await driver.sleep(15000);
          driver.close()
          return driver;
        },

        Sperrung_Afheben: async ({ var_url, username, password }) => {
          const chromeCapabilities = new chrome.Options();
          const driver = await new Builder()
            .forBrowser("chrome")
            .setEdgeOptions(chromeCapabilities)
            .build();
          await driver.manage().window().maximize();
          await driver.get(var_url)
          await driver.findElement(By.id("wm_login-username")).sendKeys(username)
          await driver.findElement(By.id("pw-input-view")).click()
          await driver.findElement(By.id("wm_login-password")).click()
          await driver.findElement(By.id("wm_login-password")).sendKeys(password)
          await driver.findElement(By.id("submit_login")).click()
          await driver.findElement(By.xpath('//a[text()="Administration"]')).click();
          await driver.findElement(By.xpath('//a[text()="Belegungsplan"]')).click();
          const elements = await driver.findElements(By.xpath('//input[contains(@class, "input20")]'));
          await elements[1].click()        
          await driver.sleep(5000); 
          await elements[1].sendKeys("Stuttgart-Best")
          await driver.sleep(5000);
          await driver.findElement(By.xpath(`//*[contains(text(), 'Stuttgart-Best')]`)).click()
          await driver.sleep(5000);
          await driver.findElement(By.xpath('//span[text()="Suche"]')).click();
          await driver.sleep(5000);
          let elements1 = await driver.findElements(By.xpath('//input[contains(@class, "cbToDisable")]'));;
          let secondElement1 = elements1[1];
          await secondElement1.click();
          await driver.sleep(5000);
          {
            let elements2 = await driver.findElements(By.xpath('//select[contains(@class, "panelToDisable")]'));
            let secondElement2 = elements2[1];
            await secondElement2.click();
            await driver.sleep(5000)
            let select = new Select(secondElement2);
            await select.selectByIndex(0);
            await driver.sleep(5000);
          }
          await driver.findElement(By.xpath('//span[text()="Speichern"]')).click();
          await driver.sleep(5000);
          await driver.findElement(By.xpath('//span[text()="Fortfahren"]')).click();
          await driver.sleep(5000);
          await driver.findElement(By.xpath('//a[text()="Logout "]')).click();
          driver.close();
          return driver;
        }

      });


      // implement node event listeners here

      const bundler = createBundler({
        plugins: [createEsBuildPlugin(config)],
      });

      // on("file:preprocessor", bundler);

      // await addCucumberPreprocessorPlugin(on, config);

      // return config;

    },



  },


});


/*

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
*/


