'use strict';

import Application from './application.model';
import applicationService from './application.service';

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
  return Application.find({}, '-__v',
  {
    skip: 0, // Starting Row
    limit: 10, // Ending Row
    sort: {
      createdAt: -1 //Sort by Date Added DESC
    }
  },).exec()
    .then(appl => {
      res.status(200).json(appl);
    })
    .catch(handleError(res));
}

export function create(req, res) {
  console.log('create');

  var newApp = new Application(req.body);
  console.log(newApp);
  res.status(200).json(newApp);
  return newApp;
}
