import Immutable from 'immutable'
import { expect } from 'chai'
import { undoable, timeTravel, actionCreators } from '../src'
import { normalizeDate, isWithin } from '../src/utils/date'
import { traverseTree, getNodesBetweenNodes } from '../src/utils/tree'
import { createChangeset, createEmptyChangeset, applyChangeset, changesetIsWithin } from '../src/utils/changeset'

import { createStore, combineReducers } from 'redux'

const Actions = {
  DECREMENT: 'test/DECREMENT',
  INCREMENT: 'test/INCREMENT'
}

const ActionCreators = {
  decrement() { return {type: Actions.DECREMENT} },
  increment() { return {type: Actions.INCREMENT} }
}

const initialState = Immutable.Map({ counter: 0 })
const counterReducer = (state = Immutable.Map(), action) => {
  switch (action.type) {
    case Actions.DECREMENT:
      return state.set('counter', state.get('counter') - 1)
    case Actions.INCREMENT:
      return state.set('counter', state.get('counter') + 1)
    default:
      return state
  }
}

const rootReducer = undoable(counterReducer)
const store = createStore(rootReducer, initialState)

describe('Simple counter reducer wrapped in undoable stores in main undo branch', () => {
  let finalCount

  it('expect initial state to be 0', () => {
    expect(store.getState().get('counter')).to.equal(0)
  })

  it('expect state to be 3', () => {
    store.dispatch(ActionCreators.increment())
    store.dispatch(ActionCreators.increment())
    store.dispatch(ActionCreators.increment())
    expect(store.getState().get('counter')).to.equal(3)
  })

  it('expect state to be 2', () => {
    finalCount = store.dispatch(ActionCreators.decrement())
    expect(store.getState().get('counter')).to.equal(2)
  })

  it('expect following changeset history == follows timeline', () => {
    const followerState = store.getState()
      .getIn(['undo-tree', 'root', 'children'])
      .reduce((state = Immutable.Map(), changeset) => {
        return applyChangeset(state, changeset)
      })

    expect(followerState.get('counter')).to.equal(2)
  })

  it('Can travel back in time', () => {
    store.dispatch(actionCreators.timeSubtract(5, 'seconds'))
    expect(store.getState().get('counter')).to.equal(0)
  })
})

describe('Changesets', () => {
  const A = Immutable.Map({})
  const B = Immutable.Map({a: 'Hello'})
  const C = Immutable.Map({a: 'Hello', b: 'World!'})
  const D = Immutable.Map({a: 'Hello', b: 'Redux!'})

  it('Can create and apply changeset', () => {
    const changeset = createChangeset(A, B)
    const state = Immutable.Map({})
    const newState = applyChangeset(state, changeset)

    expect(newState.get('a')).to.equal('Hello')
    expect(Immutable.is(newState, B))
  })

  it('Can determine which changeset came before', () => {
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

describe('utils/date.js', () => {
  const A = 5
  const B = 7

  expect(isWithin(A, B, 1)).to.equal(false)
  expect(isWithin(A, B, 2)).to.equal(true)
  expect(isWithin(B, A, 2)).to.equal(false)
  expect(isWithin(B, A, -2)).to.equal(true)
})

describe('utils/tree.js', () => {
  const tree = Immutable.fromJS({
    id: 0,
    children: [
      {
        id: 1,
        children: [
          {
            id: 2,
            children: [
            ]
          },
          {
            id: 3,
            children: [
              {
                id: 4,
                children: [
                ]
              }
            ]
          }
        ]
      },
      {
        id: 5,
        children: [
          {
            id: 6,
            children: []
          }
        ]
      }
    ]
  })

  const paths = [
    [],
    ['children', 0],
    ['children', 0, 'children', 0],
    ['children', 0, 'children', 1],
    ['children', 0, 'children', 1, 'children', 0],
    ['children', 1],
    ['children', 1, 'children', 0]
  ]

  let index = 0

  traverseTree(tree, (root, path) => {
    expect(path).to.eql(paths[index++])
  })
})
