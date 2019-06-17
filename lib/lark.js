'use strict';
const axios = require('axios');
const { ThirdPartyError } = require('@exp-plus/exception');
class Lark {
  constructor(app_id, app_secret, open_chat_ids = [], open_ids = []) {
    this.app_id = app_id;
    this.app_secret = app_secret;
    this.tenant_access_token = null;
    this.open_chat_ids = open_chat_ids;
    this.open_ids = open_ids;
    this.axios = null;
  }

  /**
   * 企业自建应用通过此接口获取 tenant_access_token，调用接口获取企业资源时
   * @see https://open.feishu.cn/document/ukTMukTMukTM/uIjNz4iM2MjLyYzM
   */
  async getTenantAccessToken() {
    try {
      const { data } = await axios.post('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal/', {
        app_id: this.app_id,
        app_secret: this.app_secret,
      });
      const { tenant_access_token } = data;
      return tenant_access_token;
    } catch (error) {
      throw new ThirdPartyError('获取飞书后台 tanant_access_token 失败', error);
    }
  }
  /**
   * 获取机器人所在的群列表。
   */
  async getBotChatList() {
    const { data } = await axios.get('https://open.feishu.cn/open-apis/chat/v3/list?page=1&page_size=30', {
      headers: {
        Authorization: 'Bearer ' + this.tenant_access_token,
        'content-type': 'application/json',
      },
    });
    const { chats } = data;
    this.open_chat_ids = chats.map(c => c.id).filter(c => c.length > 0);
    return this.open_chat_ids;
  }

  /**
   * 生成基础的消息
   * @see https://open.feishu.cn/document/ukTMukTMukTM/uUjNz4SN2MjL1YzM
   * @param {[String]} ids 将要发送的 id 数组
   * @param {String} key 为 open_chat_id, open_id
   * @param {String} msg_type 消息类型
   * @param {JSON} content 消息体
   * @return {[Promise<Request>]} 请求数组
   */
  generateMessageRequest(ids, key, msg_type = 'text', content) {
    return ids.map(id => {
      return axios.post('https://open.feishu.cn/open-apis/message/v3/send/', {
        [key]: id,
        msg_type,
        content,
      }, {
        headers: {
          Authorization: 'Bearer ' + this.tenant_access_token,
          'content-type': 'application/json',
        },
      });
    });

  }


}

module.exports = Lark;
