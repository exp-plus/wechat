'use strict';


const miniprogram = require('./lib/miniprogram-loader');
const officialAccount = require('./lib/official-account-loader');
module.exports = app => {

  if (app.config.miniprogram.client) {
    miniprogram(app);
    // 同步小程序 access_token
    app.messenger.on('sync_miniprogram_access_token', access_token => {
      app.miniprogram.access_token = access_token;
      app.coreLogger.info('[小程序]\t\t同步 access_token：' + access_token);
    });

    // 新进程请求 access_token
    app.messenger.on('egg-ready', () => {
      app.messenger.sendToAgent('ask_for_miniprogram_access_token');
    });
  }

  if (app.config.officialAccount.client) {
    officialAccount(app);

    // 同步小程序 access_token
    app.messenger.on('sync_official_account_access_token', access_token => {
      app.officialAccount.access_token = access_token;
      app.coreLogger.info('[公众号]\t\t同步 access_token：' + access_token);
    });
    // 新进程请求 access_token
    app.messenger.sendToAgent('ask_for_official_account_access_token');

  }
};
