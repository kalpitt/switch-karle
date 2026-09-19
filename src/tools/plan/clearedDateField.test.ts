import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import React from 'react'
import ReactDOMClient from 'react-dom/client'
import { Plan } from './index'
import GratuityTool from '../gratuity'
import FnfCheckerTool from '../fnf-checker'
import { LangProvider } from '../../i18n'

// Minimal DOM implementation to allow React 19 createRoot and event dispatch in Node
class DOMNode {
  nodeType: number
  nodeName: string
  tagName: string
  ownerDocument: any
  attributes: Record<string, string> = {}
  style: Record<string, string> = {}
  children: DOMNode[] = []
  childNodes: DOMNode[] = []
  parentNode: DOMNode | null = null
  listeners: Record<string, Function[]> = {}
  _value = ''

  constructor(nodeType: number, nodeName: string, ownerDocument: any) {
    this.nodeType = nodeType
    this.nodeName = nodeName
    this.tagName = nodeName
    this.ownerDocument = ownerDocument
  }

  get value() {
    return this._value
  }
  set value(v: any) {
    this._value = String(v)
  }

  get options() {
    return this.children.filter((c) => c.nodeName === 'OPTION')
  }
  selectedIndex = 0
  multiple = false

  addEventListener(type: string, fn: Function) {
    ;(this.listeners[type] ||= []).push(fn)
  }
  removeEventListener() {}
  dispatchEvent(_event: any) {
    return true
  }

  appendChild(child: DOMNode) {
    this.children.push(child)
    this.childNodes.push(child)
    child.parentNode = this
    return child
  }

  removeChild(child: DOMNode) {
    this.children = this.children.filter((c) => c !== child)
    this.childNodes = this.childNodes.filter((c) => c !== child)
    child.parentNode = null
    return child
  }

  insertBefore(newNode: DOMNode, refNode: DOMNode) {
    const idx = this.children.indexOf(refNode)
    if (idx === -1) return this.appendChild(newNode)
    this.children.splice(idx, 0, newNode)
    this.childNodes.splice(idx, 0, newNode)
    newNode.parentNode = this
    return newNode
  }

  setAttribute(name: string, value: any) {
    this.attributes[name] = String(value)
    ;(this as any)[name] = value
  }
  getAttribute(name: string) {
    return this.attributes[name] ?? null
  }
  removeAttribute(name: string) {
    delete this.attributes[name]
    delete (this as any)[name]
  }
}

class DOMDocument extends DOMNode {
  defaultView: any
  documentElement: DOMNode
  body: DOMNode
  activeElement: DOMNode

  constructor() {
    super(9, '#document', null)
    this.ownerDocument = this
    this.defaultView = globalThis
    this.documentElement = new DOMNode(1, 'HTML', this)
    this.body = new DOMNode(1, 'BODY', this)
    this.documentElement.appendChild(this.body)
    this.activeElement = this.body
  }

  createElement(tag: string) {
    return new DOMNode(1, tag.toUpperCase(), this)
  }
  createTextNode(text: any) {
    const node = new DOMNode(3, '#text', this)
    ;(node as any).nodeValue = String(text)
    ;(node as any).textContent = String(text)
    return node
  }
  createComment(text: any) {
    const node = new DOMNode(8, '#comment', this)
    ;(node as any).nodeValue = String(text)
    return node
  }
}

function findInputByLabelOrType(node: DOMNode, type: string): DOMNode | null {
  if (node.nodeName === 'INPUT' && (node.attributes.type === type || (node as any).type === type)) {
    return node
  }
  for (const child of node.children) {
    const found = findInputByLabelOrType(child, type)
    if (found) return found
  }
  return null
}

function findButtonByText(node: DOMNode, text: string): DOMNode | null {
  if (node.nodeName === 'BUTTON') {
    const reactPropsKey = Object.keys(node).find((k) => k.startsWith('__reactProps'))
    if (reactPropsKey) {
      const props = (node as any)[reactPropsKey]
      if (props?.children === text || (typeof props?.children === 'string' && props.children.includes(text))) {
        return node
      }
    }
  }
  for (const child of node.children) {
    const found = findButtonByText(child, text)
    if (found) return found
  }
  return null
}

