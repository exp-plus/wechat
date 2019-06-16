'use strict';
const assert = require('assert');
const Lark = require('./lark');
module.exports = app => {
  app.addSingleton('lark', (config, app) => {
    // 参数
    assert(config.app_id && config.app_secret && config.open_chat_ids && config.open_ids);

    // 启动
    const lark = new Lark(config.app_id, config.app_secret, config.open_chat_ids, config.open_ids);
    app.coreLogger.info('[egg-lark]\t\t初始化成功');
    return lark;
  });
};

