import TemplationDefault from './template/template.default';
import Transport from './transport';
import config from '../../config/environment';
import path from 'path';

export function sendNewUserValidate(req, user) {
  console.log(req.headers['origin']);
  var fullUrl = req.headers['origin'] + '/signupvalid?token=' + user.activeToken;
  var templationDefault = new TemplationDefault({
    attachments: [],
    defaultTemplate: path.resolve(__dirname, './template/template.novaconta.html'),
  });
  let html = templationDefault.bindDataHtml({
    title: 'Seja Bem-vindo ao Webnode',
    name: `${user.nome} ${user.sobrenome}`,
    message: 'Seja bem-vindo',
    action: fullUrl,
    copymark: 'PJsin 2008-2017'
  });
  var message = {
    from: 'pelommedrado@gmail.com',
    subject: 'Seja Bem-vindo ao WebNode',
    to: 'pelommedrado@gmail.com',
    html,
    generateTextFromHTML: true,
    attachments: []
  };
  let configTransport = config.emailTransportOptions;
  console.log('configTransport', configTransport);
  let transport = new Transport(configTransport);
  transport.send(message, () => {
    //console.log(html, message);
  });
}
export function sendMessageDefault(user) {
  console.log('config', config);
  var templationDefault = new TemplationDefault();
  let html = templationDefault.bindDataHtml({
    title: 'Envio de mensagem padrao',
    name: `${user.nome} ${user.sobrenome}`,
    message: 'Seja bem-vindo',
    copymark: 'PJsin 2008-2017'
  });
  var message = {
    from: 'pelommedrado@gmail.com',
    subject: 'Template default',
    to: 'pelommedrado@gmail.com',
    html,
    generateTextFromHTML: true,
    attachments: []
  };
  let configTransport = config.emailTransportOptions;
  console.log('configTransport', configTransport);
  let transport = new Transport(configTransport);
  transport.send(message, () => {
    console.log(html, message);
  });
}
