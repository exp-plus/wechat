'use strict';


const miniprogram = require('./lib/miniprogram');
const officialAccount = require('./lib/official-account');
module.exports = app => {
  // 全局同步小程序 access_token
  if (app.config.miniprogram.client) {
    miniprogram(app);
    app.messenger.on('refresh_miniprogram_access_token', access_token => {
      app.miniprogram.access_token = access_token;
      app.coreLogger.info('[小程序]\t\t同步 access_token：' + access_token);
    });
  }

  // 全局同步公众号 access_token
  if (app.config.officialAccount.client) {
    officialAccount(app);
    app.messenger.on('refresh_official_account_access_token', async access_token => {
      app.officialAccount.access_token = access_token;
      app.coreLogger.info('[公众号]\t\t同步 access_token：' + access_token);
    });
  }
};
