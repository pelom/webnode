'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.send = send;

var _index = require('./templates/index');

var _index2 = _interopRequireDefault(_index);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _environment = require('../config/environment');

var _environment2 = _interopRequireDefault(_environment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function send(req, user) {
  //Create our new new mailer object
  var Mailer = new _index2.default({
    from: 'pelommedrado@gmail.com',
    templates: {
      defaultTemplate: _path2.default.resolve(__dirname, './templates/nova-conta.html')
    },
    transportOptions: {
      auth: {
        user: 'pelommedrado@gmail.com', // Basta dizer qual o nosso usuário
        pass: 'soad87wwpl,' // e a senha da nossa conta
      },
      host: 'smtp.gmail.com',
      port: 465,
      secure: true }
  });

  var fullUrl = req.headers['origin'] + '/signupvalid?token=' + user.activeToken;
  console.log('URL full ', fullUrl);
  console.log('config', _environment2.default);
  Mailer.send({
    to: user.email,
    subject: 'Seja Bem-vindo!',
    template: 'defaultTemplate',
    messageData: {
      title: 'Olá ' + user.email,
      name: user.email,
      message: 'Seja bem-vindo',
      action: fullUrl,
      copymark: '(c) TooCool LLC 1995'
    }
  });
}
//# sourceMappingURL=userNew.service.js.map
