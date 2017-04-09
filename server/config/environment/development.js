'use strict';
/*eslint no-process-env:0*/

// Development specific configuration
// ==================================
module.exports = {

  // MongoDB connection options
  mongo: {
    uri: 'mongodb://webnodedev:webnodedev@localhost:27017/webnodedev'
  },

  // Seed database on startup
  seedDB: false,
  emailTransportOptions: {
    auth: {
      user: 'pelommedrado@gmail.com',
      pass: 'soad87wwpl,'
    },
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
  }
};
