'use strict';
/*eslint no-process-env:0*/

// Development specific configuration
// ==================================
module.exports = {

  // MongoDB connection options
  mongo: {
    uri: 'mongodb://oauthapplication:oauthapplication@localhost:27017/oauthapplication-dev'
  },

  // Seed database on startup
  seedDB: false

};
