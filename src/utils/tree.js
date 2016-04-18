import Immutable from 'immutable'

/*
 *
 * HOW TO TREE TRAVERSE.
 *  ¯\_(ツ)_/¯
 *
 *  what's the functional way
 *  breadth-first
 *
 *
 */

export function formatPath(path) {
  let newPath = []

  path.forEach((segment, index) => {
    newPath.push(segment)
    if ((index + 1) % 1 === 0) newPath.push('children')
  })

  return newPath.splice(1, newPath.length - 2)
}

export function traverseTree(root, callback, path=[], index=0) {
  let response = callback(root, formatPath([...path, index]))
  if (response) return response

  let children = root.get('children')

  children.forEach((child, child_index) => {
    traverseTree(child, callback, [...path, index], child_index)
  })
}

export function getNodesBetweenNodes(nodeA, nodeB) {
}
