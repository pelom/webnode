'use strict';
import Event from './event.model';
import User from '../user/user.model';
import ApiService from '../api.service';

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

export function calendar(req, res) {
  User.findById(req.user._id)
    .select('_id locale timezone laguage agenda')
    //.populate(query.populate)
    .exec()
    .then(handleEntityNotFound(res))
    .then(user => {
      if(!user.agenda) {
        user.agenda = {
          editable: false,
          selectable: false,
          eventLimit: false,
          startEditable: false,
          slotDuration: '01:00:00',
          businessHours: []
        };
      }
      user.agenda.businessHours.forEach(item => {
        item._id = undefined;
      });
      let configCalendar = {
        header: {
          //left: 'month basicWeek basicDay agendaWeek agendaDay',
          //right: 'today,month,basicWeek basicDay,agendaWeek,agendaDay,listWeek'
          left: 'title',
          right: 'today prev,next',
          center: 'timelineDay,agendaDay,listWeek,agendaWeek,month'
        },
        locale: user.locale,
        lang: user.laguage,
        timezone: 'local', // user.timezone,
        ignoreTimezone: false,
        height: 500,
        selectHelper: true,
        nowIndicator: true,
        navLinks: true, // can click day/week names to navigate views
        editable: user.agenda.editable,
        selectable: user.agenda.selectable,
        eventLimit: user.agenda.eventLimit, // allow "more" link when too many events
        startEditable: user.agenda.startEditable,
        slotDuration: user.agenda.slotDuration,
        //selectConstraint: 'businessHours',
        //eventConstraint: 'businessHours',
        businessHours: user.agenda.businessHours,
      };
      res.status(200).json(configCalendar);
      return configCalendar;
    })
    .catch(handleError(res));
}

const selectIndex = '_id title start end status prioridade allDay descricao isAtivo'
  + ' proprietario criador modificador createdAt updatedAt';

export function index(req, res) {
  let firstDay = new Date(req.query.start);
  let lastDay = new Date(req.query.end);
  let status = req.query.status || 'Pendente,Em Andamento,Concluído,Cancelado'.split(',');
  console.log('firstDay', firstDay);
  console.log('lastDay', lastDay);
  return api.find({
    model: 'Event',
    select: selectIndex,
    populate: [api.populationProprietario, api.populationCriador, api.populationModificador],
    where: {
      start: { $gte: firstDay, $lte: lastDay },
      proprietario: req.user._id,
      status: { $in: status }
    },
    options: { skip: 0, limit: 50,
      sort: {
        createdAt: -1
      }
    }
  }, res);
}
const selectShow = '_id title start end status prioridade allDay descricao isAtivo'
  + ' proprietario criador modificador createdAt updatedAt';

export function show(req, res) {
  return Event.find({_id: req.params.id, proprietario: req.user._id}, selectShow, {
    limit: 1
  })
    .populate([api.populationProprietario, api.populationCriador, api.populationModificador])
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
    nome: req.body.nome,
    title: req.body.title,
    descricao: req.body.descricao,
    proprietario: req.user._id,
    criador: req.user._id,
    modificador: req.user._id
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
    nome: req.body.nome,
    title: req.body.title,
    descricao: req.body.descricao,
    isAtivo: req.body.isAtivo,
    proprietario: req.user._id,
    modificador: req.user._id
  };
}
