import { describe, expect, it } from 'vitest'
import {
  createShareableSalaryUrl,
  readShareableSalarySettings,
} from './salary-share-link'

describe('privacy-safe salary share URLs', () => {
  it('round-trips only year, display period and broad federal state', () => {
    const url = createShareableSalaryUrl(
      'https://example.com/nettopilot-de/?old=discard#private',
      { year: '2026', period: 'annual', federalState: 'DE-BW' },
    )
    expect(url).toBe(
      'https://example.com/nettopilot-de/?np=1&year=2026&period=annual&state=DE-BW',
    )
    expect(readShareableSalarySettings(new URL(url).search)).toEqual({
      status: 'valid',
      settings: { year: '2026', period: 'annual', federalState: 'DE-BW' },
    })
    expect(url).not.toMatch(
      /gross|salary|birth|children|church|insurance|bonus|taxClass/i,
    )
  })

  it('supports no selected state without guessing a location', () => {
    expect(
      readShareableSalarySettings('?np=1&year=2026&period=monthly'),
    ).toEqual({
      status: 'valid',
      settings: { year: '2026', period: 'monthly' },
    })
  })

  it('rejects unknown fields, duplicated parameters and unsupported states', () => {
    for (const query of [
      '?np=1&year=2026&period=monthly&gross=5000',
      '?np=1&year=2026&period=monthly&taxClass=1',
      '?np=1&year=2026&period=monthly&period=annual',
      '?np=1&year=2027&period=monthly',
      '?np=1&year=2026&period=quarterly',
      '?np=1&year=2026&period=monthly&state=DE-XX',
      '?np=2&year=2026&period=monthly',
    ]) {
      expect(readShareableSalarySettings(query).status).toBe('invalid')
    }
  })

  it('ignores unrelated pages with no version marker', () => {
    expect(readShareableSalarySettings('?utm_source=example')).toEqual({
      status: 'none',
    })
  })

  it('refuses non-http schemes and unsupported generated values', () => {
    expect(() =>
      createShareableSalaryUrl('javascript:alert(1)', {
        year: '2026',
        period: 'monthly',
      }),
    ).toThrow('HTTP(S)')
    expect(() =>
      createShareableSalaryUrl('https://example.com/', {
        year: '2026',
        period: 'monthly',
        federalState: 'DE-NONE',
      }),
    ).toThrow('Unsupported federal state')
  })
})