describe('DateField on door screen one (Plan)', () => {
  let doc: DOMDocument
  let container: DOMNode
  let uncaughtError: Error | null = null

  beforeEach(() => {
    uncaughtError = null
    ;(globalThis as any).HTMLIFrameElement = class {}
    ;(globalThis as any).HTMLInputElement = DOMNode
    ;(globalThis as any).HTMLElement = DOMNode
    ;(globalThis as any).Element = DOMNode
    ;(globalThis as any).Node = DOMNode

    doc = new DOMDocument()
    ;(globalThis as any).document = doc
    ;(globalThis as any).window = globalThis
    ;(globalThis as any).window.document = doc
    ;(globalThis as any).window.addEventListener = () => {}
    ;(globalThis as any).window.removeEventListener = () => {}
    ;(globalThis as any).window.dispatchEvent = () => true

    // Memory storage mock
    const store = new Map<string, string>()
    ;(globalThis as any).localStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, String(v)),
      removeItem: (k: string) => store.delete(k),
      clear: () => store.clear(),
      length: 0,
      key: () => null,
    }

    container = doc.createElement('div')
  })

  afterEach(() => {
    delete (globalThis as any).localStorage
  })

  it('clearing join date input on the first screen does not crash the component', async () => {
    const root = ReactDOMClient.createRoot(container as any, {
      onUncaughtError(err: any) {
        uncaughtError = err
      },
    })

    root.render(
      React.createElement(
        LangProvider,
        null,
        React.createElement(Plan, null),
      ),
    )

    // Wait for initial mount
    await new Promise((resolve) => setTimeout(resolve, 50))

    const dateInput = findInputByLabelOrType(container, 'date')
    expect(dateInput).not.toBeNull()

    // Find React props on the rendered input element
    const reactPropsKey = Object.keys(dateInput!).find((k) => k.startsWith('__reactProps'))
    expect(reactPropsKey).toBeDefined()
    const props = (dateInput as any)[reactPropsKey!]
    expect(props.value).toBe('2022-01-12') // Default EXAMPLE joinDate

    // User clears the date field: browser produces an empty string ''
    props.onChange({ target: { value: '' } })

    // Wait for state update and re-render
    await new Promise((resolve) => setTimeout(resolve, 50))

    // The component should remain rendered without unhandled engine throw
    expect(uncaughtError).toBeNull()
  })

  it('clearing the join date leaves the "See my dates" button disabled, and filling a valid date enables it again', async () => {
    const root = ReactDOMClient.createRoot(container as any, {
      onUncaughtError(err: any) {
        uncaughtError = err
      },
    })

    root.render(
      React.createElement(
        LangProvider,
        null,
        React.createElement(Plan, null),
      ),
    )

    await new Promise((resolve) => setTimeout(resolve, 50))

    const dateInput = findInputByLabelOrType(container, 'date')
    expect(dateInput).not.toBeNull()

    const reactPropsKey = Object.keys(dateInput!).find((k) => k.startsWith('__reactProps'))
    const inputProps = (dateInput as any)[reactPropsKey!]
    expect(inputProps.value).toBe('2022-01-12')

    const button = findButtonByText(container, 'See my dates')
    expect(button).not.toBeNull()
    const buttonPropsKey = Object.keys(button!).find((k) => k.startsWith('__reactProps'))
    let buttonProps = (button as any)[buttonPropsKey!]
    expect(buttonProps.disabled).toBeFalsy()

    // User clears the date field: button becomes disabled
    inputProps.onChange({ target: { value: '' } })
    await new Promise((resolve) => setTimeout(resolve, 50))

    const disabledButton = findButtonByText(container, 'See my dates')
    buttonProps = (disabledButton as any)[buttonPropsKey!]
    expect(buttonProps.disabled).toBe(true)

    // User enters a valid date: button is re-enabled
    inputProps.onChange({ target: { value: '2023-05-15' } })
    await new Promise((resolve) => setTimeout(resolve, 50))

    const enabledButton = findButtonByText(container, 'See my dates')
    buttonProps = (enabledButton as any)[buttonPropsKey!]
    expect(buttonProps.disabled).toBe(false)
    expect(uncaughtError).toBeNull()
  })

  it('clearing notice input on the first screen does not crash the component and disables the next button', async () => {
    const root = ReactDOMClient.createRoot(container as any, {
      onUncaughtError(err: any) {
        uncaughtError = err
      },
    })

    root.render(
      React.createElement(
        LangProvider,
        null,
        React.createElement(Plan, null),
      ),
    )

    await new Promise((resolve) => setTimeout(resolve, 50))

    const noticeInput = findInputByLabelOrType(container, 'number')
    expect(noticeInput).not.toBeNull()

    const reactPropsKey = Object.keys(noticeInput!).find((k) => k.startsWith('__reactProps'))
    expect(reactPropsKey).toBeDefined()
    const props = (noticeInput as any)[reactPropsKey!]
    expect(props.value).toBe(90)

    props.onChange({ target: { value: '' } })

    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(uncaughtError).toBeNull()

    const button = findButtonByText(container, 'See my dates')
    expect(button).not.toBeNull()
    const buttonPropsKey = Object.keys(button!).find((k) => k.startsWith('__reactProps'))
    const buttonProps = (button as any)[buttonPropsKey!]
    expect(buttonProps.disabled).toBe(true)
  })

  it('gratuity renders without throwing when its date field is cleared', async () => {
    const root = ReactDOMClient.createRoot(container as any, {
      onUncaughtError(err: any) {
        uncaughtError = err
      },
    })

    root.render(
      React.createElement(GratuityTool, { lang: 'en' }),
    )

    await new Promise((resolve) => setTimeout(resolve, 50))

    const dateInput = findInputByLabelOrType(container, 'date')
    expect(dateInput).not.toBeNull()

    const reactPropsKey = Object.keys(dateInput!).find((k) => k.startsWith('__reactProps'))
    const inputProps = (dateInput as any)[reactPropsKey!]

    // User clears join date
    inputProps.onChange({ target: { value: '' } })
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(uncaughtError).toBeNull()
  })

  it('fnf-checker renders without throwing when its date field is cleared', async () => {
    const root = ReactDOMClient.createRoot(container as any, {
      onUncaughtError(err: any) {
        uncaughtError = err
      },
    })

    root.render(
      React.createElement(FnfCheckerTool, { lang: 'en' }),
    )

    await new Promise((resolve) => setTimeout(resolve, 50))

    const dateInput = findInputByLabelOrType(container, 'date')
    expect(dateInput).not.toBeNull()

    const reactPropsKey = Object.keys(dateInput!).find((k) => k.startsWith('__reactProps'))
    const inputProps = (dateInput as any)[reactPropsKey!]

    // User clears join date
    inputProps.onChange({ target: { value: '' } })
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(uncaughtError).toBeNull()
  })

})
