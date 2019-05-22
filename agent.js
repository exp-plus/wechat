'use strict';

const miniprogram = require('./lib/miniprogram');
const officialAccount = require('./lib/official-account');
module.exports = agent => {

  if (agent.config.miniprogram.useAgent) {
    miniprogram(agent);
  }
  if (agent.config.officialAccount.useAgent) {
    officialAccount(agent);
  }
};
