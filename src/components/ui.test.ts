import { describe, expect, it, vi } from 'vitest'
import { NumberField } from './ui'

function getRenderedInput(vnode: any) {
  // NumberField returns <label><Label ... /><span ...><input ... />...</span></label>
  return vnode.props.children[1].props.children[0]
}

describe('NumberField', () => {
  it('defaults to previous behaviour when allowBlank is not passed: blank becomes min and non-finite renders 0', () => {
    const onChange = vi.fn()
    const vnode = NumberField({
      label: 'Notice',
      value: NaN,
      min: 1,
      onChange,
    })
    const input = getRenderedInput(vnode)
    expect(input.props.value).toBe(0)

    input.props.onChange({ target: { value: '' } })
    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('opts into blank when allowBlank is true: blank calls onChange(NaN) and non-finite renders empty string', () => {
    const onChange = vi.fn()
    const vnode = NumberField({
      label: 'Notice',
      value: NaN,
      min: 1,
      allowBlank: true,
      onChange,
    })
    const input = getRenderedInput(vnode)
    expect(input.props.value).toBe('')

    input.props.onChange({ target: { value: '' } })
    expect(onChange).toHaveBeenCalledWith(NaN)
  })

  it('with allowBlank, renders finite number and clamps non-empty input to min', () => {
    const onChange = vi.fn()
    const vnode = NumberField({
      label: 'Notice',
      value: 90,
      min: 1,
      allowBlank: true,
      onChange,
    })
    const input = getRenderedInput(vnode)
    expect(input.props.value).toBe(90)

    input.props.onChange({ target: { value: '60' } })
    expect(onChange).toHaveBeenCalledWith(60)

    input.props.onChange({ target: { value: '0' } })
    expect(onChange).toHaveBeenCalledWith(1)
  })
})
