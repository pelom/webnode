'use strict';
import ApplicationModulo from '../../api/application/application.modulo.model';
import nodemailer from 'nodemailer';
import {decrypt} from '../../api/utils/crypt';
export default class Transport {
  send(message, callback) {
    ApplicationModulo.findOne({ nome: 'Servidor Email' }, 'property')
      .exec()
      .then(modulo => {
        if(!modulo) {
          console.log('Modulo de email nao encotrado');
          return;
        }
        let emailTransportOptions = {
          service: modulo.property.service,
          auth: {
            user: modulo.property.user,
            pass: decrypt(modulo.property.password)
          }
        };
        let nodeMail = nodemailer.createTransport(emailTransportOptions);
        nodeMail.sendMail(message, callback);
      });
  }
}
