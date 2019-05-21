'use strict';


const miniprogram = require('./lib/miniprogram');

module.exports = app => {
  if (app.config.miniprogram.client) {
    miniprogram(app);
  }
};
