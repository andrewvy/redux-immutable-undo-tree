import Immutable from 'immutable'

export function visitChildren(root, func) {
  let q = [root]
  let path = []
  let currentIndex = 0
  let childCount = 0
  let mutReturn = root

  while (q.length > 0) {
    root = q.shift()

    if (func) {
      mutReturn = func(root, path.concat([currentIndex]))

      if (mutReturn) break;
    }

    if (currentIndex === childCount) {
      currentIndex = childCount = 0
    }

    currentIndex++

    if (root.get('children').count() > 0) {
      currentIndex = 0
      childCount += root.get('children').count()
      path.push('children')

      root.get('children').forEach((child) => {
        q.push(child)
      })
    }
  }

  return mutReturn
}

export function getNodesBetweenNodes(nodeA, nodeB) {
  let q = [nodeA]
  let nodes = []

  while (q.length > 0) {
    let root = q.shift()
    console.log(root)

    if (Immutable.is(root, nodeB)) return nodes

    if (root.get('children').count() > 0) {
      root.get('children').forEach((child) => {
        q.push(child)
        nodes.push(child)
      })
    }
  }

  return null
}
