import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';

function localAuthenticate(User, username, password, done) {
  User.findOne({
    username: username.toLowerCase(),
    activeToken: null
  }, '_id nome sobrenome email username password salt provider profileId')
  .populate({
    path: 'profileId',
    select: '_id nome role tempoSessao',
    match: { isAtivo: true }
  })
  .exec()
    .then(user => {
      console.log(user);
      if(!user) {
        return done(null, false, {
          message: 'Este nome de usuário não está registrado.'
        });
      }
      if(!user.profileId._id) {
        return done(null, false, {
          message: 'Profile not found'
        });
      }
      user.authenticate(password, function(authError, authenticated) {
        if(authError) {
          return done(authError);
        }
        if(!authenticated) {
          return done(null, false, { message: 'Usuário ou Senha inválidos' });
        } else {
          return done(null, user);
        }
      });
    })
    .catch(err => done(err));
}

export function setup(User/*, config*/) {
  passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password' // this is the virtual field on the model
  }, function(username, password, done) {
    return localAuthenticate(User, username, password, done);
  }));
}
