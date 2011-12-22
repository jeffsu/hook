var Range = require('./range');

export class Day extends Range {
  function initialize(prefix) {
    this.$super(24, 3600, prefix);
  }
}
