'use strict';
/*eslint no-invalid-this:0*/
import crypto from 'crypto';
mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';
var UserLoginSchema = new Schema({
  sessionid: String,
  userAgent: String,
  ip: String,
  data: { type: Date, default: Date.now,
		required: 'Must have data date - default value is the created date'
	},
  browser: { name: String, version: String },
  os: { name: String, version: String },
  device: { model: String, type_: String, vendor: String },
});
var EnderecoSchema = new Schema({
  address: String,
  zipcode: String,
  suburb: String,
  city: String,
  state: String,
  complement: String,
  country: String,
  number: String
});
var UserSchema = new Schema({
  nome: {
    type: String, required: true, maxlength: 20 },
  sobrenome: {
    type: String, required: true, maxlength: 40 },
  celular: {
    type: String, required: false },
  telefone: {
    type: String, required: false },
  empresa: {
    type: String, required: false, maxlength: 40 },
  email: {
    type: String, required: true, maxlength: 60, lowercase: true },
  isAtivo: {
    type: Boolean, required: true, default: false },
  username: {
    type: String, required: true, maxlength: 60, lowercase: true },
  password: {
    type: String, required: true
  },
  salt: String,
  provider: String,
  profileId: { type: Schema.Types.ObjectId, ref: 'Profile' },
  activeToken: String,
  passwordReset: {
    type: Boolean, default: undefined
  },
  endereco: EnderecoSchema,
  login: [UserLoginSchema]
}, {
  timestamps: true
});

/**
 * Virtuals
 */

// Public profile information
UserSchema.virtual('profile').get(function() {
  return {
    name: this.nome + this.sobrenome,
    role: this.role
  };
});

// Non-sensitive info we'll be putting in the token
UserSchema.virtual('token').get(function() {
  return {
    _id: this._id,
    role: this.role
  };
});

/**
 * Validations
 */

// Validate empty username
UserSchema.path('username').validate(function(username) {
  return username.length;
}, 'UserName cannot be blank');

// Validate empty password
UserSchema.path('password').validate(function(password) {
  return password.length;
}, 'Password cannot be blank');

// Validate username is not taken
UserSchema.path('username').validate(function(value, respond) {
  return this.constructor.findOne({
    username: value
  })
  .exec()
  .then(user => {
    if(user) {
      if(this.id === user.id) {
        return respond(true);
      }
      return respond(false);
    }
    return respond(true);
  })
  .catch(function(err) {
    throw err;
  });
}, 'The specified username is already in use.');

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema.pre('save', function(next) {
  // Handle new/update passwords
  if(!this.isModified('password')) {
    return next();
  }

  if(!validatePresenceOf(this.password)) {
    return next(new Error('Invalid password'));
  }

  // Make salt with a callback
  this.makeSalt((saltErr, salt) => {
    if(saltErr) {
      return next(saltErr);
    }
    this.salt = salt;
    this.encryptPassword(this.password, (encryptErr, hashedPassword) => {
      if(encryptErr) {
        return next(encryptErr);
      }
      this.password = hashedPassword;
      return next();
    });
  });
});

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} password
   * @param {Function} callback
   * @return {Boolean}
   * @api public
   */
  authenticate(password, callback) {
    if(!callback) {
      return this.password === this.encryptPassword(password);
    }

    this.encryptPassword(password, (err, pwdGen) => {
      if(err) {
        return callback(err);
      }

      if(this.password === pwdGen) {
        return callback(null, true);
      } else {
        return callback(null, false);
      }
    });
  },

  /**
   * Make salt
   *
   * @param {Number} [byteSize] - Optional salt byte size, default to 16
   * @param {Function} callback
   * @return {String}
   * @api public
   */
  makeSalt(byteSize, callback) {
    var defaultByteSize = 16;

    if(typeof arguments[0] === 'function') {
      callback = arguments[0];
      byteSize = defaultByteSize;
    } else if(typeof arguments[1] === 'function') {
      callback = arguments[1];
    } else {
      throw new Error('Missing Callback');
    }

    if(!byteSize) {
      byteSize = defaultByteSize;
    }

    return crypto.randomBytes(byteSize, (err, salt) => {
      if(err) {
        return callback(err);
      } else {
        return callback(null, salt.toString('base64'));
      }
    });
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @param {Function} callback
   * @return {String}
   * @api public
   */
  encryptPassword(password, callback) {
    if(!password || !this.salt) {
      if(!callback) {
        return null;
      } else {
        return callback('Missing password or salt');
      }
    }

    var defaultIterations = 10000;
    var defaultKeyLength = 64;
    var salt = new Buffer(this.salt, 'base64');
    var disg = 'sha1';

    if(!callback) {
      return crypto.pbkdf2Sync(password, salt, defaultIterations, defaultKeyLength, disg)
        .toString('base64');
    }

    return crypto.pbkdf2(password, salt, defaultIterations, defaultKeyLength, disg, (err, key) => {
      if(err) {
        return callback(err);
      } else {
        return callback(null, key.toString('base64'));
      }
    });
  }
};
export default mongoose.model('User', UserSchema);
