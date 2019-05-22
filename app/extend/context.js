'use strict';

module.exports = {
  /**
   * Miniprogram Singleton instance
   * @member Context#miniprogram
   * @since 1.0.0
   * @see App#miniprogram
   */
  get miniprogram() {
    return this.app.miniprogram;
  },
  /**
   * OfficialAccount Singleton instance
   * @member Context#officialAccount
   * @since 1.0.0
   * @see App#officialAccount
   */
  get officialAccount() {
    return this.app.officialAccount;
  },
};
