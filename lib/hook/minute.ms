var RangeCounter = require('./range-counter');

export class Minute extends RangeCounter {
  function initialize(prefix) {
    this.$super(20, 3, prefix);
  }
}
