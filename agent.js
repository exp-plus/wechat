'use strict';

const miniprogram = require('./lib/miniprogram');
module.exports = agent => {
  const useAgent = agent.config.miniprogram.useAgent;
  if (useAgent) {
    miniprogram(agent);
  }
};
