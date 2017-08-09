'use strict';
/*eslint no-process-env:0*/

// Development specific configuration
// ==================================
module.exports = {

  mongo: {
    uri: 'mongodb://pjsign:pjsign@ds127173.mlab.com:27173/pjsign'
    //uri: 'mongodb://webnodedev:webnodedev@localhost:27017/webnodedev'
    //uri: 'mongodb://webnode:soad87wwee@ds147900.mlab.com:47900/webnode'
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

  seedDB: false
};
