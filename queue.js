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
  getItem(fen) {
    let priority = 0;
    while(priority < this.priorities) {
      let item = this.values[priority].find(item => item.fen == fen);
      if(item) {
        return item;
      }
      priority++;
    }
    return null;
  }
  getAllItems() {
    return [].concat(...this.values);
  }
}

module.exports = Queue;
