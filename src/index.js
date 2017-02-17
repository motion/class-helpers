// @flow
import { CompositeDisposable } from 'sb-event-kit'
import { setTimeout, setInterval, addEvent } from './events'
import ref from './ref'

// export
export { CompositeDisposable } from 'sb-event-kit'
export { setTimeout, setInterval, addEvent } from './events'

export default {
  addEvent,
  setTimeout,
  setInterval,
  ref,
}
