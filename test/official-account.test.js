'use strict';
const assert = require('assert');
const mock = require('egg-mock');

describe('test/official-account.test.js', () => {
  let app;

  before(() => {
    app = mock.app({
      baseDir: 'apps/wechat-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('获取 access token', async () => {
    const ctx = app.mockContext();
    const access_token = await ctx.officialAccount.getAccessToken();
    assert(access_token.length > 0);
  });

  it.only('获取二维码 ticket', async () => {
    const ctx = app.mockContext();
    const access_token = await ctx.officialAccount.getAccessToken();
    const scene_id = Math.random() * Math.random() * 10000000;
    const res = await ctx.officialAccount.generateQRCodeTicket(access_token, scene_id);
    assert(res.ticket);
    assert(res.expire_seconds);
    assert(res.url);
  });
  it('获取二维码图片', async () => {
    const ctx = app.mockContext();
    const access_token = await ctx.officialAccount.getAccessToken();
    const scene_id = Math.random() * Math.random() * 10000000;
    const res = await ctx.officialAccount.generateQRCodeTicket(access_token, scene_id);
    const qrcode = await ctx.officialAccount.getTmpQrCodeByTicket(res.ticket);
    assert(qrcode);
  });
  // it('手动测试 code2WebAccessToken', done => done());
  // it('手动测试 getUserInfo', done => done());
});
