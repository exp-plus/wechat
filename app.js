'use strict';


const miniprogram = require('./lib/miniprogram-loader');
const officialAccount = require('./lib/official-account-loader');
const lark = require('./lib/lark-loader');
class AppBootHook {
  constructor(app) {
    this.app = app;
    this.activeMiniprogram = this.app.config.miniprogram.client;
    this.activeOfficialAccount = this.app.config.officialAccount.client;
    this.activeLark = this.app.config.lark.client;
    if (this.activeMiniprogram) miniprogram(this.app);
    if (this.activeOfficialAccount) officialAccount(this.app);
    if (this.activeLark) lark(this.app);
  }

  didReady() {

    // 监听同步小程序 access_token
    this.app.messenger.on('sync_miniprogram_access_token', access_token => {
      this.app.miniprogram.access_token = access_token;
      this.app.coreLogger.info('[小程序]\t\t同步 access_token：' + access_token);
    });
    // 监听同步公众号 access_token
    this.app.messenger.on('sync_official_account_access_token', access_token => {
      this.app.officialAccount.access_token = access_token;
      this.app.coreLogger.info('[公众号]\t\t同步 access_token：' + access_token);
    });

    // 监听同步公众号 access_token
    this.app.messenger.on('sync_lark_tenant_access_token', async tenant_access_token => {
      this.app.lark.tenant_access_token = tenant_access_token;
      this.app.coreLogger.info('[飞书]\t\t同步 tenant_access_token：' + tenant_access_token);
    });

  }

  serverDidReady() {
    // 新进程请求 access_token
    if (this.activeMiniprogram) {
      this.app.messenger.sendToAgent('ask_for_miniprogram_access_token');
    }
    // 新进程请求 access_token
    if (this.activeOfficialAccount) {
      this.app.messenger.sendToAgent('ask_for_official_account_access_token');
    }
    // 新进程请求 access_token
    if (this.activeLark) {
      this.app.messenger.sendToAgent('ask_for_lark_tenant_access_token');
    }
  }
}
module.exports = AppBootHook;

