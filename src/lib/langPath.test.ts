import { describe, expect, it } from 'vitest'
import { englishPath, hindiPath, isHiPath } from './langPath'

const base = '/switch-karle/'

describe('langPath', () => {
  it('detects Hindi twins', () => {
    expect(isHiPath('/switch-karle/hi/', base)).toBe(true)
    expect(isHiPath('/switch-karle/hi/decoder/', base)).toBe(true)
    expect(isHiPath('/switch-karle/decoder/', base)).toBe(false)
    expect(isHiPath('/switch-karle/', base)).toBe(false)
  })

  it('round-trips home and a tool slug', () => {
    expect(englishPath('/switch-karle/hi/', base)).toBe('/switch-karle/')
    expect(hindiPath('/switch-karle/', base)).toBe('/switch-karle/hi/')
    expect(englishPath('/switch-karle/hi/decoder/', base)).toBe('/switch-karle/decoder/')
    expect(hindiPath('/switch-karle/decoder/', base)).toBe('/switch-karle/hi/decoder/')
    expect(hindiPath('/switch-karle/hi/decoder/', base)).toBe('/switch-karle/hi/decoder/')
  })
})
