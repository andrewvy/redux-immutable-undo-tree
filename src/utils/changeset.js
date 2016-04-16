import Immutable from 'immutable'
import Diff from 'immutablediff'
import Patch from 'immutablepatch'
import uuid from 'uuid'

import { dateNow, isWithin } from './date'

export function createChangeset(oldState, newState) {
  return Immutable.Map({
    uuid: uuid.v4(),
    diff: Diff(oldState, newState),
    timestamp: dateNow(),
    children: Immutable.List()
  })
}

export function createEmptyChangeset() {
  return Immutable.Map({
    uuid: uuid.v4(),
    diff: Immutable.List(),
    timestamp: dateNow(),
    children: Immutable.List()
  })
}

export function applyChangeset(state, changeset) {
  return Patch(state, changeset.get('diff'))
}

export function changesetIsWithin(a, b, delta) {
  return isWithin(a.get('timestamp'), b.get('timestamp'), delta)
}
