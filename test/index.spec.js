import Immutable from 'immutable'
import { expect } from 'chai'
import { undoable, actionCreators, createChangeset, applyChangeset, changesetIsWithin } from '../src'
import { normalizeDate, isWithin } from '../src/utils/date'
import { createStore, combineReducers } from 'redux'

const Actions = {
  DECREMENT: 'test/DECREMENT',
  INCREMENT: 'test/INCREMENT',
}

const ActionCreators = {
  decrement() { return {type: Actions.DECREMENT} },
  increment() { return {type: Actions.INCREMENT} }
}

const initialState = Immutable.Map({ counter: 0 });
const counterReducer = (state = Immutable.Map(), action) => {
  switch(action.type) {
    case Actions.DECREMENT:
      return state.set('counter', state.get('counter') - 1)
    case Actions.INCREMENT:
      return state.set('counter', state.get('counter') + 1)
    default:
      return state
  }
}

const rootReducer = undoable(counterReducer)
const store = createStore(counterReducer, initialState)

describe('Simple counter reducer wrapped in undoable works', () => {
  it('expect initial state to be 0', () => {
    expect(store.getState().get('counter')).to.equal(0)
  })

  it('expect initial state to be 3', () => {
    store.dispatch(ActionCreators.increment())
    store.dispatch(ActionCreators.increment())
    store.dispatch(ActionCreators.increment())
    expect(store.getState().get('counter')).to.equal(3)
  })

  it('expect initial state to be 2', () => {
    store.dispatch(ActionCreators.decrement())
    expect(store.getState().get('counter')).to.equal(2)
  })
})

describe('Changesets', () => {
  const A = Immutable.Map({})
  const B = Immutable.Map({a: 'Hello'})

  it('Can create and apply changeset', () => {
    const changeset = createChangeset(A, B)
    const state = Immutable.Map({})
    const newState = applyChangeset(state, changeset)

    expect(newState.get('a')).to.equal('Hello')
    expect(Immutable.is(newState, B))
  })

  it('Can determine which changeset came before', () => {
    const A = Immutable.Map({})
    const B = Immutable.Map({a: 'Hello'})
    const C = Immutable.Map({a: 'Hello', b: 'World!'})
    const D = Immutable.Map({a: 'Hello', b: 'Redux!'})

    // Initial Changesets
    const changeset_1 = createChangeset(A, B)
    const changeset_2 = createChangeset(B, C)

    // 2 hours in the future
    const timeDelta = normalizeDate(2, 'hours')
    expect(changesetIsWithin(changeset_1, changeset_2, timeDelta)).to.equal(true)

    // 2 hours in the past
    const timeDelta2 = -normalizeDate(2, 'hours')
    expect(changesetIsWithin(changeset_2, changeset_1, timeDelta2)).to.equal(true)

    // New changeset a little over one second forward from the rest
    const changeset_3 = createChangeset(C, D).set('timestamp', changeset_2.get('timestamp') + 1100)

    // 1 second ago
    const timeDelta3 = -normalizeDate(1, 'seconds')

    // New changeset is now no longer within either 1 or 2's time scope of 1 second.
    expect(changesetIsWithin(changeset_1, changeset_3, timeDelta3)).to.equal(false)
    expect(changesetIsWithin(changeset_2, changeset_3, timeDelta3)).to.equal(false)
  })
})
