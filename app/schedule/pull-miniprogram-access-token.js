'use strict';

exports.schedule = {
  immediate: true,
  interval: '20m',
  type: 'worker',
};

/**
 * 定时从微信服务器拉取小程序 access_token
 * @param {Object} ctx 上下文对象
 */
exports.task = async ctx => {
  const access_token = await ctx.miniprogram.getAccessToken();
  ctx.app.coreLogger.info('[小程序]\t\t拉取 access_token' + access_token);
  ctx.app.messenger.sendToApp('refresh_miniprogram_access_token', access_token);
};
