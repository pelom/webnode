'use strict';

import Profile from './profile.model';

const select = '_id nome role isAtivo criador modificador createdAt updatedAt';
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
const populateApp = {
  path: 'permissoes.application',
  //match: { nome: reqPermission.aplicacao, isAtivo: true }
};
const populateMod = {
  path: 'permissoes.modulo',
  //match: { nome: reqPermission.modulo, isAtivo: true }
};
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

export function index(req, res) {
  console.log('index()');
  return Profile.find({}, select, {
      skip: 0, // Starting Row
      limit: 10, // Ending Row
      sort: {
        createdAt: -1 //Sort by Date Added DESC
      }
    })
    //.populate(populateApp)
    //.populate(populateMod)
    .populate(selectCriador)
    .populate(selectModificador)
    .exec()
    .then(profiles => {
      res.status(200).json(profiles);
      return profiles;
    })
    .catch(handleError(res));
}

export function show(req, res) {
  var profileId = req.params.id;
  console.log('show()', profileId);
  const selectShow = '_id nome descricao tempoSessao role isAtivo criador modificador createdAt updatedAt permissoes';
  return Profile.findById(profileId)
    .select(selectShow)
    .populate(populateApp)
    .populate(populateMod)
    .populate(selectCriador)
    .populate(selectModificador)
    .exec()
    .then(profile => {
      if(!profile) {
        return res.status(404).end();
      }
      res.json(profile);
      return profile;
    })
    .catch(handleError(res));
}
