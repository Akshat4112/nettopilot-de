import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'

test('copy/download sharing requires consent and never publishes salary data in URLs', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 })
  await page.goto('./')

  const share = page.getByRole('region', { name: 'Share comparison' })
  await expect(share).toHaveCount(0)
  await page
    .getByLabel('Offer A gross salary (EUR)', { exact: true })
    .fill('48000')
  await page
    .getByLabel('Offer B gross salary (EUR)', { exact: true })
    .fill('60000')
  await page
    .getByLabel('Comparison tax class', { exact: true })
    .selectOption('1')
  await page
    .getByLabel('Comparison federal state', { exact: true })
    .selectOption('DE-BW')
  await page
    .getByLabel('Comparison date of birth', { exact: true })
    .fill('1990-01-01')
  await page
    .getByLabel(/Confirm shared standard payroll assumptions/)
    .check()
  await page
    .getByRole('button', { name: 'Calculate net compensation' })
    .click()

  await expect(share).toBeVisible()
  const consent = share.getByRole('checkbox', {
    name: /I understand this export contains private compensation figures/,
  })
  const copy = share.getByRole('button', {
    name: 'Copy comparison as text',
  })
  const downloadButton = share.getByRole('button', {
    name: 'Download comparison (.txt)',
  })
  await expect(copy).toBeDisabled()
  await expect(downloadButton).toBeDisabled()
  await consent.check()

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    downloadButton.click(),
  ])
  expect(download.suggestedFilename()).toBe(
    'nettopilot-offer-comparison-2026.txt',
  )
  const downloadedText = await readFile(await download.path(), 'utf8')
  expect(downloadedText).toContain(
    'Annual base gross | €48,000.00 | €60,000.00 | +€12,000.00',
  )
  expect(downloadedText).not.toContain('1990-01-01')
  expect(downloadedText).not.toContain('DE-BW')
  await expect(page).not.toHaveURL(/48000|60000|1990|DE-BW/)

  await page
    .getByLabel('Offer A gross salary (EUR)', { exact: true })
    .fill('50000')
  await expect(consent).not.toBeChecked()
  await expect(copy).toBeDisabled()
  await expect(downloadButton).toBeDisabled()
  await consent.check()
  const [updatedDownload] = await Promise.all([
    page.waitForEvent('download'),
    downloadButton.click(),
  ])
  const updatedText = await readFile(await updatedDownload.path(), 'utf8')
  expect(updatedText).toContain('Annual base gross | €50,000.00')
  expect(updatedText).not.toContain('Annual base gross | €48,000.00')

  const width = await page.evaluate(
    () => document.documentElement.scrollWidth,
  )
  expect(width).toBeLessThanOrEqual(375)
  await page.emulateMedia({ media: 'print' })
  await expect(share).toBeHidden()
  await page.emulateMedia({ media: 'screen' })

  await page
    .getByRole('button', { name: 'Reset payroll assumptions' })
    .click()
  await expect(share).toHaveCount(0)
  await expect(page).not.toHaveURL(/50000|48000|60000|1990/)

  await page.reload()
  await expect(share).toHaveCount(0)
  await expect(
    page.getByLabel('Offer A gross salary (EUR)', { exact: true }),
  ).toHaveValue('')
})
