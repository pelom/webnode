'use strict';

import compose from 'composable-middleware';
import Profile from '../profile/profile.model';
import User from '../user/user.model';

/**
 * Verificar se o usuario tem permissao ao aplicativo
 * Caso tenho anexar a aplicacao no request
 * Caso nao, returns 403
 */
export function isPermission(nameApp) {
  return compose()
    .use(function(req, res, next) {
      console.log('isPermission', nameApp);
      console.log('isPermission', req.user);

      User.findById(req.user._id)
        .populate('profileId')
        .exec()
        .then(user => {
          console.log('Result: ', user);
          if(!user) {
            return res.status(401).end();
          }
          req.user = user;
          next();
          return user;
        })
        .catch(err => next(err));
    })
    .use(function(req, res, next) {
      let profileId = req.user.profileId._id;
      Profile.find({})
        .populate({
          path: 'applications',
          match: { nome: nameApp }
        })
        .exec()
        .then(profile => {
          console.log('Profile: ', profile);
          return next();
          /*if(config.userRoles.indexOf(req.user.profileId.role) >= config.userRoles.indexOf(roleRequired)) {

          } else {
            return res.status(403).send('Forbidden');
          }*/
        })
        .catch(err => next(err));
    });
}
