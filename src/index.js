import Immutable from 'immutable'

import { normalizeDate } from './utils/date'
import { traverseTree } from './utils/tree'
import { createChangeset, createEmptyChangeset, applyChangeset, applyInverseChangeset, changesetIsWithin } from './utils/changeset'

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

function initializeTree(state) {
  let changeset = createEmptyChangeset()

  return state.set('undo-tree', Immutable.Map({
    root: changeset,
    currentUUID: changeset.get('uuid')
  }))
}

function checkIfEndNodeMatches(uuid, children) {
  return children.last().get('uuid') === uuid
}

function insert(state, newChangeset) {
  /* At the moment, this is only adding to the main root tree.
   * We need to check which branch the current changeset is in
   * and whether or not the changeset is the last child changeset.
   * If current changeset is the last child, add new changeset
   * to the end of the children branch.
   *
   * Else, we should add the newChangeset as a child to the
   * currentChangeset, creating a new branch.
   */

  let oldCurrentUUID = state.getIn(['undo-tree', 'currentUUID'])

  return state.setIn(['undo-tree', 'currentUUID'], newChangeset.get('uuid'))
    .updateIn(['undo-tree', 'root'], (root) => {
      return root.withMutations((mutableRoot) => {
        if ((root.get('children').count() === 0 && oldCurrentUUID === root.get('uuid')) ||
            (root.get('children').last().get('uuid') === oldCurrentUUID)) {
          return mutableRoot.update('children', (children) => children.push(newChangeset))
        }

        return traverseTree(mutableRoot, (child, path) => {
          if (child.get('uuid') === oldCurrentUUID) {
            if (path !== []) {
              return mutableRoot.updateIn(path, (c1) => {
                c1.update('children', (c) => c.push(newChangeset))
              })
            }
          }
        })
      })
    })
}

/* Expands the paths from
 *
 * [0,1,4] -----> ['children', 0, 'children', 1, 'children', 4]
 *
 * which lets us use it as a selector in our tree.
 */

export function expandTreePath(root, path) {
  let newPath = []
  let nodes = [root]

  if (path.length === 0) {
    return root.get('children').map((child) => child)
  }

  path.forEach((segment) => {
    if (segment === 'children') return newPath.push(segment)
    for (let i = 0; i <= segment; i++) {
      nodes.push(root.getIn([...newPath, i]))
    }
  })

  return nodes
}

/* pathA is the shorter path
 * pathB is the longer path
 * return the subset of paths between pathA and pathB
 * ['children', 0, 'children', 1] - ['children', 0] = ['children', 1]
 */

export function diffTreePath(pathA, pathB) {
  return pathB.slice(pathA.length)
}

export function timeTravel(state, time) {
  const currentUUID = state.getIn(['undo-tree', 'currentUUID'])
  const root = state.getIn(['undo-tree', 'root'])

  // The current node that we're located at.
  const current = root.get('uuid') === currentUUID ? [root, []] : traverseTree(root, (child, path) => {
    if (child.get('uuid') === currentUUID) return [child, path]
  })

  if (!current) return state
  const [currentNode, currentNodePath] = current

  // The destination node that we want to travel to.
  const destination = traverseTree(root, (child, path) => {
    if (changesetIsWithin(currentNode, child, time)) return [child, path]
  })

  if (!destination) return state
  const [destinationNode, destinationNodePath] = destination

  let relativeRootNode = null
  let relativePath = null
  let newState = state
  let nodes = []

  /* If we are traversing up from the tree, closer to the root.
   * Apply the inverse patches in reverse order.
   *
   * ┌┐
   * └┤◀─────┐
   * ┌┤      │
   * └┼───┐  │
   * ┌┤  ┌│  │      traversing up the tree
   * └┤  └┤  │     requires applying inverse
   * ┌┤  ┌┤  │     patches in reverse order.
   * └┤  └┤  │
   * ┌┤  ┌┤  │
   * └▼  └┤  │
   *     ┌┤  │
   *     └┤  │
   *     ┌┤  │
   *     └▼──┘
   *
   * ┌┐
   * └┤──────┐
   * ┌┤      │
   * └┼───┐  │
   * ┌┤  ┌│  │
   * └┤  └┤  │     while traversing down the
   * ┌┤  ┌┤  │        tree, we can apply
   * └┤  └┤  │       changesets normally.
   * ┌┤  ┌┤  │
   * └▼  └┤  │
   *     ┌┤  │
   *     └┤  │
   *     ┌┤  │
   *     └▼◀─┘
   *
   * Otherwise, we're traversing down into the tree, and we'll
   * want to apply the patches normally.
   */

  if (currentNodePath.length > destinationNodePath) {
    relativeRootNode = destinationNode
    relativePath = diffTreePath(destinationNodePath, currentNodePath)
    nodes = expandTreePath(relativeRootNode, relativePath)
    nodes.reverse().forEach((node) => {
      newState = applyInverseChangeset(newState, node)
    })
  } else {
    relativeRootNode = currentNode
    relativePath = diffTreePath(currentNodePath, destinationNodePath)
    nodes = expandTreePath(relativeRootNode, relativePath)
    nodes.forEach((node) => {
      newState = applyChangeset(newState, node)
    })
  }

  // Update the currentUUID with the node that we just traveled to.
  return newState.setIn(['undo-tree', 'currentUUID'], destinationNode.get('uuid'))
}

export function undoable(reducer, _config = {}) {
  const config = {
    undoHeight: _config.undoHeight,
    initialized: false
  }

  return (state = Immutable.Map(), action = {}) => {
    if (!config.initialized) {
      state = initializeTree(state)
      config.initialized = true
    }

    switch (action.type) {
      case undefined:
        return state
      case actionTypes.TIME_SUBTRACT:
        let timeSubtract = -normalizeDate(action.payload.amount, action.payload.unit)
        return timeTravel(state, timeSubtract)
      case actionTypes.TIME_ADD:
        let timeAdd = normalizeDate(action.payload.amount, action.payload.unit)
        return timeTravel(state, timeAdd)
      case actionTypes.TRAVERSE_BACKWARDS:
        return state
      case actionTypes.TRAVERSE_FORWARD:
        return state
      case actionTypes.CHECKOUT:
        return state
      default:
        const newState = reducer(state, action)
        const changeset = createChangeset(state, newState)
        const newStateWithUpdatedTree = insert(newState, changeset)

        return newStateWithUpdatedTree
    }
  }
}
