var Range = require('./range');

export class Hour extends Range {
  function initialize(prefix) {
    this.$super(60, 60, prefix);
  }
}
