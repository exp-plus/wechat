'use strict';
const xml2js = require('xml2js');
module.exports = {
  /**
   * 将 xml 异步地转换为 json
   * @param {String} xml xml 字符串
   * @return {Promise<JSON>} json 格式的数据
   */
  parseXMLAsync(xml) {
    return new Promise((resolve, reject) => {
      xml2js.parseString(xml, { trim: true }, function(err, content) {
        err ? reject(err) : resolve(content);
      });
    });
  },
  /**
   * 拍平数组结构的 json 对象
   * @param {JSON} json json 对象
   * @return {Promise<JSON>} json 格式的数据
   */
  flattenJSON(json) {
    const message = {};
    if (typeof json === 'object') {
      const keys = Object.keys(json);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const item = json[key];
        if (!(item instanceof Array) || item.length === 0) continue;
        if (item.length === 1) {
          const val = item[0];
          if (typeof val === 'object') message[key] = this.flattenJSON(val);
          else message[key] = (val || '').trim();
        } else {
          message[key] = [];
          for (let j = 0, k = item.length; j < k; j++) message[key].push(this.flattenJSON(item[j]));
        }
      }
    }
    return message;
  },
};
