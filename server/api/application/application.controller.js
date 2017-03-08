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

/**
 * Get list of users
 * restriction: 'admin'
 */
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
      populate: [selectCriador, selectModificador]
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
  const selectShow = '_id nome descricao isAtivo criador modificador createdAt updatedAt modulos';
  return Application.find({}, selectShow)
    .populate({
      path: 'modulos',
      populate: [selectCriador, selectModificador]
    })
    .populate(selectCriador)
    .populate(selectModificador)
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

  /*let moduloList = [];
  req.body.modulos.forEach(mod => {
    let modul = new ApplicationModulo(mod);
    modul.criador = req.user._id;
    modul.modificador = req.user._id;
    moduloList.push(modul);
  });
  return ApplicationModulo.create(moduloList)
    .then(modList => {
      console.log('Modulos insert', modList);

    })
    .catch(validationError(res));
  */
}

export function update(req, res) {
  //var newApp = new Application(req.body);
  let appId = req.params.id;
  let nome = String(req.body.nome);
  let descricao = String(req.body.descricao);
  let isAtivo = req.body.isAtivo;

  Application.findByIdAndUpdate(
    appId,
    {
      nome: nome,
      descricao: descricao,
      isAtivo: isAtivo,
      modificador: req.user._id
    },
    { safe: true, upsert: true }, function(err, model) {
      if(err) {
        console.log(err);
        return res.status(404).end();
      }
      res.status(201).json(model);
      return model;
    }
  );
}

export function createModulo(req, res) {
  let appId = req.params.id;
  var newMod = new ApplicationModulo({
    nome: String(req.body.nome),
    descricao: String(req.body.descricao),
    funcoes: req.body.funcoes,
    criador: req.user._id,
    modificador: req.user._id
  });
  newMod.save()
    .then(function(mod) {
      Application.findByIdAndUpdate(
        appId,
        { $push: { modulos: mod._id } },
        { new: true }, function(err, model) {
          if(err) {
            console.log(err);
            return;
          }
          ApplicationModulo.findById(mod._id)
          //.select(select)
          .populate(selectCriador)
          .populate(selectModificador)
          .exec()
          .then(md => {
            if(!md) {
              return res.status(404).end();
            }
            res.status(201).json(md);
            return md;
          })
          .catch(validationError(res));
        }
      );
    })
    .catch(validationError(res));

  return newMod;
}

export function updateModulo(req, res) {
  let appId = req.params.id;
  console.log('updateModulo', appId);
  return ApplicationModulo.findByIdAndUpdate(
    req.body._id, {
      nome: String(req.body.nome),
      descricao: String(req.body.descricao),
      funcoes: req.body.funcoes,
      isAtivo: req.body.isAtivo,
      modificador: req.user._id
    },
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

  /*return ApplicationModulo.findById(id)
    .exec()
    .then(modulo => {
      if(!modulo) {
        return res.status(404).end();
      }
      modulo.nome = nome;
      modulo.descricao = descricao;
      modulo.funcoes = funcoes;
      modulo.isAtivo = isAtivo;
      modulo.modificador = req.user._id;
      return modulo.save()
        .then(newModulo => {
          res.status(201).json(newModulo);
          return newModulo;
        })
        .catch(validationError(res));
    });
    */
}
