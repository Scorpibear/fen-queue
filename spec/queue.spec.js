describe('queue', () => {
  const Queue = require('../queue');
  const depth = 100;
  const fen = '8/PKRpppk1/8/8/8/8/8/8';
  const moves = ['d4'];
  const item = {fen, moves, depth};
  const handler = {onEmpty: () => {}, onChange: () => {}};
  const consoleStub = {log:()=>{}, error:()=>{}};
  let queue;
  beforeEach(() => {
    queue = new Queue();
  });
  it('what is added could be get', () => {
    queue.add(item);
    expect(queue.get(item)).toBe(item);
  });
  it('toJSON output could be loaded', () => {
    queue.add(item);
    queue.add({fen: 'p2', depth}, 2);
    queue.add({fen: 'p1', depth}, 1);
    const json = queue.toJSON();
    const newQueue = new Queue();
    newQueue.load(json);
    expect(queue.getAllItems()).toEqual(newQueue.getAllItems());
  });
  describe('add', () => {
    it('does not allow to add the item with the same fen twice', () => {
      queue.add(item);
      queue.add(item);
      expect(queue.getAllItems()).toEqual([item]);
    });
    it('emits change event', () => {
      spyOn(handler, 'onChange');
      queue.on('change', handler.onChange);
      queue.add(item);
      expect(handler.onChange).toHaveBeenCalled();
    });
    it('does not emits change event when adding the same fen', () => {
      spyOn(handler, 'onChange');
      queue.on('change', handler.onChange);
      queue.add(item);
      queue.add(item);
      expect(handler.onChange).toHaveBeenCalledTimes(1);
    });
    it('place item with P1 earlier than P2', () => {
      queue.add({fen: 'p2', depth}, 2);
      queue.add({fen: 'p1', depth}, 1);
      expect(queue.getAllItems()).toEqual([{fen: 'p1', depth}, {fen: 'p2', depth}]);
    });
    it('place items with the same priority at the end of queue', () => {
      queue.add({fen: 'first', depth});
      queue.add({fen: 'second', depth});
      expect(queue.getAllItems()).toEqual([{fen: 'first', depth}, {fen: 'second', depth}]);
    });
    it('empty fens are not added', () => {
      queue.add({fen: '', depth});
      expect(queue.getAllItems()).toEqual([]);
    });
    it('does not allow to add items with empty depth', () => {
      spyOn(consoleStub, 'error');
      queue.Console = consoleStub;
      queue.add({fen});
      expect(queue.getAllItems()).toEqual([]);
      expect(consoleStub.error).toHaveBeenCalled();
    });
    it('replaces item if the same fen is added with greater depth', () => {
      queue.add({fen, depth: 90});
      queue.add({fen, depth: 100});
      expect(queue.getAllItems()).toEqual([{fen, depth: 100}]);
    });
    it('returns place in queue', () => {
      spyOn(queue, 'getPlace').and.returnValue(42);
      expect(queue.add(item)).toBe(42);
    });
    it('emits change event with json value as param', () => {
      spyOn(queue, 'toJSON').and.returnValue([{a: 1, b: 2}]);
      spyOn(handler, 'onChange');
      queue.on('change', handler.onChange);
      queue.add(item);
      expect(handler.onChange).toHaveBeenCalledWith([{a: 1, b: 2}]);
    });
    it('does not emit empty event if the item was replaced with greater fen', () => {
      queue.add({fen, depth: 90});
      spyOn(queue, 'emitEmptyEvent').and.stub();
      queue.add({fen, depth: 100});
      expect(queue.emitEmptyEvent).not.toHaveBeenCalled();
    });
    it('change priority of item', () => {
      queue.add({fen: 'fen2', depth: 40, moves}, 1);
      queue.add(item, 1);
      queue.add(item, 0);
      expect(queue.getPlace(item)).toEqual(0);
    });
  });
  describe('delete', () => {
    it('deletes added item', () => {
      queue.add(item);
      queue.delete(item.fen);
      expect(queue.get(item)).toBeNull();
    });
    it('emits empty event if the queue is empty', () => {
      queue.add(item);
      spyOn(handler, 'onEmpty');
      queue.on('empty', handler.onEmpty);
      queue.delete(item.fen);
      expect(handler.onEmpty).toHaveBeenCalled();
    });
    it('emits change event in case of delete occured', () => {
      queue.add(item);
      queue.add({fen: item.fen + 'r', depth});
      spyOn(handler, 'onChange');
      queue.on('change', handler.onChange);
      queue.delete(item.fen);
      expect(handler.onChange).toHaveBeenCalled();
    });
    it('does not emit empty event if there are more left', () => {
      queue.add(item);
      queue.add({fen: item.fen + 'p', moves: ['a4', 'a5'], depth});
      spyOn(handler, 'onEmpty');
      queue.on('empty', handler.onEmpty);
      queue.delete(item.fen);
      expect(handler.onEmpty).not.toHaveBeenCalled();
    });
  });
  describe('emitChangeEvent', () => {
    it('emitChangeEvent also emits empty event if size is zero', () => {
      spyOn(queue, 'emitEmptyEvent').and.stub();
      queue.emitChangeEvent();
      expect(queue.emitEmptyEvent).toHaveBeenCalled();
    });
    it('does not call emitEmptyEvent if there is at least one item in queue', () => {
      spyOn(queue, 'emitEmptyEvent').and.stub();
      queue.add(item);
      expect(queue.emitEmptyEvent).not.toHaveBeenCalled();
    });
  });
  
  describe('get', () => {
    it('returns null for not-existent fen', () => {
      expect(queue.get({fen: 'something'})).toBeNull();
    });
    it('returns null if fen are matched but requested depth is higher', () => {
      queue.add({fen, depth: 40});
      expect(queue.get({fen, depth: 100})).toBeNull();
    });
    it('returns item in queue if fen match and depth requested is lower than in queue', () => {
      queue.add(item);
      expect(queue.get({fen, depth: 90})).toEqual(item);
    });
    it('returns item by fen only in case depth is not specified in request', () => {
      queue.add(item);
      expect(queue.get({fen})).toEqual(item);
    });
  });
  describe('getFirst', () => {
    it('returns the first element from the queue', () => {
      queue.add(item);
      expect(queue.getFirst()).toBe(item);
    });
    it('returns the first element from p3, if p0, p1, p2 are empty', () => {
      queue.add(item, 3);
      expect(queue.getFirst()).toBe(item);
    });
    it('does not change queue', () => {
      queue.add(item);
      queue.getFirst();
      expect(queue.getAllItems()).toEqual([item]);
    });
  });
  describe('getPlace', () => {
    it('returns -1 if not in queue', () => {
      expect(queue.getPlace(item)).toBe(-1);
    });
    it('returns 0 for the first place', () => {
      queue.add(item);
      expect(queue.getPlace(item)).toBe(0);
    });
    it('returns -1 if depth in queue is lower', () => {
      queue.add({fen, depth: 40});
      expect(queue.getPlace({fen, depth: 100})).toBe(-1);
    });
    it('works if depth in queue is higher', () => {
      queue.add({fen, depth: 100});
      expect(queue.getPlace({fen, depth: 99})).toBe(0);
    });
  });
  describe('load', () => {
    it('loads new queue', () => {
      queue.load([[{ fen: 'new', depth: 50 }],[],[],[]]);
      expect(queue.getAllItems()).toEqual([{ fen: 'new', depth: 50 }]);
    });
    it('emits change event', () => {
      spyOn(handler, 'onChange');
      queue.on('change', handler.onChange);
      queue.load([[item],[],[],[]]);
      expect(handler.onChange).toHaveBeenCalled();
    });
  });
  describe('size', () => {
    it('increases with values added', () => {
      queue.add(item);
      expect(queue.size).toBe(1);
    });
  });
});
