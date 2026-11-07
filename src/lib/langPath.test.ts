import { describe, expect, it } from 'vitest'
import { englishPath, hindiPath, isHiPath, slugFromPath } from './langPath'

const base = '/switch-karle/'

describe('langPath', () => {
  it('reads the page slug from either language', () => {
    expect(slugFromPath('/switch-karle/', base)).toBe('')
    expect(slugFromPath('/switch-karle/hi/', base)).toBe('')
    expect(slugFromPath('/switch-karle/expected-ctc/', base)).toBe('expected-ctc')
    expect(slugFromPath('/switch-karle/hi/expected-ctc/', base)).toBe('expected-ctc')
    expect(slugFromPath('/hi/manager-script/', '/')).toBe('manager-script')
    expect(slugFromPath('/what-to-say', '/')).toBe('what-to-say')
  })

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
