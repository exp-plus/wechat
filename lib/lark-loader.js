'use strict';
const assert = require('assert');
const Lark = require('./lark');
module.exports = app => {
  app.addSingleton('lark', (config, app) => {
    // 参数
    assert(config.app_id && config.app_secret);

    // 启动
    const lark = new Lark(config.app_id, config.app_secret);
    app.coreLogger.info('[egg-lark]\t\t初始化成功');
    return lark;
  });
};

