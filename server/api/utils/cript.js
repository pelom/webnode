'use strict';
import config from '../../config/environment';
var crypto = require('crypto');

const algorithm = 'aes-256-ctr';
const hex = 'hex';
const utf8 = 'utf8';

export function encrypt(text) {
  console.log('encrypt:', text);

  var cipher = crypto.createCipher(algorithm, config.secret.session);
  var crypted = cipher.update(text, utf8, hex);
  crypted += cipher.final(hex);
  return crypted;
}

export function decrypt(text) {
  console.log('decrypt:', text);
  var decipher = crypto.createDecipher(algorithm, config.secret.session);
  var dec = decipher.update(text, hex, utf8);
  dec += decipher.final(utf8);
  return dec;
}
