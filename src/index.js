import Immutable from 'immutable'
import Diff from 'immutablediff'
import Patch from 'immutablepatch'
import uuid from 'uuid'

import dateNow from './utils/date'

export const actionTypes = {
  TIME_SUBTRACT: '@@redux_immutable_undo_tree/TIME_SUBTRACT',
  TIME_ADD: '@@redux_immutable_undo_tree/TIME_ADD',
  TRAVERSE_BACKWARDS: '@@redux_immutable_undo_tree/TRAVERSE_BACKWARDS',
  TRAVERSE_FORWARD: '@@redux_immutable_undo_tree/TRAVERSE_FORWARD',
  CHECKOUT: '@@redux_immutable_undo_tree/CHECKOUT'
}

export const actionCreators = {
  timeSubtract(amount, unit) {
    return {
      type: actionTypes.TIME_SUBTRACT,
      payload: {
        amount,
        unit
      }
    }
  },

  timeAdd(amount, unit) {
    return {
      type: actionTypes.TIME_ADD,
      payload: {
        amount,
        unit
      }
    }
  },

  traverseBackwards(amount) {
    return {
      type: actionTypes.TRAVERSE_BACKWARDS,
      payload: {
        amount
      }
    }
  },

  traverseForward(amount) {
    return {
      type: actionTypes.TRAVERSE_FORWARD,
      payload: {
        amount
      }
    }
  },

  checkout(uuid) {
    return {
      type: actionTypes.CHECKOUT,
      payload: {
        uuid
      }
    }
  }
}

export function createChangeset(oldState, newState) {
  return Immutable.Map({
    uuid: uuid.v4(),
    diff: Diff(oldState, newState),
    timestamp: dateNow(),
    parentUUID: '',
    children: Immutable.OrderedSet()
  });
}

export function applyChangeset(state, changeset) {
  return Patch(state, changeset.get('diff'));
}

export function undoable(reducer, _config={}) {
  const config = {
    undoHeight: _config.undoHeight
  }

  return (state, action = {}) => {
    switch(action.type) {
      case undefined:
        return state
      case actionTypes.TIME_SUBTRACT:
        return state
      case actionTypes.TIME_ADD:
        return state
      case actionTypes.TRAVERSE_BACKWARDS:
        return state
      case actionTypes.TRAVERSE_BACKWARDS:
        return state
      case actionTypes.CHECKOUT:
        return state
      default:
        return reducer(state, action)
    }
  }
}
