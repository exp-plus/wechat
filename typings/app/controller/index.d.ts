// This file is created by egg-ts-helper@1.25.2
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportFeedback = require('../../../app/controller/feedback');

declare module 'egg' {
  interface IController {
    feedback: ExportFeedback;
  }
}
