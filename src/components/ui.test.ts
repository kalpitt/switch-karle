import { describe, expect, it, vi } from 'vitest'
import { NoticeMonthsNudge, NumberField } from './ui'

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

describe('NoticeMonthsNudge', () => {
  const t = (key: string, vars?: Record<string, string | number>) =>
    vars ? `${key}(${JSON.stringify(vars)})` : key

  it('renders nothing when the value does not look like months', () => {
    const onUse = vi.fn()
    expect(NoticeMonthsNudge({ value: 90, t, onUse })).toBeNull()
    expect(NoticeMonthsNudge({ value: 13, t, onUse })).toBeNull()
  })

  it('renders the nudge with 30x days when the value looks like months, and onUse fires with the day count', () => {
    const onUse = vi.fn()
    const vnode = NoticeMonthsNudge({ value: 3, t, onUse })
    expect(vnode).not.toBeNull()
    const message = vnode!.props.children[0]
    expect(message).toContain('ui.noticeMonthsNudge')
    expect(message).toContain('"n":3')
    expect(message).toContain('"days":90')

    // The button is the last child of the <p>; find it and click it.
    const button = vnode!.props.children[2]
    expect(button.props.children).toContain('ui.noticeMonthsUse')
    button.props.onClick()
    expect(onUse).toHaveBeenCalledWith(90)
  })
})
