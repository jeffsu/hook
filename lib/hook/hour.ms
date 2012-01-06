var RangeCounter = require('./range-counter');

export class Hour extends RangeCounter {
  function initialize(prefix) {
    this.$super(60, 60, prefix);
  }
}
