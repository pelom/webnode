'use strict';

import compose from 'composable-middleware';
import * as auth from '../../auth/auth.service';
import Profile from '../profile/profile.model';

/**
 * Verificar se o usuario tem permissao ao aplicativo
 * Caso tenho anexar lista de permissoes no request
 * Caso nao, returns 403
 */
export function isPermission(reqPermission) {
  if(!reqPermission) {
    throw new Error('Required permission');
  }
  //console.log('isPermission: ', reqPermission);
  return compose()
    .use(auth.hasRole(reqPermission.role))
    .use(hasPermission(reqPermission))
    .use(hasPermissionModuloFuncao(reqPermission));
}

function hasPermission(reqPermission) {
  const populationApplication = {
    path: 'permissoes.application',
    match: { nome: reqPermission.aplicacao, isAtivo: true }
  };
  const populationModulo = {
    path: 'permissoes.modulo',
    match: { nome: reqPermission.modulo, isAtivo: true }
  };

  return function(req, res, next) {
    Profile.findOne({ _id: req.user.profileId })
      .populate([populationApplication, populationModulo])
      .exec()
      .then(getPermissionList(res))
      .then(setPermissionListRequest(req, res, next))
      .catch(err => next(err));
  };
}

function getPermissionList(res) {
  return function(profile) {
    if(!profile) {
      return res.status(401).end();
    }

    return profile.permissoes.filter(permission => {
      if(permission.application === null || permission.modulo === null) {
        return false;
      }
      return hasPermissionApplication(permission);
    });
  };
}

function hasPermissionApplication(permission) {
  let requiredModuloId = permission.modulo._id;
  let allModuloList = permission.application.modulos;
  let isMod = allModuloList.filter(function(moduloId) {
    return requiredModuloId.equals(moduloId);
  });
  return isMod.length > 0;
}

function setPermissionListRequest(req, res, next) {
  return function(permissionList) {
    permissionList.forEach(perm => {
      console.log('permissionItem:', perm);
    });

    if(permissionList.length == 0) {
      console.log('Permissao nao encontrada no profile: ');
      return res.status(403).send('Forbidden');
    }

    req.permissionList = permissionList;
    next();
    return permissionList;
  };
}

function hasPermissionModuloFuncao(reqPermission) {
  return function(req, res, next) {
    let perm = req.permissionList[0];
    //console.log('permissao encontrada: ', perm._id);
    //console.log('permissao requisitada: ', reqPermission);

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
  };
}
