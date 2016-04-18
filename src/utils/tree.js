import Immutable from 'immutable'

export function formatPath(path) {
  let newPath = []

  path.forEach((segment, index) => {
    newPath.push(segment)
    if ((index + 1) % 1 === 0) newPath.push('children')
  })

  return newPath.splice(1, newPath.length - 2)
}

export function traverseTree(root, callback, path = [], index = 0) {
  let response = callback(root, formatPath([...path, index]))
  if (response) return response

  let children = root.get('children')

  children.some((child, child_index) => {
    response = traverseTree(child, callback, [...path, index], child_index)
    if (response) return true
  })

  if (response) return response
}

export function getNodesBetweenNodes(nodeA, nodeB) {
}
