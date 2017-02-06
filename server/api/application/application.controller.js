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
  let moduloUser = applicationService.addApplication('user', ['view', 'create', 'update', 'remove', 'list']);
  let moduloCarro = applicationService.addApplication('carro', ['view', 'create', 'remove']);
  let profileAdmin = applicationService.addProfile('admin', ['user.*', 'carro.*']);
  let profileDealer = applicationService.addProfile('dealer', ['user.view', 'user.list', 'carro.*']);

  console.log(profileAdmin.hasAnyRoles('carro.view', 'user.create'));
  console.log(profileDealer.hasAnyRoles('carro.*', 'user.create'));

  console.log('Modulo User', moduloUser);
  console.log('Modulo Carro', moduloCarro);
  console.log('Profile Admin', profileAdmin);
  console.log('Profile Dealer', profileDealer);

  let appDb = new Application();
  appDb.applications = applicationService.export().applications;
  appDb.profiles = applicationService.export().profiles;
  appDb.save();

  console.log('Export', applicationService.export());

  return Application.find({}, '').exec()
    .then(appl => {
      res.status(200).json(appl);
    })
    .catch(handleError(res));
}
