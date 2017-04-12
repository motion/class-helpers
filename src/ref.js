import objectPath from 'object-path'
// import { action } from 'mobx'

// TODO make mobx-able
const action = (id, fn) => fn

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
export default function ref(path: CursorPath): Cursor {
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
