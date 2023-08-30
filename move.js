let moves = []

class Move {
  constructor(name) {
    this.name = name;
    this.difficulty = undefined;
    this.category = undefined;
    this.aliases = "";

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

  static search(query) {
    // TODO: Add Aliases
    if (!query || query.trim().length <= 0) { return moves }
    query = query.toLowerCase().trim()
    var results = {}
    var found = []

    moves.forEach(function(option) {
      var word = option.name
      var compare = word.toLowerCase().trim()
      var score = 0

      if (compare == query) { score += 1000000 }
      if (compare.indexOf(query) == 0) { score += 100000 }
      if (compare.indexOf(query) >= 0) { score += 10000 }

      var last_idx = -1
      var word_length = word.length
      var bad_word = false
      query.split("").forEach(function(letter) {
        if (bad_word) { return }
        var at = compare.indexOf(letter)
        if (at == -1) {
          bad_word = true
          score = 0
          return
        }

        score += word_length - at
        if (at >= last_idx) { score += word_length - at }
        compare = compare.replace(letter, "")
      })

      if (score > 0) {
        found.push(option)
        results[word] = score
      }
    })

    return found.sort(function(a, b) {
      var aOrder = results[a.name]
      var bOrder = results[b.name]

      if (aOrder < bOrder) {
        return 1
      } else if (aOrder > bOrder) {
        return -1
      } else { // equal
        return 0
      }
    })
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
      const {name, parents, children, ...rest} = nodeData
      // Create nodes and store them in the map
      const node = Move.findOrCreate(name)
      Object.assign(node, rest)

      // Establish parent-child relationships
      parents?.forEach(parentName => {
        node.addParent(parentName);
      });

      children?.forEach(childName => {
        node.addChild(childName);
      });
    });

    console.log(`Successfully imported ${moves.length} moves!`);
    return moves
  }

  static export() {
    const nodesJSON = moves.map(node => {
      const {parents, children, ...rest} = node
      const parentNames = parents.map(parent => parent.name);
      const childrenNames = children.map(child => child.name);

      let nodeData = {...rest, parents: parentNames, children: childrenNames}
      for (const [key, value] of Object.entries(nodeData)) {
        let isEmpty = false
        isEmpty ||= !value
        isEmpty ||= typeof value === "string" && !value.trim()
        isEmpty ||= Array.isArray(value) && value.length === 0
        isEmpty ||= typeof value === "object" && Object.keys(value).length === 0
        if (isEmpty) { delete nodeData[key] }
      }

      return nodeData
    });

    return JSON.stringify(nodesJSON, null, 2); // Indent for readability
  }
}
