const EventEmitter = require('events').EventEmitter;

const comparator = (theItem) => 
  (item => 
    theItem.fen == item.fen && 
    ( theItem.depth ? (theItem.depth <= item.depth) : true)
  );

class Queue extends EventEmitter {
  constructor(priorities = 4) {
    super();
    this.priorities = priorities;
    this.values = [[],[],[],[]];
    this.Console = console;
  }
  get events() {
    return {empty: 'empty', change: 'change'};
  }
  get size() {
    return this.values.reduce((accumulator, shelf) => accumulator + shelf.length, 0);
  }
  add(newItem, priority = 0) {
    if(newItem && newItem.fen && newItem.depth) {
      for(let p = 0, place = 0; p < this.priorities; p++) {
        let i = this.values[p].findIndex(item => item.fen == newItem.fen);
        if(i >= 0) {
          if(p > priority) {
            this.values[p].splice(i, 1);
            break;
          }
          place += i;
          if(this.values[p][i].depth < newItem.depth) {
            this.values[p][i].depth = newItem.depth;
            this.emitChangeEvent();
          }
          return place;
        }
        place += this.values[p].length;
      }
      this.values[priority].push(newItem);
      this.emitChangeEvent();
      return this.getPlace(newItem);
    } else {
      this.Console.error(`Could not add '${newItem}' to queue`);
      return -1;
    }
  }
  delete(fen) {
    for(let p = 0; p < this.priorities; p++) {
      let i = this.values[p].findIndex(item => item.fen == fen);
      if(i >= 0){
        this.values[p].splice(i, 1);
        this.emitChangeEvent();
        return;
      }
    }
  }
  emitChangeEvent() {
    this.emit(this.events.change, this.toJSON());
    if(this.size === 0) {
      this.emitEmptyEvent();
    }
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
