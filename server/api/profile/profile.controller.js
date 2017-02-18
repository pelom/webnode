'use strict';

import Profile from './profile.model';

const select = '-__v';
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
    .populate(selectCriador)
    .populate(selectModificador).exec()
    .then(profiles => {
      res.status(200).json(profiles);
      return profiles;
    })
    .catch(handleError(res));
};
