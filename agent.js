'use strict';


const miniprogram = require('./lib/miniprogram-loader');
const officialAccount = require('./lib/official-account-loader');
module.exports = agent => {
  // 全局同步小程序 access_token
  if (agent.config.miniprogram.client) {

    miniprogram(agent);

    // 定时任务更新 access_token
    agent.messenger.on('schedule_update_miniprogram_access_token', access_token => {
      agent.miniprogram.access_token = access_token;
      agent.coreLogger.info('[小程序]\t\t同步 access_token：' + access_token);
    });

    // 新开进程请求 access_token
    agent.messenger.on('ask_for_miniprogram_access_token', () => {
      agent.messenger.sendToApp('sync_miniprogram_access_token', agent.miniprogram.access_token);
    });
  }

  // 全局同步公众号 access_token
  if (agent.config.officialAccount.client) {
    officialAccount(agent);
    agent.messenger.on('refresh_official_account_access_token', async access_token => {
      agent.officialAccount.access_token = access_token;
      agent.coreLogger.info('[公众号]\t\t同步 access_token：' + access_token);
    });

    // 定时任务更新 access_token
    agent.messenger.on('schedule_update_official-account_access_token', access_token => {
      agent.officialAccount.access_token = access_token;
      agent.coreLogger.info('[公众号]\t\t同步 access_token：' + access_token);
    });

    // 新开进程请求 access_token
    agent.messenger.on('ask_for_official_account_access_token', () => {
      agent.messenger.sendToApp('sync_official_account_access_token', agent.officialAccount.access_token);
    });
  }
};
