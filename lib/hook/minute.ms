var Range = require('./range');

export class Minute extends Range {
  function initialize(prefix) {
    this.$super(20, 3, prefix);
  }
}
