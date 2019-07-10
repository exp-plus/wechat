'use strict';

module.exports = app => {
  return {
    schedule: {
      disable: !app.config.miniprogram.client,
      immediate: true,
      interval: '20m',
      type: 'worker',
    },
    /**
     * 定时从微信服务器拉取小程序 access_token
     * 拉取新 access_token 会导致原 access_token 失效，因此以线上服务的为准
     * @param {Object} ctx 上下文对象
     */
    async task(ctx) {
      let access_token;
      if (app.config.miniprogram.client.sync_uri) {
        access_token = await ctx.curl(app.config.miniprogram.client.sync_uri);
      } else {
        access_token = await ctx.app.miniprogram.getAccessToken();
      }
      ctx.app.coreLogger.info('[小程序]\t\t拉取 access_token：' + access_token);
      ctx.app.messenger.sendToAgent('schedule_update_miniprogram_access_token', access_token);
    },
  };
};
