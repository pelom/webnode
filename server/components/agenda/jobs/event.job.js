'use strict';

import logger from '../../logger';
import {print} from '../util';
import Event from '../../../api/event/event.model';
import User from '../../../api/user/user.model';
import {sendEventosAtradados} from '../../nodemailer';
import moment from 'moment';
import {tz} from 'moment-timezone';

module.exports = function(agenda, jobFile) {
  const buscarEvent = 'Buscar eventos atrasados';

  logger.info('Carregando job file: ', jobFile);

  agenda.define(jobFile.job, function(job, done) {
    print(job);

    User.find({ isAtivo: true }, '_id email nome', {
      skip: 0, limit: 50,
      sort: {
        createdAt: 1
      }
    })
    .then(users => {
      let time = 10;
      users.forEach(item => {
        agenda.schedule(`in ${time} segunds`, buscarEvent, item);
        time += 5;
      });
    })
    .catch(err => {
      job.fail(err);
      job.save();
    })
    .finally(() => {
      done();
    });
  });


  agenda.define(buscarEvent, function(job, done) {
    logger.info('Executando', job.attrs.name, new Date());
    logger.debug('User :', job.attrs.data);

    let user = job.attrs.data;
    Event.find({
      proprietario: user._id,
      status: { $in: ['Pendente', 'Em Andamento'] },
      start: { $lte: new Date() }
    }, '_id title start status', {
      limit: 10,
      sort: { start: -1 }
    })
    .then(events => {
      if(events.length == 0) {
        return;
      }
      let eventos = [];
      events.forEach(item => {
        let evento = {
          _id: item._id.toString(),
          start: moment(item.start).tz('America/Sao_Paulo')
          .format('DD/MM/YYYY HH:mm'),
          status: item.status,
          title: item.title,
        };
        eventos.push(evento);
        logger.debug('Event : ', evento);
      });
      //sendEventosAtradados(user, eventos);
      return eventos;
    })
    .catch(err => {
      job.fail(err);
      job.save();
    })
    .finally(() => {
      done();
    });
  });
  agenda.on(`complete:${buscarEvent}`, function(job) {
    logger.debug('Job complete', job.attrs.name);
  });
  agenda.on('ready', function() {
    logger.debug('agenda.ready() job event');
    agenda.every(jobFile.cron, jobFile.job);
  });

  return agenda;
};
