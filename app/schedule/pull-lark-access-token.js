'use strict';

module.exports = app => {
  return {
    schedule: {
      disable: !app.config.lark.client,
      immediate: true,
      interval: '40m',
      type: 'worker',
    },
    /**
     * 定时从微信服务器拉取小程序 access_token
     * 拉取新 access_token 会导致原 access_token 失效，因此以线上服务的为准
     * @param {Object} ctx 上下文对象
     */
    async task(ctx) {
      let tenant_access_token = null;
      if (app.config.lark.client.sync_uri) {
        tenant_access_token = await ctx.curl(app.config.lark.client.sync_uri);
      } else {
        tenant_access_token = await ctx.app.lark.getTenantAccessToken();
      }
      ctx.app.coreLogger.info('[飞书]\t\t拉取 tenant_access_token：' + tenant_access_token);
      ctx.app.messenger.sendToAgent('schedule_update_lark_tenant_access_token', tenant_access_token);
    },
  };
};
