/*
  Undo tree with ImmutableJS data structures with diff and patch storage for smart operations.

   Uses:
   - immutablediff (creates patches for immutablejs structures)
   - immutablepatch (to apply patches created by immutablediff)

  OKAY, sounds cool, show me how it works:

  Under the hood, the whole undo tree is stored as an immutablejs tree. Just like VIM,
  we store changes in series in a 'branch'. We track these changes by wrapping your
  reducer in our own state-tracking function. You can apply certain undo tree traversals
  via our action creators.

    │    ┌┐                                     ┌┐
    │    └┤                                     └┤───┐   │
    │    ┌┤                                     ┌┤  ┌┤   │
    │    └┤                                  ┌──└┤  └│   │
    │    ┌┤                                 ┌┤  ┌┤  ┌┤   │
    │    └┤                                 └▼  └┤  └┤   │
         ┌┤       At any point in time,     ┌┤  ┌┤  ┌┤   │
  time   └┤         we can jump to an       └┤  └┤  └▼
         ┌┤           earlier state.        ┌┤  ┌┤     time
    │    └┤                                 └┤  └┤
    │    ┌┤                                 ┌┤  ┌┤       │
    │    └┤                                 └┤  └┤       │
    │    ┌┤                                 ┌┤  ┌┤       │
    │    └┤                                 └┤  └┤       │
    │    ┌┤                                 ┌┤  ┌┤       │
    ▼    └▼                                 └▼  └▼       │
                                                         ▼


  How do I use it?
  - Wrap your reducer that manages the state tree that you wish to
    have undo functionality for.
  - Apply the undo-tree middleware.
  - Profit! Use built-in action creators for tree traversal.

*/

import Immutable from 'immutable'
import { undoable, undoTreeMiddleware, actionCreators } from 'redux-immutable-undo-tree'
import { createStore, compose, combineReducers, applyMiddleware } from 'redux'

const initialState = {};
const identityReducer = (a) => a;
const rootReducer = combineReducers({
  data: undoable(identityReducer)
})

const store = createStore(
  rootReducer,
  initialState,
  applyMiddleware(undoTreeMiddleware)
)

// Go back in time 2 hours ago
store.dispatch(actionCreators.TIME_SUBTRACT(2, 'hours'))

// Go forwards in time 2 hours
store.dispatch(actionCreators.TIME_ADD(2, 'hours'))
