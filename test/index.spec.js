import Immutable from 'immutable'
import { expect } from 'chai'
import { undoable, actionCreators, createChangeset, applyChangeset } from '../src'
import { createStore, combineReducers } from 'redux'

const Actions = {
  DECREMENT: 'test/DECREMENT',
  INCREMENT: 'test/INCREMENT',
}

const ActionCreators = {
  decrement() { return {type: Actions.DECREMENT} },
  increment() { return {type: Actions.INCREMENT} }
}

const initialState = 0;
const counterReducer = (state = 0, action) => {
  switch(action.type) {
    case Actions.DECREMENT:
      return state - 1
    case Actions.INCREMENT:
      return state + 1
    default:
      return state
  }
}

const rootReducer = undoable(counterReducer)
const store = createStore(counterReducer, initialState)

describe('Simple counter reducer wrapped in undoable works', () => {
  it('expect initial state to be 0', () => {
    expect(store.getState()).to.equal(0)
  })

  it('expect initial state to be 3', () => {
    store.dispatch(ActionCreators.increment())
    store.dispatch(ActionCreators.increment())
    store.dispatch(ActionCreators.increment())
    expect(store.getState()).to.equal(3)
  })

  it('expect initial state to be 2', () => {
    store.dispatch(ActionCreators.decrement())
    expect(store.getState()).to.equal(2)
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
  })
})
