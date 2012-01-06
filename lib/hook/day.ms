var RangeCounter = require('./range-counter');

export class Day extends RangeCounter {
  function initialize(prefix) {
    this.$super(24, 3600, prefix);
  }
}
