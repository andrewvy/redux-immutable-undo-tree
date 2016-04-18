# redux-immutable-undo-tree

[![Codeship Build Status](https://codeship.com/projects/c52faeb0-e5a0-0133-e4c3-0e12c0a498c1/status?branch=master)](https://codeship.com/projects/146662)

_Powerful undo tree with Immutable.js data structures modeled after VIM's undo tree,
powered by diff/patch changesets._

### Work in progress!!!

Uses:
- [immutablediff](https://github.com/intelie/immutable-js-diff) (to create patches for Immutable.js structures)
- [immutablepatch](https://github.com/intelie/immutable-js-patch) (to apply patches to Immutable.js structures


### Sounds cool, show me how it works:

```

  Under the hood, the whole undo tree is stored as an Immutable.js tree. Just like VIM,
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

```

### Example

```javascript
import { undoable, actionCreators } from 'redux-immutable-undo-tree'
import { createStore, compose, combineReducers, applyMiddleware } from 'redux'

const initialState = {};
const identityReducer = (a) => a;
const rootReducer = combineReducers({
  data: undoable(identityReducer)
})

const store = createStore(
  rootReducer,
  initialState
)

// Go back in time 2 hours ago
store.dispatch(actionCreators.timeSubtract(2, 'hours'))

// Go forwards in time 2 hours
store.dispatch(actionCreators.timeAdd(2, 'hours'))
```
