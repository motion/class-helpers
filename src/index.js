export { CompositeDisposable } from 'sb-event-kit'
export { setTimeout, setInterval, addEvent } from './events'
export ref from './ref'

export function isClass(Thing: Class) {
  function fnBody(fn) {
    return toString.call(fn).replace(/^[^{]*{\s*/,'').replace(/\s*}[^}]*$/,'');
  }
  return typeof fn === 'function' && (
    /^class\s/.test(toString.call(Thing)) ||
    /^.*classCallCheck\(/.test(fnBody(Thing))
  )
}
