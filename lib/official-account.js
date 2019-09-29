'use strict';

const axios = require('axios');
const { ThirdPartyError } = require('@exp-plus/exception');
const sha1 = require('sha1');
const OfficialAccountMessage = require('./util/official-acount-message');
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
   * @return {Promise<String>} access_token
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
   * @return {Promise<{ticket: String,expire_seconds: Number,url:String}>} 获取的二维码ticket，凭借此ticket可以在有效时间内换取二维码。二维码图片解析后的地址，开发者可根据该地址自行生成需要的二维码图片
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
   * @param {Promise<String>} ticket 门票
   */
  async getTmpQrCodeByTicket(ticket) {
    const res = await axios.get(`https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${ticket}`);
    return res;
  }

  /**
 * 通过code换取网页授权access_token
 * @see https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140842
 * @param {String} code code作为换取access_token的票据，每次用户授权带上的code将不一样，code只能使用一次，5分钟未被使用自动过期。
* @return { Promise<access_token, expired_in, refresh_token, openid, scope> } 返回结果
 */
  async code2UserAccessToken(code) {
    const { data } = await axios.get(`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.appID}&secret=${this.appsecret}&code=${code}&grant_type=authorization_code`);
    return data;
  }
  /**
   * https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140842
   * @param {String} refresh_token 刷新密钥
   * @return { Promise<access_token, expired_in, refresh_token, openid, scope> } 返回结果
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
   * @return {Promise<subscribe,nickname, sex, province, city, country, headimageurl, privilege, unionid> }  subscribe	用户是否订阅该公众号标识，值为0时，代表此用户没有关注该公众号，拉取不到其余信息。
   */
  async getUserInfo(web_access_token, openid) {
    const { data } = await axios.get(`https://api.weixin.qq.com/sns/userinfo?access_token=${web_access_token}&openid=${openid}&lang=zh_CN`);
    return data;
  }

  /**
   * 获取用户基本信息(UnionID机制)
   * @see https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140839
   * @param {String} openid 用户的唯一标识
   * @return {Promise<subscribe,nickname, sex, province, city, country, headimageurl, privilege, unionid> }  subscribe	用户是否订阅该公众号标识，值为0时，代表此用户没有关注该公众号，拉取不到其余信息。
   */
  async getUserInfoUnion(openid) {
    const { data } = await axios.get(`https://api.weixin.qq.com/cgi-bin/user/info?access_token=${this.access_token}&openid=${openid}&lang=zh_CN`);
    return data;
  }

  /**
   * 接入公众号平台
   * 1）将token、timestamp、nonce三个参数进行字典序排序
   * 2）将三个参数字符串拼接成一个字符串进行sha1加密
   * 3）开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
   * @see https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421135319
   * @param {Object} query 查询字段
   * @param {String} query.signature 签名
   * @param {String} query.timestamp 时间戳
   * @param {Number} query.nonce 随机数
   * @param {String} query.echostr 随机字符串
   * @return {String} echostr 或者 failed
   */
  checkSignature(query) {
    const { signature, timestamp, nonce, echostr } = query;
    const str = [ this.Token, timestamp, nonce ].sort().join('');
    const sha = sha1(str); // 加密
    return sha === signature ? echostr : 'failed';
  }

  /**
   * 生成 xml 格式的回复
   * @see https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140543
   * @param {JSON} message 扁平化过的消息体，即数据也拍平
   * @param {JSON} content 内容体
   * @param {String} [msgType="text"] 消息类型，默认为 text
   * @return {String} 格式化为 xml 格式的字符串
   */
  generateMessageReply(message, content, msgType = 'text') {
    return OfficialAccountMessage.template({
      toUserName: message.FromUserName,
      fromUserName: message.ToUserName,
      content,
      msgType,
      createTime: new Date().getTime(),
    });
  }


  /*
   * 将 xml 的微信消息转换为 json 对象
   * @param {String} xmlString XML格式的微信消息
   * @return {Promise<JSON>} 格式化后的 json 对象
   */
  async xmlString2Json(xmlString) {
    const jsonData = await OfficialAccountMessage.parseXMLAsync(xmlString);
    const json = OfficialAccountMessage.formatMessage(jsonData.xml);
    return json;
  }

}

module.exports = OfficialAccount;
