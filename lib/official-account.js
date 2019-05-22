'use strict';

const assert = require('assert');
const axios = require('axios');
const { ThirdPartyError } = require('@exp-plus/exception');

/**
 * Wechat Official Account
 * @class
 */
class OfficialAccount {
  constructor(appID, appsecret, URL, Token, domain) {
    this.appID = appID;
    this.appsecret = appsecret;
    this.URL = URL;
    this.Token = Token;
    this.domain = domain;
    this.access_token = '';
  }
  /**
   * 获取公众号全局唯一后台接口调用凭据（access_token），并放至至 redis，设定1.75小时自动刷新
   * @see https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140183
   */
  async getAccessToken() {
    try {
      const { data } = await axios.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appID}&secret=${this.appsecret}`);
      const { access_token } = data;
      return access_token;
    } catch (error) {
      throw new ThirdPartyError('获取公众号 access token 失败', error);
    }
  }

  /**
   * 创建二维码ticket
   * @see https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1443433542
   * @param {Number} scene_id 场景id，最长32位
   * @return {{ticket: String,expire_seconds: Number,url:String}} 获取的二维码ticket，凭借此ticket可以在有效时间内换取二维码。二维码图片解析后的地址，开发者可根据该地址自行生成需要的二维码图片
   */
  async generateQRCodeTicket(scene_id) {
    const { data } = await axios.post(`https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=${this.access_token}`, {
      expire_seconds: 604800,
      action_name: 'QR_STR_SCENE',
      action_info: {
        scene: {
          scene_id,
        },
      },
    });

    return data;
  }
  /**
   * 获取二维码ticket后，开发者可用ticket换取二维码图片。
   * @param {String} ticket 门票
   */
  async getTmpQrCodeByTicket(ticket) {
    const res = await axios.get(`https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${ticket}`);
    return res;
  }

  /**
 * 通过code换取网页授权access_token
 * @see https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140842
 * @param {String} code code作为换取access_token的票据，每次用户授权带上的code将不一样，code只能使用一次，5分钟未被使用自动过期。
 * @return { access_token, expired_in, refresh_token, openid, scope } 返回结果
 */
  async code2UserAccessToken(code) {
    const { data } = await axios.get(`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.appID}&secret=${this.appsecret}&code=${code}&grant_type=authorization_code`);
    return data;
  }
  /**
   * https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140842
   * @param {String} refresh_token 刷新密钥
   * @return { access_token, expired_in, refresh_token, openid, scope } 返回结果
   */
  async refreshUserAccessToken(refresh_token) {
    const { data } = await axios.get(`https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=${this.appID}&grant_type=refresh_token&refresh_token=${refresh_token}`);
    return data;
  }

  /**
   * 第四步：拉取用户信息(需scope为 snsapi_userinfo)
   * @see https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140842
   * @param {String} web_access_token 网页授权接口调用凭证
   * @param {String} openid 	用户的唯一标识
   * @return {subscribe,nickname, sex, province, city, country, headimageurl, privilege, unionid }  subscribe	用户是否订阅该公众号标识，值为0时，代表此用户没有关注该公众号，拉取不到其余信息。
   */
  async getUserInfo(web_access_token, openid) {
    const { data } = await axios.get(`https://api.weixin.qq.com/sns/userinfo?access_token=${web_access_token}&openid=${openid}&lang=zh_CN`);
    return data;
  }
}
module.exports = app => {
  app.addSingleton('officialAccount', (config, app) => {
    // 参数
    assert(config.appID && config.appsecret && config.URL && config.Token && config.domain);

    // 启动
    const officialAccount = new OfficialAccount(config.appID, config.appsecret, config.URL, config.Token, config.domain);
    app.coreLogger.info('[egg-official-account]\t\t初始化成功');
    return officialAccount;
  });
};
