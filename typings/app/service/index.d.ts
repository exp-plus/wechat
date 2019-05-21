// This file is created by egg-ts-helper@1.25.2
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportWechatMiniprogram = require('../../../app/service/wechat/miniprogram');

declare module 'egg' {
  interface IService {
    wechat: {
      miniprogram: ExportWechatMiniprogram;
    }
  }
}
