// @flow
import event from 'disposable-event'
import objectPath from 'object-path'
import { action } from 'mobx'
import { CompositeDisposable } from 'sb-event-kit'

// export
export { CompositeDisposable } from 'sb-event-kit'

export function createCompositeDisposable(): CompositeDisposable {
  return new CompositeDisposable()
}

export function addEvent(element: HTMLElement, cb: Function, bind: boolean): Function {
  const e = event(element, cb, bind)
  this.subscriptions.add(e)
  return e
}

const originalSetTimeout = typeof window !== 'undefined' ? window.setTimeout : global.setTimeout
const originalSetInterval = typeof window !== 'undefined' ? window.setInterval : global.setInterval

export function setTimeout(givenCallback: Function, duration: number): number {
  let subscription

  const callback = () => {
    if (subscription) subscription.dispose()
    givenCallback.call(this)
  }

  const timeoutId = originalSetTimeout(callback, duration)

  subscription = this.subscriptions.add(() => {
    clearTimeout(timeoutId)
  })

  return timeoutId
}

export function setInterval(givenCallback: Function, duration: number): number {
  const intervalId = originalSetInterval(givenCallback, duration)
  this.subscriptions.add(() => {
    clearInterval(intervalId)
  })
  return intervalId
}

export type CursorPath = String | Array<string>
export type Cursor = {
  get: Function,
  set: Function,
  toggle: Function,
  clear: Function,
}

function firstSegment(path: CursorPath): string {
  if (Array.isArray(path)) {
    return path[0]
  }
  return path.split('.')[0]
}

// like a cursor
// give it a reference to an object path
// it gives you helpers for get/set/...
// also works nicely with mobx
export function ref(path: CursorPath): Cursor {
  const key = firstSegment(path)

  const get = () => {
    this[key] // trigger mobx watch
    return objectPath.get(this, path)
  }

  const set = action(`ref.set ${path.toString()}`, value => {
    objectPath.set(this, path, value)
    const val = this[key]

    // fix mobx not updating
    if (val && val.constructor === Object) {
      this[key] = Object.assign({}, val)
    }
    else if (val && val.constructor === Array) {
      this[key] = [].concat(val)
    }
    else {
      this[key] = val
    }
  })

  const toggle = () => set(!get())
  const clear = () => set(null)

  return { get, set, toggle, clear }
}

const helpers = {
  createCompositeDisposable,
  addEvent,
  setTimeout,
  setInterval,
  ref,
}

export function inherit(klass: Object, ...names: Array<string>): void {
  if (!names.length) {
    // DEFAULT helpers to inherit
    names = ['addEvent', 'setTimeout', 'setInterval', 'ref']
  }

  const methods = Object.keys(helpers)
    .filter(k => names.indexOf(k) > -1)
    .reduce((o, key) => ({ ...o, [key]: helpers[key] }), {})

  Object.assign(klass.prototype, methods)
}

export interface HelpfulClass {
  createCompositeDisposable: (() => CompositeDisposable);
  addEvent: Function;
  setTimeout: Function;
  setInterval: Function;
  ref: (() => Cursor);
}

export default helpers

export const addSubscriptions = Klass => class Subscribable extends Klass {
  constructor(...args) {
    super(...args)
    this.subscriptions = new CompositeDisposable()
  }
  componentWillUnmount() {
    super.componentWillUnmount && super.componentWillUnmount()
    this.subscriptions.dispose()
  }
}

export const addHelpers = Klass => {
  const Result = addSubscriptions(Klass)
  inherit(Result, 'addEvent', 'setTimeout', 'setInterval', 'ref')
  return Result
}
