import Immutable from 'immutable'
import Diff from 'immutablediff'
import Patch from 'immutablepatch'
import uuid from 'uuid'

import { dateNow, isWithin } from './date'

export function createChangeset(oldState, newState) {
  return Immutable.Map({
    uuid: uuid.v4(),
    diff: Diff(oldState, newState),
    inverseDiff: Diff(newState, oldState),
    timestamp: dateNow(),
    children: Immutable.List()
  })
}

export function createEmptyChangeset() {
  return Immutable.Map({
    uuid: uuid.v4(),
    diff: Immutable.List(),
    inverseDiff: Immutable.List(),
    timestamp: dateNow(),
    children: Immutable.List()
  })
}

export function applyChangeset(state, changeset) {
  return Patch(state, changeset.get('diff'))
}

export function applyInverseChangeset(state, changeset) {
  return Patch(state, changeset.get('inverseDiff'))
}

export function changesetIsWithin(a, b, delta) {
  return isWithin(a.get('timestamp'), b.get('timestamp'), delta)
}
