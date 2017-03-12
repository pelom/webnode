'use strict';

import ApplicationModulo from './application.modulo.model';
import Application from './application.model';

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
function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    console.log('validationError', err);
    return res.status(statusCode).json(err);
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    return res.status(statusCode).send(err);
  };
}
function createApplicationModulo(req, res) {
  return app => {
    if(!app) {
      return res.status(404).end();
    }
    var newMod = new ApplicationModulo({
      nome: String(req.body.nome),
      descricao: String(req.body.descricao),
      isAtivo: Boolean(req.body.isAtivo),
      funcoes: req.body.funcoes,
      criador: req.user._id,
      modificador: req.user._id,
      application: app._id
    });
    newMod.save()
      .then(mod => {
        Application.findByIdAndUpdate(
          app._id,
          { $push: { modulos: mod._id } },
          { new: true }, function(err, model) {
            if(err) {
              console.log(err);
              res.status(500).send(err)
              return;
            }
            ApplicationModulo.findById(mod._id)
            //.select(select)
            .populate(selectCriador)
            .populate(selectModificador)
            .exec()
            .then(md => {
              res.status(201).json(md);
              return md;
            })
            .catch(validationError(res));
          }
        );
      })
      .catch(validationError(res));
  }
}
export function index(req, res) {
  console.log('index()');
  const select = '_id nome descricao isAtivo criador modificador createdAt updatedAt';
  return Application.find({}, select, {
    skip: 0, // Starting Row
    limit: 10, // Ending Row
    sort: {
      createdAt: -1 //Sort by Date Added DESC
    }
  })
  .populate(selectCriador)
  .populate(selectModificador)
  .exec()
  .then(appl => {
    res.status(200).json(appl);
    return appl;
  })
  .catch(handleError(res));
}
export function show(req, res) {
  var appId = req.params.id;
  console.log('show()', appId);
  const selectShow = '_id nome descricao isAtivo criador modificador createdAt updatedAt modulos';
  return Application.findById(appId)
    .select(selectShow)
    .populate({
      path: 'modulos',
      populate: [selectCriador, selectModificador],
      options: { sort: { createdAt: -1 } }
    })
    .populate(selectCriador)
    .populate(selectModificador)
    .exec()
    .then(app => {
      if(!app) {
        return res.status(404).end();
      }
      res.json(app);
      return app;
    })
    .catch(handleError(res));
}
export function showList(req, res) {
  var appId = req.params.id;
  console.log('showList()', appId);

  //let where = {};
  //if(req.query && req.query.hasOwnProperty('where')) {
  //  where = JSON.parse(req.query.where);
  //}
  //console.log(where);
  const selectShow = '_id nome descricao isAtivo criador modificador createdAt updatedAt modulos';
  return Application.find({ isAtivo: true }, selectShow, {
    sort: { nome: 1 }
  })
    .populate([{
      path: 'modulos',
      populate: [selectCriador, selectModificador],
      match: { isAtivo: true },
      options: { sort: { nome: 1 } }
    },
    selectCriador, selectModificador
    ])
    .exec()
    .then(appList => {
      res.status(200).json(appList);
      return appList;
    })
    .catch(handleError(res));
}
export function create(req, res) {
  console.log('create');
  var newApp = new Application({
    nome: String(req.body.nome),
    descricao: String(req.body.descricao),
    isAtivo: req.body.isAtivo,
    criador: req.user._id,
    modificador: req.user._id
  });
  return newApp.save()
    .then(function(app) {
      res.status(201).json(app);
      return app;
    })
    .catch(validationError(res));
}
export function update(req, res) {
  let appId = req.params.id;
  Application.findByIdAndUpdate(
    appId, {
      nome: String(req.body.nome),
      descricao: String(req.body.descricao),
      isAtivo: req.body.isAtivo,
      modificador: req.user._id
    },
    { safe: true, upsert: true }, function(err, model) {
      if(err) {
        console.log(err);
        return res.status(404).end();
      }
      res.status(200).json(model);
      return model;
    }
  );
}
export function createModulo(req, res) {
  let appId = req.params.id;
  Application.findById(appId, '_id')
    .exec()
    .then(createApplicationModulo(req, res))
    .catch(handleError(res));
}
export function updateModulo(req, res) {
  let appId = req.params.id;
  console.log('updateModulo', appId);
  return ApplicationModulo.findByIdAndUpdate(req.body._id, {
    nome: String(req.body.nome),
    descricao: String(req.body.descricao),
    funcoes: req.body.funcoes,
    isAtivo: req.body.isAtivo,
    modificador: req.user._id },
    { safe: true, upsert: true }, function(err, modulo) {
      if(err) {
        console.log(err);
        return res.status(404).end();
      }
      ApplicationModulo.findById(modulo._id)
      //.select(select)
      .populate(selectCriador)
      .populate(selectModificador)
      .exec()
      .then(mod => {
        res.status(200).json(mod);
        return mod;
      })
      .catch(validationError(res));
    }
  );
}
