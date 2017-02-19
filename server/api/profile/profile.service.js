'use strict';

import compose from 'composable-middleware';
import Profile from '../profile/profile.model';
//import User from '../user/user.model';

/**
 * Verificar se a permissao tem acesso a Aplicacao e ao modulo
 */
let hasPermission = function(permission) {
  //console.log('hasPermission', perm);
  if(permission.application === null || permission.modulo === null) {
    return false;
  }
  //verificar todos os modulos disponiveis
  let allAppModList = permission.application.modulos;
  let reqModuloId = permission.modulo._id;
  let isMod = allAppModList.filter(function(modId) {
    //E o modulo requisitado?
    return reqModuloId.equals(modId);
  });
  return isMod.length > 0;//modulo encontrado?
};

/**
 * Verificar se o usuario tem permissao ao aplicativo
 * Caso tenho anexar lista de permissoes no request
 * Caso nao, returns 403
 */
export function isPermission(reqPermission) {
  if(!reqPermission) {
    throw new Error('Required permission');
  }
  console.log('isPermission: ', reqPermission);
  return compose()
    .use(function(req, res, next) {
      console.log('findProfile ...');
      console.log('req.user: ', req.user._id);

      let populateApp = {
        path: 'permissoes.application',
        match: { nome: reqPermission.aplicacao, isAtivo: true }
      };
      let populateMod = {
        path: 'permissoes.modulo',
        match: { nome: reqPermission.modulo, isAtivo: true }
      };
      let profileId = req.user.profileId;

      Profile.findOne({ _id: profileId })
        .populate(populateApp)
        .populate(populateMod)
        .exec()
        .then(profile => {
          console.log('profile encontrado: ', profile._id);
          if(!profile) {
            return res.status(401).end();
          }
          let permissionList = profile.permissoes.filter(hasPermission);
          if(permissionList.length == 0) {
            console.log('Permissao nao encontrada no profile: ', reqPermission.funcao);
            return res.status(403).send('Forbidden');
          }
          req.permissionList = permissionList;
          next();
          return profile;
        })
        .catch(err => next(err));
    })
    .use(function(req, res, next) {
      let perm = req.permissionList[0];
      console.log('permissao encontrada: ', perm);
      console.log('permissao requisitada: ', reqPermission);

      //A funcao solicitada nao existe no modulo?
      if(perm.modulo.funcoes.indexOf(reqPermission.funcao) < 0) {
        console.log('Permissao nao encontrada no modulo', reqPermission.funcao);
        return res.status(403).send('Forbidden');
      }
      //a funcao solicitada nao existe na permissao?
      if(perm.funcoes.indexOf(reqPermission.funcao) < 0) {
        console.log('Sem permissao:', reqPermission.funcao);
        return res.status(403).send('Forbidden');
      }
      return next();
    });
}
