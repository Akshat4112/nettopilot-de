import { expect, test } from '@playwright/test'

test('effective hourly results use current independent payroll and entered travel values', async ({
  page,
}) => {
  await page.goto('./')
  for (const side of ['A', 'B']) {
    await page
      .getByLabel(`Offer ${side} gross salary (EUR)`, { exact: true })
      .fill('48000')
    await page.getByLabel(`Offer ${side} contractual weekly hours`).fill('40')
    await page
      .getByLabel(`Offer ${side} working days per week`, { exact: true })
      .selectOption('5')
    await page
      .getByLabel(`Offer ${side} paid vacation days per year`)
      .fill('30')
    await page
      .getByLabel(`Offer ${side} office days per week`, { exact: true })
      .selectOption('0')
    for (const category of [
      'public transport',
      'fuel',
      'parking',
      'other costs',
    ]) {
      await page
        .getByLabel(`Offer ${side} ${category} per office day (EUR)`)
        .fill('0')
    }
    await page.getByLabel(`Offer ${side} one-way commute (minutes)`).fill('0')
  }
  await page.getByLabel('Comparison tax class').selectOption('1')
  await page.getByLabel('Comparison federal state').selectOption('DE-BW')
  await page.getByLabel('Comparison date of birth').fill('1990-01-01')
  await page.getByLabel(/Confirm shared standard payroll assumptions/).check()
  await page.getByRole('button', { name: 'Calculate net compensation' }).click()
  const hourly = page.getByRole('region', {
    name: 'Effective hourly compensation — after commuting',
  })
  await expect(hourly).toContainText('Hourly difference (B − A): €0.00 / hour.')
  await expect(
    hourly.getByRole('region', { name: 'Offer A effective hourly result' }),
  ).toContainText('1,840 hours')
  await page.getByLabel('Offer A fuel per office day (EUR)').fill('')
  await expect(
    hourly.getByRole('region', { name: 'Offer A effective hourly result' }),
  ).toContainText('unavailable')
  await expect(
    hourly.getByRole('region', { name: 'Offer B effective hourly result' }),
  ).toContainText('€0.00')
  await expect(hourly).not.toContainText('Hourly difference (B − A):')
})
