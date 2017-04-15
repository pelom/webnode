'use strict';
import User from './user.model';
import Profile from '../profile/profile.model';
import config from '../../config/environment';
import generatePassword from '../../components/generate-password';
import {sendMailNovoConta, sendMailRedefinirSenha} from '../../components/nodemailer';
import jwt from 'jsonwebtoken';
import {authenticateLogin} from '../../auth/auth.service';
import ApiService from '../api.service';
import {findAllProfilePermission} from '../api.permission.service';

let api = ApiService();
let handleError = api.handleError;
let respondWithResult = api.respondWithResult;
let handleEntityNotFound = api.handleEntityNotFound;
let handleValidationError = api.handleValidationError;

let PROFILE_ID = {};
function obterProfileDefault(where, select) {
  Profile.findOne({ nome: where }, select).exec()
    .then(profile => {
      if(!profile) {
        console.log('Profile default not found!');
        return;
      }
      PROFILE_ID = profile._id;
      return profile._id;
    })
    .catch(err => {
      console.log('Ex:', err);
    });
}
obterProfileDefault('Usuário padrão', '_id');

const selectIndex = '_id nome sobrenome username isAtivo profileId criador '
  + 'modificador updatedAt createdAt';
const populateProfile = { path: 'profileId', select: '_id nome' };

export function index(req, res) {
  return api.find({
    model: 'User',
    select: selectIndex,
    populate: [populateProfile, api.populationCriador, api.populationModificador],
    where: {},
    options: { skip: 0, limit: 50,
      sort: {
        createdAt: -1
      }
    }
  }, res);
}

const selectShow = '_id nome sobrenome username isAtivo profileId criador '
  + 'modificador updatedAt createdAt endereco email celular telefone empresa login';

const populationLogin = { path: 'login', select: 'data ip browser device os',
  options: {
    limit: 5
  }
};

export function show(req, res) {
  return api.findById(req.params.id, {
    model: 'User',
    select: selectShow,
    populate: [populationLogin, api.populationCriador, api.populationModificador],
  }, res);
}

const selectMe = 'nome sobrenome username role profileId';
const populationProfileRoles = { path: 'profileId', select: 'role -_id', };

const populationModulo = {
  path: 'permissoes.modulo',
  match: { isAtivo: true },
  select: '_id nome application',
};
export function me(req, res, next) {
  var userId = req.user._id;
  console.log(req.session);

  findAllProfilePermission(req.user.profileId, (err, permissoes) => {
    if(err) {
      return;
    }
    return res.status(200).json({
      _id: req.user._id,
      nome: req.user.nome,
      sobrenome: req.user.sobrenome,
      profileId: { role: req.user.role },
      username: req.user.username,
      application: permissoes,
    });
  });
  /*Profile.findOne({ _id: req.user.profileId }, 'role permissoes')
    .populate([populationModulo])
    .exec()
    .then(profile => {
      let menuRight = [];
      profile.permissoes.forEach(item => {
        if(item.modulo) {
          menuRight.push({
            state: 'usuario', title: item.modulo.nome, icon: 'fa-users', show: true
          });
        }
      });
      req.user.application = {
        name: 'Standard',
        show: true,
        menuLeft: [],
        menuRight
      };
      return res.status(200).json({
        _id: req.user._id,
        nome: req.user.nome,
        profileId: { role: req.user.role },
        username: req.user.username,
        application: {
          name: 'Standard',
          show: true,
          menuLeft: [],
          menuRight
        },
      });
    })
    .catch(err => next(err));
    */
  /*return User.findOne({ _id: userId }, selectMe)
    .populate(populationProfileRoles)
    .exec()
    .then(user => {
      if(!user) {
        return res.status(401).end();
      }
      let userResponse = user.toJSON();
      userResponse.application = {
        name: 'Standard',
        show: true,
        menuLeft: [],
        menuRight: [
          { state: 'usuario', title: 'Usuários', icon: 'fa-users', show: true },
          { state: 'permissoes', title: 'Permissões', icon: 'fa-cubes', show: true },
          { state: 'aplicacoes', title: 'Aplicações', icon: 'fa-rocket', show: true }
        ]
      };
      return res.status(200).json(userResponse);
    })
    .catch(err => next(err));*/
}

export function destroy(req, res) {
  return User.findByIdAndRemove(req.params.id).exec()
    .then(function() {
      res.status(204).end();
    })
    .catch(handleError(res));
}

export function create(req, res) {
  let newUser = requestUserCreate(req);
  newUser.save()
    .then(callbackCreateUser(req, res))
    .catch(handleValidationError(res));
}

