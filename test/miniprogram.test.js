'use strict';
const assert = require('assert');
const mock = require('egg-mock');

describe('test/miniprogram.test.js', () => {
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
    const access_token = await ctx.miniprogram.getAccessToken();

    assert(access_token.length > 0);
  });
  it('获取 小程序码', async () => {
    const ctx = app.mockContext();

    const access_token = await ctx.miniprogram.getAccessToken();
    const image = await ctx.miniprogram.generateMiniProgramQRCode({
      access_token,
      is_hyaline: true,
      center_image_url: 'https://sqimg.qq.com/qq_product_operations/im/qqlogo/imlogo_b.png',
    });
    assert(image.length > 0);
  });

  it('获取 小程序码', async () => {
    const ctx = app.mockContext();

    const access_token = await ctx.miniprogram.getAccessToken();
    const image = await ctx.miniprogram.generateMiniProgramQRCode({
      access_token,
      is_hyaline: true,
      center_image_url: 'https://sqimg.qq.com/qq_product_operations/im/qqlogo/imlogo_b.png',
    });
    assert(image.length > 0);
  });
  // it('手动测试 code2session', done => done());
  // it('手动测试 decryptOpenData', done => done());
  // it('手动测试 sendTemplateMessage', done => done());
});
