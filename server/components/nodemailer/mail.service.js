'use strict';
import Transport from './transport';
import config from '../../config/environment';

export default class EmailService {
  constructor() {
    let configTransport = config.emailTransportOptions;
    this.transport = new Transport(configTransport);
  }

  enviar(template, callback) {
    console.log('enviar', template, callback);
    let message = this.createMessage(template);
    console.log('SEND: ', message);
    this.transport.send(message, callback);
  }

  createMessage(template) {
    let html = template.bindDataHtml();
    return {
      from: template.from,
      subject: template.subject,
      to: template.to,
      html,
      generateTextFromHTML: true,
      attachments: []
    };
  }
}
