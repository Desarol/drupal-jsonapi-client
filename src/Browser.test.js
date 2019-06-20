/* eslint-disable import/first */
require('regenerator-runtime/runtime') // eslint-disable-line

import path from 'path'
import puppeteer from 'puppeteer'

describe('Browser', () => {
  it('should run in the browser', async () => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.addScriptTag({ path: path.join(__dirname, '../lib/Browser.min.js') })
    const result = await page.evaluate(() => (
      new window.DrupalJsonApi.QueryParameters(['page[offset]=0', 'page[limit]=50']).toString()
    ))
    await browser.close()

    expect(result).toEqual('page[offset]=0&page[limit]=50')
  })
})
