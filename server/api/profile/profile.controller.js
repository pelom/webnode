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
  select: '_id nome descricao'
};
const populateMod = {
  path: 'permissoes.modulo',
  select: '_id nome descricao funcoes'
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
export function create(req, res) {
  console.log('create');
  var newProfile = new Profile({
    nome: String(req.body.nome),
    descricao: String(req.body.descricao),
    isAtivo: req.body.isAtivo,
    criador: req.user._id,
    modificador: req.user._id,
    tempoSessao: Number(req.body.tempoSessao),
    role: String(req.body.role),
    permissoes: req.body.permissoes
  });
  return newProfile.save()
    .then(function(profile) {
      return res.status(201).json(profile);
    })
    .catch(validationError(res));
}
export function update(req, res) {
  let profileId = req.params.id;
  console.log('update', profileId);
  Profile.findByIdAndUpdate(
    profileId, {
      nome: String(req.body.nome),
      descricao: String(req.body.descricao),
      isAtivo: req.body.isAtivo,
      modificador: req.user._id,
      tempoSessao: Number(req.body.tempoSessao),
      permissoes: req.body.permissoes
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
