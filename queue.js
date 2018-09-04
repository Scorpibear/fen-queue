const EventEmitter = require('events').EventEmitter;

const comparator = (theItem) => 
  (item => 
    theItem.fen == item.fen && 
    ( theItem.depth ? (theItem.depth <= item.depth) : true)
  );

class Queue extends EventEmitter {
  constructor() {
    super();
    this.priorities = 4;
    this.values = [[],[],[],[]];
    this.Console = console;
  }
  get events() {
    return {empty: 'empty', change: 'change'};
  }
  get size() {
    return this.values.reduce((accumulator, shelf) => accumulator + shelf.length);
  }
  add(item, priority = 0) {
    if(item && item.fen && item.depth && !this.get(item)) {
      // need to delete even if this.get didn't returns anything,
      // because we can have an item with lower depth but the same fen
      this.delete(item.fen);
      this.emitChangeEvent();
      this.values[priority].push(item);
      return this.getPlace(item);
    } else {
      this.Console.error(`Could not add '${item}' to queue`);
      return -1;
    }
  }
  delete(fen) {
    for(let p = 0; p < this.priorities; p++) {
      let i = this.values[p].findIndex(item => item.fen == fen);
      if(i >= 0){
        this.values[p].splice(i, 1);
        this.emitChangeEvent();
        if(this.size == 0) {
          this.emitEmptyEvent();
        }
        return;
      }
    }
  }
  emitChangeEvent() {
    this.emit(this.events.change, this.toJSON());
  }
  emitEmptyEvent() {
    this.emit(this.events.empty);
  }
  get(theItem) {
    for(let p = 0; p < this.priorities; p++) {
      let item = this.values[p].find(comparator(theItem));
      if(item) {
        return item;
      }
    }
    return null;
  }
  getAllItems() {
    return [].concat(...this.values);
  }
  getFirst() {
    for(let p = 0; p < this.priorities; p++) {
      if(this.values[p].length) {
        return this.values[p][0];
      }
    }
    return null;
  }
  getPlace(theItem) {
    let order = 0;
    for(let p = 0; p < this.priorities; p++) {
      let i = this.values[p].findIndex(comparator(theItem));
      if(i != -1) {
        order += i;
        return order;
      }
      order = this.values[p].length;
    }
    return -1;
  }
  load(values) {
    this.values = values;
    this.emitChangeEvent();
  }
  toJSON() {
    return JSON.parse(JSON.stringify(this.values));
  }
  toList() {
    return this.getAllItems();
  }
}

module.exports = Queue;
