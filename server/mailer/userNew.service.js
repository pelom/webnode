import Templation from './templates/index';
import path from 'path';
import config from '../config/environment';

export function send(req, user) {
  //Create our new new mailer object
  var Mailer = new Templation({
    from: 'pelommedrado@gmail.com',
    templates: {
      defaultTemplate: path.resolve(__dirname, './templates/nova-conta.html')
    },
    transportOptions: {
      auth: {
        user: 'pelommedrado@gmail.com', // Basta dizer qual o nosso usuário
        pass: 'soad87wwpl,' // e a senha da nossa conta
      },
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // use SSL
    }
  });

  var fullUrl = req.headers['origin'] + '/signupvalid?token=' + user.activeToken;
  console.log('URL full ', fullUrl);
  console.log('config', config);
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
