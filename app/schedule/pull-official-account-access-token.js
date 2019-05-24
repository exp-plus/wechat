'use strict';

module.exports = app => {
  return {
    schedule: {
      disable: !app.config.officialAccount.agent,
      immediate: true,
      interval: '20m',
      type: 'worker',
    },
    /**
     * 定时从微信服务器拉取公众号 access_token
     * @param {Object} ctx 上下文对象
     */
    async task(ctx) {
      const access_token = await ctx.officialAccount.getAccessToken();
      ctx.app.coreLogger.info('[公众号]\t\t拉取 access_token：' + access_token);
      ctx.app.messenger.sendToApp('refresh_official_account_access_token', access_token);
    },
  };
};