function requestUserCreate(req) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.criador = req.user._id;
  newUser.modificador = req.user._id;
  newUser.isAtivo = true;
  resetPasswordUser(newUser);
  return newUser;
}
function resetPasswordUser(user) {
  user.password = generatePassword.generatePass();
  user.resetPassword = true;
  return user;
}
function callbackCreateUser(req, res) {
  return function(user) {
    let notifyEmail = Boolean(req.body.isNotificar);
    if(notifyEmail) {
      notifyNewAccount(req, user, true);
    }
    res.status(201).json(true);
    return user;
  };
}
function notifyNewAccount(req, user, passwordReset) {
  gerarTokenValidate(user, passwordReset);
  sendMailNovoConta(req, user);
}
function notifyResetPassword(req, user) {
  gerarTokenValidate(user, true);
  sendMailRedefinirSenha(req, user);
}
function gerarTokenValidate(user, passwordReset) {
  let usertoken = { id: user._id, username: user.username, passwordReset };
  let token = jwt.sign(usertoken, config.secrets.session, {
    expiresIn: '1d'
  });
  user.activeToken = token;
  return token;
}

/*function notifyUserEmail(req, user, passwordReset) {
  let usertoken = { id: user._id, username: user.username, passwordReset };
  let token = jwt.sign(usertoken, config.secrets.session, {
    expiresIn: '1d'
  });
  user.activeToken = token;
  sendMailNovoConta(req, user);
}*/

export function register(req, res) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.profileId = PROFILE_ID;
  console.log('register', newUser);
  newUser.save()
    .then(user => {
      notifyNewAccount(req, user, false);
      res.status(201).json(true);
      return user;
    })
    .catch(handleValidationError(res));
}

export function update(req, res) {
  User.findOne({ _id: req.params.id })
    .exec()
    .then(handleEntityNotFound(res))
    .then(callbackUpdateUser(req, res))
    .catch(handleError(res));
}
function callbackUpdateUser(req, res) {
  return function(user) {
    let userJson = requestUserUpdate(req);
    Object.assign(user, userJson);
    return user.save()
      .then(newUser => {
        let notifyEmail = Boolean(req.body.isNotificar);
        if(notifyEmail) {
          notifyResetPassword(req, newUser);
        }
        req.params.id = user._id;
        return show(req, res);
      })
      .catch(handleValidationError(res));
  };
}
function requestUserUpdate(req) {
  let userId = req.params.id;
  let userUpdate = {
    _id: userId,
    nome: String(req.body.nome),
    sobrenome: String(req.body.sobrenome),
    username: String(req.body.username),
    email: String(req.body.email),
    empresa: req.body.empresa,
    telefone: String(req.body.telefone),
    celular: String(req.body.celular),
    profileId: String(req.body.profileId),
    endereco: req.body.endereco,
    isAtivo: req.body.isAtivo,
    modificador: req.user._id,
  };
  let notify = Boolean(req.body.isNotificar);
  if(notify) {
    resetPasswordUser(userUpdate);
  }
  return userUpdate;
}

export function changePassword(req, res) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId).exec()
    .then(user => {
      if(user.authenticate(oldPass)) {
        user.password = newPass;
        return user.save()
          .then(() => {
            res.status(204).end();
          })
          .catch(handleValidationError(res));
      } else {
        return res.status(403).end();
      }
    });
}

export function getSignupValid(req, res) {
  var token = req.params.id;
  try {
    var decod = jwt.verify(token, config.secrets.session);
    res.json({
      id: decod.id,
      username: decod.username,
      passwordReset: decod.passwordReset
    });
  } catch(err) {
    console.log(err);
    return res.status(401).end();
  }
}

export function signupvalid(req, res) {
  var paramToken = req.params.id;
  try {
    var decod = jwt.verify(paramToken, config.secrets.session);
    return User.findById(decod.id)
      .populate(api.populationProfile)
      .exec()
      .then(callbackSignupValid(req, res, decod));
  } catch(err) {
    console.log(err);
    return res.status(401).end();
  }
}

function callbackSignupValid(req, res, decod) {
  return function(user) {
    if(!user) {
      return res.status(401).end();
    }
    if(isValidateSign(decod, user)) {
      user.isAtivo = true;
    } else if(isResetPassword(decod, user)) {
      var newPass = String(req.body.newPassword);
      user.password = newPass;
      user.resetPassword = undefined;
    } else {
      return res.status(401).end();
    }
    return user.save()
      .then(us => {
        let token = authenticateLogin(req, us);
        res.json({ token });
        return us;
      })
      .catch(handleValidationError(res));
  };
}

function isValidateSign(decod, userRef) {
  if(userRef.isAtivo || !decod.hasOwnProperty('passwordReset')) {
    return false;
  }
  return decod.passwordReset == false;
}

function isResetPassword(decod, userRef) {
  if(!decod.passwordReset || !userRef.resetPassword) {
    return false;
  }
  return decod.passwordReset === true && userRef.resetPassword === true;
}

/**
 * Authentication callback
 */
export function authCallback(req, res) {
  res.redirect('/');
}
