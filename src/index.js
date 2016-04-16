import Immutable from 'immutable'
import Diff from 'immutablediff'
import Patch from 'immutablepatch'
import uuid from 'uuid'

import { dateNow, isWithin } from './utils/date'

export const actionTypes = {
  TIME_SUBTRACT: '@@redux_immutable_undo_tree/TIME_SUBTRACT',
  TIME_ADD: '@@redux_immutable_undo_tree/TIME_ADD',
  TRAVERSE_BACKWARDS: '@@redux_immutable_undo_tree/TRAVERSE_BACKWARDS',
  TRAVERSE_FORWARD: '@@redux_immutable_undo_tree/TRAVERSE_FORWARD',
  CHECKOUT: '@@redux_immutable_undo_tree/CHECKOUT'
}

export const actionCreators = {
  // timeSubtract(2, 'hours')
  timeSubtract(amount, unit) {
    return { type: actionTypes.TIME_SUBTRACT, payload: {amount, unit} }
  },

  // timeAdd(2, 'hours')
  timeAdd(amount, unit) {
    return { type: actionTypes.TIME_ADD, payload: {amount, unit} }
  },

  // traverseBackwards(2)
  traverseBackwards(amount = 1) {
    return { type: actionTypes.TRAVERSE_BACKWARDS, payload: {amount} }
  },

  // traverseForwards(2)
  traverseForward(amount = 1) {
    return { type: actionTypes.TRAVERSE_FORWARD, payload: {amount} }
  },

  // checkout('0015f496-0466-4169-96df-06a94a985e76')
  checkout(uuid) {
    return { type: actionTypes.CHECKOUT, payload: {uuid} }
  }
}

export function createChangeset(oldState, newState) {
  return Immutable.Map({
    uuid: uuid.v4(),
    diff: Diff(oldState, newState),
    timestamp: dateNow(),
    parentUUID: '',
    children: Immutable.OrderedSet()
  })
}

export function applyChangeset(state, changeset) {
  return Patch(state, changeset.get('diff'))
}

export function changesetIsWithin(a, b, delta) {
  return isWithin(a.get('timestamp'), b.get('timestamp'), delta)
}

export function initializeTree(state) {
  return state.set('undo-tree', Immutable.Map())
}

export function undoable(reducer, _config = {}) {
  const config = {
    undoHeight: _config.undoHeight
  }

  return (state = Immutable.Map(), action = {}) => {
    if (state.isEmpty()) {
      state = initializeTree(state)
    }

    switch (action.type) {
      case undefined:
        return state
      case actionTypes.TIME_SUBTRACT:
        return state
      case actionTypes.TIME_ADD:
        return state
      case actionTypes.TRAVERSE_BACKWARDS:
        return state
      case actionTypes.TRAVERSE_FORWARD:
        return state
      case actionTypes.CHECKOUT:
        return state
      default:
        return reducer(state, action)
    }
  }
}
