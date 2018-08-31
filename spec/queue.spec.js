describe('queue', () => {
  const Queue = require('../queue');
  const item = {fen: '8/PKRpppk1/8/8/8/8/8/8', moves: ['d4'], depth: 100};
  it('what is added could be get', () => {
    const queue = new Queue();
    queue.add(item);
    expect(queue.getItem(item.fen)).toBe(item);
  });
  describe('add', () => {
    it('does not allow to add the item with the same fen twice', () => {
      const queue = new Queue();
      queue.add(item);
      queue.add(item);
      expect(queue.getAllItems()).toEqual([item]);
    });
  });
});
