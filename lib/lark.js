'use strict';
const axios = require('axios');
const { ThirdPartyError } = require('@exp-plus/exception');
class Lark {
  constructor(app_id, app_secret) {
    this.app_id = app_id;
    this.app_secret = app_secret;
    this.tenant_access_token = null;
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
   * 给多个用户或者多个部门发送消息
   * @see https://open.feishu.cn/document/ukTMukTMukTM/ucDO1EjL3gTNx4yN4UTM
   * @param {String} msg_type text,image,post,interactive
   * @param {JSON} content 消息体
   * @param {[String]} open_chat_ids 群聊 open_chat_id 数组
   * @param {[String]} open_ids 用户 open_id 数组
   * @param {[String]} employee_ids 用户 employee_id 数组
   * @param {[String]} emails 用户 email 数组
   */
  async sendMessages(msg_type, content, open_chat_ids, open_ids, employee_ids, emails) {
    const promises = [];

    if (open_chat_ids && open_chat_ids.length > 0) {
      promises.concat(this.generateMessageRequest(open_chat_ids, 'open_chat_id', msg_type, content));
    }
    if (open_ids && open_ids.length > 0) {
      promises.concat(this.generateMessageRequest(open_ids, 'open_id', msg_type, content));
    }
    if (employee_ids && employee_ids.length > 0) {
      promises.concat(this.generateMessageRequest(employee_ids, 'employee_id', msg_type, content));
    }
    if (emails && emails.length > 0) {
      promises.concat(this.generateMessageRequest(emails, 'email', msg_type, content));
    }
    try {
      await Promise.all(promises);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * 生成基础的消息
   * @inner
   * @see https://open.feishu.cn/document/ukTMukTMukTM/uUjNz4SN2MjL1YzM
   * @param {[String]} ids 将要发送的 id 数组
   * @param {String} key 为 open_chat_id, open_id,employee_id,email
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
