'use strict';
const assert = require('assert');
const OfficialAccount = require('./official-account');
module.exports = app => {
  app.addSingleton('officialAccount', (config, app) => {
    // 参数
    assert(config.appID && config.appsecret && config.URL && config.Token && config.domain);

    // 启动
    const officialAccount = new OfficialAccount(config.appID, config.appsecret, config.URL, config.Token, config.domain);
    app.coreLogger.info('[egg-official-account]\t\t初始化成功');
    return officialAccount;
  });
};
