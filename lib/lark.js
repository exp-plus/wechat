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
    // TODO: 启动时获取群组
  }

  async generateAxiosInstance() {
    this.axios = axios.create({

      timeout: 1000,
      headers: {
        Authorization: 'Bearer ' + this.tenant_access_token,
        'content-type': 'application/json',
      },
    });
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
   * @param {String | JSON} text 消息内容
   * @param {Boolean} toChats 发送到聊天
   * @param {Boolean} toOpenIds 发送到员工
   */
  async sendTextMessages(text, toChats, toOpenIds) {
    const promises = [];

    if (toChats) {
      promises.concat(this.open_chat_ids.map(open_chat_id => this.generateMessageAxios(
        { open_chat_id },
        'text',
        { text }
      )));
    }

    if (toOpenIds) {
      promises.concat(this.open_ids.map(open_id => this.generateMessageAxios(
        { open_id },
        'text',
        { text }
      )));
    }
    try {
      await Promise.all(promises);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * 生成基础的消息
   * @see https://open.feishu.cn/document/ukTMukTMukTM/uUjNz4SN2MjL1YzM
   * @param {JSON} id id，key为 open_chat_id, open_id
   * @param {String} msg_type 消息类型
   * @param {JSON} content 消息体
   */
  async generateMessageAxios(id, msg_type = 'text', content) {
    return axios.post('https://open.feishu.cn/open-apis/message/v3/send/', {
      ...id,
      msg_type,
      content,
    }, {
      headers: {
        Authorization: 'Bearer ' + this.tenant_access_token,
        'content-type': 'application/json',
      },
    });
  }
}

module.exports = Lark;
