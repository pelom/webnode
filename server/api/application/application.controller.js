'use strict';

import Application from './application.model';
import applicationService from './application.service';

const selectCriador = {
  path: 'criador',
  //match: { age: { $gte: 21 }},
  select: 'nome sobrenome _id',
  //options: { limit: 5}
};
const selectModificador = {
  path: 'modificador',
  //match: { age: { $gte: 21 }},
  select: 'nome sobrenome _id',
  //options: { limit: 5}
};

const select = '-__v';

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    return res.status(statusCode).json(err);
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    return res.status(statusCode).send(err);
  };
}

/**
 * Get list of users
 * restriction: 'admin'
 */
export function index(req, res) {
  console.log('index()');
  console.log('req.headers[user-agent]', req.headers['user-agent']);
  console.log('req.headers[origin]', req.headers['origin']);
  console.log('req.originalUrl', req.originalUrl);
  console.log('req.ip', req.ip);
  /*applicationService.addName('webnode');
  let moduloUser = applicationService.addApplication('oportunidade', ['view', 'create', 'update', 'remove', 'list']);
  let moduloCarro = applicationService.addApplication('lead', ['view', 'create', 'remove']);
  let profileAdmin = applicationService.addProfile('admin', ['lead.*', 'oportunidade.*']);
  let profileDealer = applicationService.addProfile('dealer', ['oportunidade.view', 'oportunidade.list', 'lead.*']);

  console.log(profileAdmin.hasAnyRoles('carro.view', 'user.create'));
  console.log(profileDealer.hasAnyRoles('carro.*', 'user.create'));

  console.log('Modulo User', moduloUser);
  console.log('Modulo Carro', moduloCarro);
  console.log('Profile Admin', profileAdmin);
  console.log('Profile Dealer', profileDealer);

  let exp = applicationService.export();
  let appDb = new Application();
  appDb.nome = exp.name;
  appDb.modulos = exp.applications;
  appDb.perfis = exp.profiles;
  //appDb.applications = applicationService.export().applications;
  //appDb.profiles = applicationService.export().profiles;
  appDb.save();

  console.log('Export', applicationService.export());
*/
  return Application.find({}, select, {
      skip: 0, // Starting Row
      limit: 10, // Ending Row
      sort: {
        createdAt: -1 //Sort by Date Added DESC
      }
    })
    .populate(selectCriador)
    .populate(selectModificador).exec()
    .then(appl => {
      res.status(200).json(appl);
      return appl;
    })
    .catch(handleError(res));
}

export function create(req, res, next) {
  console.log('create');
  var newApp = new Application(req.body);
  newApp.criador = req.user._id;
  newApp.modificador = req.user._id;
  newApp.save()
    .then(function(app) {
      Application.findById(app._id)
      .select(select)
      .populate(selectCriador)
      .populate(selectModificador).exec()
      .then(ap => {
        console.log(ap);
        if(!ap) {
          return res.status(404).end();
        }
        res.status(200).json(ap);
        return ap;
      })
      .catch(validationError(res));
    })
    .catch(validationError(res));
  return newApp;
}

export function update(req, res) {
  let appId = req.params.id;
  console.log('update()', appId);
  console.log('body', req.body);
  let nome = String(req.body.nome);
  let descricao = String(req.body.descricao);
  let isAtivo = req.body.isAtivo;
  let userId = req.user._id;
  return Application.findById(appId).exec()
    .then(app => {
      app.nome = nome;
      app.descricao = descricao;
      app.modificador = userId;
      app.isAtivo = isAtivo;
      return app.save()
        .then(newApp => {
          Application.findById(newApp._id)
          .select(select)
          .populate(selectCriador)
          .populate(selectModificador).exec()
          .then(ap => {
            if(!ap) {
              return res.status(404).end();
            }
            res.status(200).json(ap);
            return ap;
          })
          .catch(validationError(res));
        })
        .catch(validationError(res));
    });
}

export function updateModulo(req, res) {
  let appId = req.params.id;
  console.log('updateModulo', appId);
  console.log('body', req.body);
  var modulos = req.body.modulos;
  let userId = req.user._id;
  return Application.findById(appId).exec()
    .then(app => {
      app.modulos = modulos;
      app.modificador = userId;
      return app.save()
        .then(newApp => {
          res.status(204).end();
          return newApp;
        })
        .catch(validationError(res));
    });
}
