'use strict';

import compose from 'composable-middleware';
import Profile from '../profile/profile.model';
import User from '../user/user.model';

let hasPermission = function(perm) {
  //console.log('hasPermission', perm);
  if(perm.application === null || perm.modulo === null) {
    return false;
  }
  let isMod = perm.application.modulos.filter(function(mdId) {
    return mdId.equals(perm.modulo._id);
  });
  return isMod.length > 0;
};

/**
 * Verificar se o usuario tem permissao ao aplicativo
 * Caso tenho anexar lista de permissoes no request
 * Caso nao, returns 403
 */
export function isPermission(permissao) {
  if(!permissao) {
    throw new Error('Required permission');
  }
  console.log('isPermission: ', permissao);
  return compose()
    .use(function(req, res, next) {
      console.log('req.user: ', req.user._id);
      let profileId = req.user.profileId;
      Profile.findOne({ _id: profileId })
        .populate({ path: 'permissoes.application', match: { nome: permissao.aplicacao }})
        .populate({ path: 'permissoes.modulo', match: { nome: permissao.modulo, isAtivo: true }})
        .exec()
        .then(profile => {
          console.log('profile encontrado: ', profile._id);
          if(!profile) {
            return res.status(401).end();
          }
          let permissionList = profile.permissoes.filter(hasPermission);
          if(permissionList.length == 0) {
            console.log('Permissao nao encontrada no profile', permissao.funcao);
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
      console.log('permissao requisitada: ', permissao);
      if(perm.modulo.funcoes.indexOf(permissao.funcao) < 0) {
        console.log('Permissao nao encontrada no modulo', permissao.funcao);
        return res.status(403).send('Forbidden');
      }
      if(perm.funcoes.indexOf(permissao.funcao) < 0) {
        console.log('Sem permissao:', permissao.funcao);
        return res.status(403).send('Forbidden');
      }
      return next();
    });
}
