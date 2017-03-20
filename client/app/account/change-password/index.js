'use strict';

import angular from 'angular';
import ChangePasswordController from './change.password.controller';

export default angular.module('oauthApplicationApp.changePassword', [])
  .controller('ChangePasswordController', ChangePasswordController)
  .name;
