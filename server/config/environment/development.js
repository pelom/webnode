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
  seedDB: false,

  emailTransportOptions: {
    auth: {
      user: 'pelommedrado@gmail.com', // Basta dizer qual o nosso usuário
      pass: 'soad87wwpl,' // e a senha da nossa conta
    },
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
  }
};
