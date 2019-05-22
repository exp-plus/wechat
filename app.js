'use strict';


const miniprogram = require('./lib/miniprogram');
const officialAccount = require('./lib/official-account');
module.exports = app => {
  if (app.config.miniprogram.client) {
    miniprogram(app);
  }
  if (app.config.officialAccount.client) {
    officialAccount(app);
  }
};
