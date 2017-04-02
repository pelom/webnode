'use strict';
import User from './user.model';
import Profile from '../profile/profile.model';
import config from '../../config/environment';
import generatePassword from '../../components/generate-password';
import {sendNewUserValidate} from '../../components/nodemailer';
import jwt from 'jsonwebtoken';
import {authenticateLogin} from '../../auth/auth.service';

let profileIdDefault = {};
Profile.findOne({ nome: 'Usuário padrão' }, '_id')
  .exec()
  .then(profile => {
    if(!profile) {
      console.log('Profile default not found!');
      return;
    }
    profileIdDefault = profile._id;
    return profile._id;
  })
  .catch(err => {
    console.log(err);
  });

const selectProfileRoles = {
  path: 'profileId',
  //match: { age: { $gte: 21 }},
  select: 'role -_id',
  //options: { limit: 5}
};
const selectDefault = '_id nome sobrenome username isAtivo profileId updatedAt createdAt';
const populateProfile = {
  path: 'profileId',
  select: '_id nome'
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

/**
 * Get list of users
 * restriction: 'admin'
 */
export function index(req, res) {
  return User.find({}, selectDefault)
    .populate(populateProfile)
    .exec()
    .then(users => {
      res.status(200).json(users);
      return users;
    })
    .catch(handleError(res));
}
/**
 * Creates a new user
 */
export function create(req, res) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.password = generatePassword.generatePass();
  newUser.resetPassword = true;
  newUser.isAtivo = true;
  newUser.save()
    .then(function(user) {
      let notif = Boolean(req.body.isNotificar);
      if(notif) {
        let usertoken = {
          id: user._id,
          username: user.username,
          passwordReset: true
        };
        var token = jwt.sign(usertoken, config.secrets.session, {
          expiresIn: '1d'
        });
        user.activeToken = token;
        sendNewUserValidate(req, user);
      }
      res.status(201).json(true);
      return user;
    })
    .catch(validationError(res));
}

export function register(req, res) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.profileId = profileIdDefault;
  newUser.save()
    .then(function(user) {
      let usertoken = {
        id: user._id,
        username: user.username,
        passwordReset: false
      };
      var token = jwt.sign(usertoken, config.secrets.session, {
        expiresIn: '1 days'
      });
      user.activeToken = token;
      res.status(201).json(true);
      sendNewUserValidate(req, user);
      return user;
    })
    .catch(validationError(res));
}

/**
 * Get a single user
 */
export function show(req, res, next) {
  var userId = req.params.id;
  const select = '_id nome sobrenome username isAtivo profileId updatedAt createdAt, endereco email celular telefone empresa login';

  return User.findById(userId)
    .select(select)
    .populate({
      path: 'login',
      select: 'data ip browser device os',
      options: {
        limit: 5
      }
    })
    .exec()
    .then(user => {
      if(!user) {
        return res.status(404).end();
      }
      res.json(user);
      return user;
    })
    .catch(err => next(err));
}

/**
 * Deletes a user
 * restriction: 'admin'
 */
export function destroy(req, res) {
  return User.findByIdAndRemove(req.params.id).exec()
    .then(function() {
      res.status(204).end();
    })
    .catch(handleError(res));
}

/**
 * Change a users password
 */
export function changePassword(req, res) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  return User.findById(userId).exec()
    .then(user => {
      if(user.authenticate(oldPass)) {
        user.password = newPass;
        return user.save()
          .then(() => {
            res.status(204).end();
          })
          .catch(validationError(res));
      } else {
        return res.status(403).end();
      }
    });
}

/**
 * Get my info
 */
export function me(req, res, next) {
  var userId = req.user._id;
  let select = 'nome sobrenome username role profileId';
  return User.findOne({ _id: userId },
    //'-salt -password -activeToken'
    select)
    .populate(selectProfileRoles)
    .exec()
    .then(user => { // don't ever give out the password or salt
      if(!user) {
        return res.status(401).end();
      }
      res.json(user);
      return user;
    })
    .catch(err => next(err));
}

export function getSignupValid(req, res) {
  var token = req.params.id;
  try {
    var decod = jwt.verify(token, config.secrets.session);
    console.log('verify', decod);
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
  console.log('signupValid()');

  var paramToken = req.params.id;
  try {
    var decod = jwt.verify(paramToken, config.secrets.session);
    return User.findById(decod.id)
      .populate({
        path: 'profileId',
        select: '_id nome role tempoSessao',
        match: { isAtivo: true }
      })
      .exec()
      .then(user => {
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
          .catch(validationError(res));
      });
  } catch(err) {
    console.log(err);
    return res.status(401).end();
  }
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
