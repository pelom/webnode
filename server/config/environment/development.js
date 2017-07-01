'use strict';
/*eslint no-process-env:0*/

// Development specific configuration
// ==================================
module.exports = {

  // MongoDB connection options
  mongo: {
    //uri: 'mongodb://webnodedev:webnodedev@localhost:27017/webnodedev'
    uri: 'mongodb://webnode:soad87wwee@ds147900.mlab.com:47900/webnode'
  },

  logger: {
    file: {
      level: 'debug',
    },
    console: {
      level: 'debug',
    }
  },

  url: 'http://localhost:3000/',

  // Seed database on startup
  seedDB: false
};
