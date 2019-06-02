'use strict';
const assert = require('assert');
const MiniProgram = require('./miniprogram');
module.exports = app => {
  app.addSingleton('miniprogram', (config, app) => {
    // 参数
    assert(config.appid && config.secret);

    // 启动
    const miniprogram = new MiniProgram(config.appid, config.secret);
    app.coreLogger.info('[egg-miniprogram]\t\t初始化成功');
    return miniprogram;
  });
};

