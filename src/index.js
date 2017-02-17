// @flow
import { CompositeDisposable } from 'sb-event-kit'
import { setTimeout, setInterval, addEvent } from './events'
import ref from './ref'

// export
export { CompositeDisposable } from 'sb-event-kit'
export { setTimeout, setInterval, addEvent } from './events'

const helpers = {
  addEvent,
  setTimeout,
  setInterval,
  ref,
}

export default helpers

export interface HelpfulClass {
  addEvent: Function;
  setTimeout: Function;
  setInterval: Function;
  ref: (() => Cursor);
}

// extend a class with given names
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

// mixin
export const addHelpers = (which) => Klass => {
  const helpers = which || ['addEvent', 'setTimeout', 'setInterval', 'ref']
  inherit(Klass, ...helpers)
  return Klass
}
