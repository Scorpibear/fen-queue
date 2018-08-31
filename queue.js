class Queue {
  constructor() {
    this.priorities = 4;
    this.values = [[],[],[],[]];
  }
  add(item, priority = 0) {
    if(!this.getItem(item.fen)) {
      this.values[priority].push(item);
    }
  }
  deleteItem(fen) {
    for(let p = 0; p < this.priorities; p++) {
      let i = this.values[p].findIndex(item => item.fen == fen);
      if(i >= 0){
        this.values[p].splice(i, 1);
        return;
      }
    }
  }
  getItem(fen) {
    for(let p = 0; p < this.priorities; p++) {
      let item = this.values[p].find(item => item.fen == fen);
      if(item) {
        return item;
      }
    }
    return null;
  }
  getAllItems() {
    return [].concat(...this.values);
  }
}

module.exports = Queue;
