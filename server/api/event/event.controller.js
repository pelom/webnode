'use strict';
import Event from './event.model';
import User from '../user/user.model';
import ApiService from '../api.service';
import EventPdf from '../../components/genarate-pdf/event.pdf';
import mongoose from 'mongoose';
import moment from 'moment';
let api = ApiService();
let handleError = api.handleError;
let respondWithResult = api.respondWithResult;
let handleEntityNotFound = api.handleEntityNotFound;
let handleValidationError = api.handleValidationError;

export function domain(req, res) {
  res.status(200).json({
    status: Event.schema.path('status').enumValues,
    prioridade: Event.schema.path('prioridade').enumValues,
  });
}
const populationProfile = {
  path: 'profileId',
  select: '_id nome property'
};

const selectUserCalendar = '_id locale timezone laguage agenda profileId';
export function calendar(req, res) {
  User.findById(req.user._id)
    .select(selectUserCalendar)
    .populate([populationProfile])
    .exec()
    .then(handleEntityNotFound(res))
    .then(user => {
      if(!user.agenda) {
        user.agenda = createAgenda();
      }
      let configCalendar = createAgendaConfig(user);
      res.status(200).json(configCalendar);
      return configCalendar;
    })
    .catch(handleError(res));
}

function createAgenda() {
  return {
    editable: false,
    selectable: false,
    eventLimit: false,
    slotDuration: '01:00:00',
    businessHours: []
  };
}

function createAgendaConfig(user) {
  return {
    header: user.profileId.property.header,
    locale: user.locale,
    lang: user.laguage,
    editable: user.agenda.editable,
    selectable: user.agenda.selectable,
    eventLimit: user.agenda.eventLimit,
    slotDuration: user.agenda.slotDuration,
    //selectConstraint: 'businessHours',
    //eventConstraint: 'businessHours',
    businessHours: user.agenda.businessHours,
    timezone: 'local', // user.timezone,
    ignoreTimezone: false,
    height: 500,
    selectHelper: true,
    nowIndicator: true,
    navLinks: true, // can click day/week names to navigate views
  };
}

const selectIndex = '_id title start end status prioridade allDay descricao isAtivo'
  + ' proprietario criador modificador createdAt updatedAt'
  + ' tarefas origin local type subject references';

const populationOrigin = {
  path: 'origin',
  select: '_id title start status'
};

const populationTarefa = {
  path: 'tarefas',
  select: '_id title start end status subject',
  options: {
    sort: { start: -1 }
  }
};

export function indexPdf(req, res) {
  let firstDay = new Date(req.query.start);
  let lastDay = new Date(req.query.end);
  let status = req.query.status || 'Concluído'.split(',');
  console.log(firstDay, lastDay, status);

  Event.find({
    start: { $gte: firstDay, $lte: lastDay },
    proprietario: req.user._id,
    status: { $in: status }
  }, selectShow, {
    skip: 0, limit: 200,
    sort: {
      start: 1
    }
  })
    .populate([api.populationProprietario, api.populationCriador, api.populationModificador])
    .exec()
    .then(events => {
      let user = api.getUserRequest(req);
      EventPdf().generateEventHour(user, events, res);
    })
    .catch(handleError(res));
}

export function indexPdfHour(req, res) {
  let firstDay = new Date(req.query.start);
  let lastDay = new Date(req.query.end);
  let status = req.query.status || 'Concluído'.split(',');
  console.log(firstDay, lastDay, status, req.user._id);

  Event.aggregate([
    { $match: {
      start: { $gte: firstDay, $lte: lastDay },
      proprietario: mongoose.Types.ObjectId(req.user._id),
      status: { $in: status } } },
      { $unwind: '$tarefas' },
      { $lookup: { from: 'events', localField: 'tarefas', foreignField: '_id', as: 'tarefasInfo' } },
    /*{ $match: {
      pagamentos: { $exists: true },
      'pagamentos.dataPagamento': { $exists: false },
      'pagamentos.dataVencimento': {
        $gte: firstDay, $lte: lastDay
      } }
    },*/
    { $group: {
      _id: '$title',
      //start: { $push: '$start' },
      //tarefas: { $push: '$tarefasInfo' },
      tarefas: { $push: '$tarefasInfo' }
    }},
    //{ $sort: { 'pagamentos.dataVencimento': -1 } },
  ]).exec((err, results) => {
    if(err) {
      handleError(res)(err);
      return;
    }

    let array = [];
    results.forEach(ev => {
      let tasks = [];
      let milleHour = 0;
      ev.tarefas.forEach(evt => {
        milleHour += moment(evt[0].end).diff(moment(evt[0].start));
        tasks.push(evt[0]);
      });

      let durationFmtHour = () => {
        var d = moment.duration(milleHour);
        var h = Math.floor(d.asHours());
        return (h < 10 ? `0${h}` : h)
          + moment.utc(milleHour).format(':mm:ss');
      };

      array.push({
        projeto: ev._id,
        milles: milleHour,
        totalHours: durationFmtHour(),
        tasks,
      });
    });

    let user = api.getUserRequest(req);
    EventPdf().generateEventHour(firstDay, lastDay, user, array, res);
    //res.status(201).json(array);
  });

  /*Event.find({
    start: { $gte: firstDay, $lte: lastDay },
    proprietario: req.user._id,
    status: { $in: status }
  }, selectShow, {
    skip: 0, limit: 200,
    sort: {
      start: 1
    }
  })
    .populate([api.populationProprietario, api.populationCriador, api.populationModificador])
    .exec()
    .then(events => {
      let user = api.getUserRequest(req);
      EventPdf().generateEventHour(user, events, res);
    })
    .catch(handleError(res));*/
}
const statusDefaultList = 'Pendente,Em Andamento,Concluído,Cancelado';
export function index(req, res) {
  return api.find({
    model: 'Event',
    select: selectIndex,
    populate: [populationTarefa, populationOrigin, api.populationProprietario,
      api.populationCriador, api.populationModificador],
    where: buildWhere(req),
    options: { skip: 0, limit: 50,
      sort: {
        createdAt: -1
      }
    }
  }, res);
}


