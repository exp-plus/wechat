'use strict';


const miniprogram = require('./lib/miniprogram-loader');
const officialAccount = require('./lib/official-account-loader');
const lark = require('./lib/lark-loader');
class AgentBootHook {

  constructor(agent) {
    this.agent = agent;

    this.active_miniprogram = this.agent.config.miniprogram.client;
    this.active_official_account = this.agent.config.officialAccount.client;
    this.activeLark = this.agent.config.lark.client;

    if (this.active_miniprogram) miniprogram(this.agent);
    if (this.active_official_account) officialAccount(this.agent);
    if (this.activeLark) lark(this.agent);
  }

  didReady() {

    // 小程序
    this.agent.messenger.on('schedule_update_miniprogram_access_token', access_token => {
      this.agent.miniprogram.access_token = access_token;
      this.agent.coreLogger.info('[小程序]\t\t同步 access_token：' + access_token);
    });
    this.agent.messenger.on('ask_for_miniprogram_access_token', async () => {
      while (!this.agent.miniprogram.access_token) await sleep(1000);
      this.agent.messenger.sendToApp('sync_miniprogram_access_token', this.agent.miniprogram.access_token);
    });


    // 公众号
    this.agent.messenger.on('schedule_update_official_account_access_token', access_token => {
      this.agent.officialAccount.access_token = access_token;
      this.agent.coreLogger.info('[公众号]\t\t同步 access_token：' + access_token);
    });
    this.agent.messenger.on('ask_for_official_account_access_token', async () => {
      while (!this.agent.officialAccount.access_token) await sleep(1000);
      this.agent.messenger.sendToApp('sync_official_account_access_token', this.agent.officialAccount.access_token);
    });

    // 飞书
    this.agent.messenger.on('schedule_update_lark_tenant_access_token', tenant_access_token => {
      this.agent.lark.tenant_access_token = tenant_access_token;
      this.agent.coreLogger.info('[飞书]\t\t同步 tenant_access_token：' + tenant_access_token);
    });

    // 新开进程请求 access_token
    this.agent.messenger.on('ask_for_lark_tenant_access_token', async () => {
      while (!this.agent.lark.tenant_access_token) await sleep(1000);
      this.agent.messenger.sendToApp('sync_lark_tenant_access_token', this.agent.lark.tenant_access_token);
    });


  }
  serverDidReady() {
  }
}
function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
module.exports = AgentBootHook;
