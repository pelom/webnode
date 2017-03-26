'use strict';

import angular from 'angular';
import SignupController from './signup.controller';
import SignupValidController from './signupvalid.controller';
export default angular.module('webnodeApp.signup', [])
  .controller('SignupValidController', SignupValidController)
  .controller('SignupController', SignupController)
  .name;