function buildWhere(req) {
  if(req.query.idref) {
    return {
      references: { $elemMatch: { objectId: req.query.idref } }
    };
  }

  let firstDay = new Date(req.query.start);
  let lastDay = new Date(req.query.end);
  let status = req.query.status || statusDefaultList.split(',');

  let where = {
    start: { $gte: firstDay, $lte: lastDay },
    proprietario: req.user._id,
    status: { $in: status },
    type: { $nin: ['Activity'] }
  };

  return where;
}

const selectShow = '_id title start end status prioridade allDay descricao isAtivo'
  + ' proprietario criador modificador createdAt updatedAt tarefas origin local type subject references';

export function show(req, res) {
  return Event.find({_id: req.params.id, proprietario: req.user._id}, selectShow, {
    limit: 1
  })
    .populate([populationTarefa, populationOrigin, api.populationProprietario,
      api.populationCriador, api.populationModificador])
    .exec()
    .then(events => {
      if(events.length == 0) {
        handleEntityNotFound(res)();
      }
      return respondWithResult(res)(events[0]);
    })
    .catch(handleError(res));
}

export function create(req, res) {
  let eventJson = requestCreateEvent(req);
  var newApp = new Event(eventJson);
  newApp.save()
    .then(function(event) {
      res.status(201).json(event);
      return event;
    })
    .catch(handleValidationError(res));
}

function requestCreateEvent(req) {
  return {
    start: req.body.start,
    end: req.body.end,
    allDay: req.body.allDay,
    status: req.body.status,
    prioridade: req.body.prioridade,
    local: req.body.local,
    title: req.body.title,
    descricao: req.body.descricao,
    subject: req.body.subject,
    origin: req.body.origin,
    proprietario: req.user._id,
    criador: req.user._id,
    modificador: req.user._id,
    references: req.body.references,
    type: req.body.type
  };
}

export function update(req, res) {
  let eventJson = requestUpdateEvent(req);
  Event.findByIdAndUpdate(req.params.id, eventJson)
    .then(handleEntityNotFound(res))
    .then(event => {
      req.params.id = event._id;
      return show(req, res);
    })
    .catch(handleError(res));
}

function requestUpdateEvent(req) {
  return {
    _id: req.body._id,
    start: req.body.start,
    end: req.body.end,
    allDay: req.body.allDay,
    status: req.body.status,
    prioridade: req.body.prioridade,
    local: req.body.local,
    title: req.body.title,
    descricao: req.body.descricao,
    subject: req.body.subject,
    isAtivo: req.body.isAtivo,
    proprietario: req.user._id,
    modificador: req.user._id,
  };
}

export function destroy(req, res) {
  Event.find({_id: req.params.id, proprietario: req.user._id}, selectShow, {
    limit: 1
  })
    .populate([populationTarefa, populationOrigin, api.populationProprietario,
      api.populationCriador, api.populationModificador])
    .exec()
    .then(callbackDestroy(res))
    .catch(handleError(res));
}

function callbackDestroy(res) {
  return function(events) {
    if(events.length == 0) {
      return handleEntityNotFound(res)();
    }
    return events[0].remove()
      .then(() => {
        res.status(204).end();
        return events[0];
      })
      .catch(handleError(res));
  };
}
