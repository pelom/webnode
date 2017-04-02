'use strict';

import User from './user.model';
import Profile from '../profile/profile.model';
import config from '../../config/environment';
import generatePassword from '../../components/generate-password';
import {sendNewUserValidate} from '../../components/nodemailer';
import jwt from 'jsonwebtoken';
//import * as mailerUserNew from '../../mailer/userNew.service';

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
  generatePassword.setup();
  //console.log('generatePassword()', generatePassword.generatePassword());
  console.log('generatePass()', generatePassword.generatePass());
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
  //TODO implementar a regra de criação do novo usuário
}

export function register(req, res) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  //newUser.role = 'user';
  newUser.save()
    .then(function(user) {
      Profile.findOne({ nome: 'Usuário padrão' }, '_id')
      .exec()
      .then(profile => {
        console.log(profile);
        if(!profile) {
          return res.status(404).end();
        }
        var token = jwt.sign(user, config.secrets.session, {
          expiresIn: 60 * 60 * 5
        });
        user.activeToken = token;
        user.profileId = profile._id;
        user.save()
          .then(() => {
            res.status(201).json(true);
            sendNewUserValidate(req, user);
            //mailerUserNew.sendNewUserValidate(req, user);
            return user;
          })
          .catch(validationError(res));
        return user;
      })
      .catch(validationError(res));
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
      //sendNewUserValidate(req, user);
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
  /*var decoded = jwt.decode(token, {complete: true});
  console.log('decoded.header', decoded.header);
  console.log('decoded.payload', decoded.payload);
  var clockTimestamp = Math.floor(Date.now() / 1000);
  console.log('clockTimestamp', new Date(clockTimestamp * 1000));
  console.log('payload.exp', new Date(decoded.payload.exp * 1000));
  console.log(createDateAsUTC(new Date(clockTimestamp * 1000)));
  console.log(createDateAsUTC(new Date(decoded.payload.exp * 1000)));

  function createDateAsUTC(date) {
    return new Date(Date.UTC(
      date.getFullYear(), date.getMonth(), date.getDate(),
      date.getHours(), date.getMinutes(), date.getSeconds())
    );
  }*/
  try {
    console.log('config.secrets.session', config.secrets.session);
    var decod = jwt.verify(token, config.secrets.session);
    console.log('verify', decod);
  } catch(err) {
    console.log(err);
  }

  let select = 'nome sobrenome username';
  return User.findOne({ activeToken: token }, select)
    .exec()
    .then(user => {
      console.log(user);
      if(!user) {
        return res.status(401).end();
      }
      res.json(user);
      return user;
    })
    .catch(handleError(res));
}

export function signupvalid(req, res) {
  var token = String(req.body.token);
  return User.findOne({ activeToken: token }, '-salt -password')
    .exec()
    .then(user => { // don't ever give out the password or salt
      if(!user) {
        return res.status(401).end();
      }
      user.activeToken = undefined;
      user.isAtivo = true;
      return user.save()
        .then(us => {
          res.json({ token });
          return us;
        })
        .catch(validationError(res));
    })
    .catch(handleError(res));
}

/**
 * Authentication callback
 */
export function authCallback(req, res) {
  res.redirect('/');
}
