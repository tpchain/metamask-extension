const { strict: assert } = require('assert')
const { By, Key } = require('selenium-webdriver')
const { withFixtures } = require('./helpers')

/**
 * WARNING: These tests must be run using a build created with `yarn build:test:metrics`, so that it has
 * the correct Segment host and write keys set. Otherwise this test will fail.
 */
describe('Segment metrics', function () {
  this.timeout(0)

  it('Sends close metric upon closing transaction confirmation notification window', async function () {
    const ganacheOptions = {
      accounts: [
        {
          secretKey:
            '0x7C9529A67102755B7E6102D6D950AC5D5863C98713805CEC576B945B15B71EAC',
          balance: 25000000000000000000,
        },
      ],
    }
    await withFixtures(
      {
        dapp: true,
        fixtures: 'metrics-enabled',
        ganacheOptions,
        title: this.test.title,
        mockSegment: true,
      },
      async ({ driver, segmentSpy }) => {
        const passwordField = await driver.findElement(By.css('#password'))
        await passwordField.sendKeys('correct horse battery staple')
        await passwordField.sendKeys(Key.ENTER)

        await driver.openNewPage('http://127.0.0.1:8080/')
        const windowHandles = await driver.getAllWindowHandles()
        const extension = windowHandles[0]
        const dapp = windowHandles[1]

        await driver.clickElement(By.id('sendButton'))

        await driver.waitUntilXWindowHandles(3)
        await driver.switchToWindowWithTitle('MetaMask Notification')

        // Wait until footer renders, to ensure `beforeunload` handler has been setup
        await driver.findElement(
          By.css('[data-testid="page-container-footer-next"]'),
        )

        await driver.closeAllWindowHandlesExcept([extension, dapp])
        await driver.switchToWindow(extension)

        assert.ok(segmentSpy.called, 'Segment should receive metrics')

        assert.equal(
          segmentSpy.lastCall.args[0].event,
          'Cancel Tx Via Notification Close',
        )
      },
    )
  })
})
