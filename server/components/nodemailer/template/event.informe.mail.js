import TemplateMail from './template.mail';

export default class EventInformeMail extends TemplateMail {
  constructor(user, events) {
    super();
    this.from = 'pelommedrado@gmail.com';
    this.subject = 'Lista de eventos atrasados';
    this.to = user.email;
    this.data = {
      title: 'Webnode - Eventos',
      message: 'Resumo diário de eventos atrasados',
      copymark: 'PJsin 2008-2017',
      events
    };
  }
  getTemplate() {
    return this.pathResolve('./event.informe.mail.html');
  }
}
