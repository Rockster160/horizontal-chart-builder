let moves = []

class Move {
  constructor(name) {
    this.name = name;
    this.parents = [];
    this.children = [];
    moves.push(this)
  }

  addParent(parentName) {
    let parentNode = Move.findOrCreate(parentName);
    if (!this.parents.includes(parentNode) && this != parentNode) {
      this.parents.push(parentNode);
      parentNode.addChild(this.name);
    }
    return parentNode
  }

  addChild(childName) {
    let childNode = Move.findOrCreate(childName);
    if (!this.children.includes(childNode) && this != childNode) {
      this.children.push(childNode);
      childNode.addParent(this.name);
    }
    return childNode
  }

  removeParent(parentName) {
    let parentNode = Move.find(parentName)
    const parentIndex = this.parents.indexOf(parentNode);
    if (parentIndex !== -1) {
      this.parents.splice(parentIndex, 1);
      parentNode.removeChild(this.name);
    }
  }

  removeChild(childName) {
    let childNode = Move.find(childName)
    const childIndex = this.children.indexOf(childNode);
    if (childIndex !== -1) {
      this.children.splice(childIndex, 1);
      childNode.removeParent(this.name);
    }
  }

  static find(name) {
    return moves.find(node => node.name.toLowerCase() === name.toLowerCase());
  }

  static findOrCreate(name) {
    return Move.find(name) || (new Move(name))
  }

  static remove(name) {
    let move = Move.find(name)
    move.parents.forEach(parent => parent.removeChild(move.name));
    move.children.forEach(child => child.removeParent(move.name));
    moves = moves.filter(node => node != move)
  }

  static import(jsonData) {
    const importedNodes = Array.isArray(jsonData) ? jsonData : JSON.parse(jsonData);

    importedNodes.forEach(nodeData => {
      // Create nodes and store them in the map
      const node = Move.findOrCreate(nodeData.name)

      // Establish parent-child relationships
      nodeData.parents.forEach(parentName => {
        node.addParent(parentName);
      });

      nodeData.children.forEach(childName => {
        node.addChild(childName);
      });
    });

    console.log(`Successfully imported ${moves.length} moves!`);
    return moves
  }

  static export() {
    const nodesJSON = moves.map(node => {
      const parents = node.parents.map(parent => parent.name);
      const children = node.children.map(child => child.name);

      return {
        name: node.name,
        parents: parents,
        children: children
      };
    });

    return JSON.stringify(nodesJSON, null, 2); // Indent for readability
  }
}

// const trick = new Move("Trick");
// const childNode1 = trick.addChild("Child Move 1");
// const parentNode1 = trick.addParent("Parent Move 1");
// const childNode2 = trick.addChild("Child Move 2");
// const parentNode2 = trick.addParent("Parent Move 2");
// const grandparentNode = parentNode2.addParent("Parent2 Parent");
// const grandchildNode = childNode2.addChild("Child2 Child");
// console.log(Move.export());
