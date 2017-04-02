import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';

function localAuthenticate(User, username, password, done) {
  User.findOne({
    username: username.toLowerCase()
  }, '_id nome sobrenome email username password salt provider isAtivo profileId')
  .populate({
    path: 'profileId',
    select: '_id nome role tempoSessao',
    match: { isAtivo: true }
  })
  .exec()
    .then(user => {
      console.log(user);
      if(!user) {
        done(null, false, {
          message: 'Este nome de usuário não está registrado.'
        });
        return null;
      }
      if(!user.isAtivo) {
        done(null, false, {
          message: 'O Usuário não está ativo, por favor entre em contato com o administrador.'
        });
        return null;
      }
      if(!user.profileId._id) {
        done(null, false, {
          message: 'Profile not found'
        });
        return null;
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
