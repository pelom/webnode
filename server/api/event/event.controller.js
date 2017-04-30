'use strict';
import Event from './event.model';
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
const selectIndex = '_id title start end status prioridade allDay descricao isAtivo'
  + ' proprietario criador modificador createdAt updatedAt';

export function index(req, res) {
  //Event.create({title: 'Hello Word', start: new Date('2017-04-21'), proprietario: req.user._id});
  var date = new Date();
  //var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  //var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  var firstDay = new Date(req.query.start);
  var lastDay = new Date(req.query.end);
  var status = req.query.status || 'Pendente,Em Andamento,Concluído,Cancelado'.split(',');
  console.log('firstDay', firstDay);
  console.log('lastDay', lastDay);
  console.log(Event.schema.path('status').enumValues);
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
      respondWithResult(res)(events[0]);
    })
    .catch(handleError(res));
  /*return api.findById(req.params.id, {
    model: 'Event',
    select: selectShow,
    populate: [api.populationProprietario, api.populationCriador, api.populationModificador],
    query: {
      proprietario: req.user._id,
    },
  }, res);*/
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
  console.log(eventJson);
  console.log(req.params.id);
  Event.findByIdAndUpdate(req.params.id, eventJson)
    .then(handleEntityNotFound(res))
    .then(event => {
      console.log('BD:', event);
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
