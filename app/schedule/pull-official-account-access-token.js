'use strict';

module.exports = app => {
  return {
    schedule: {
      disable: !app.config.officialAccount.client,
      immediate: true,
      interval: '20m',
      type: 'worker',
    },
    /**
     * 定时从微信服务器拉取公众号 access_token
     * @param {Object} ctx 上下文对象
     */
    async task(ctx) {
      let access_token;
      if (app.config.officialAccount.client.sync_uri) {
        const { data } = await ctx.curl(app.config.officialAccount.client.sync_uri, {
          dataType: 'text',
        });
        access_token = data;
      } else {
        access_token = await ctx.app.officialAccount.getAccessToken();
      }
      ctx.app.coreLogger.info('[公众号]\t\t拉取 access_token：' + access_token);
      ctx.app.messenger.sendToAgent('schedule_update_official_account_access_token', access_token);
    },
  };
};
