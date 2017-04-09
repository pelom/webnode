'use strict';
import EmailService from './mail.service';
import NovaContaMail from './template/nova.conta.mail';
import RedefiniSenhaMail from './template/redefinir.senha.mail';

export function sendMailNovoConta(req, user) {
  let novaContaMail = new NovaContaMail(req, user);
  let mailService = new EmailService();
  try {
    mailService.enviar(novaContaMail, () => {
    });
  } catch(err) {
    console.log(err);
  }
}

export function sendMailRedefinirSenha(req, user) {
  let novaContaMail = new RedefiniSenhaMail(req, user);
  let mailService = new EmailService();
  try {
    mailService.enviar(novaContaMail, () => {
    });
  } catch(err) {
    console.log(err);
  }
}
