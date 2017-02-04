'use strict';

import angular from 'angular';
import SettingsController from './settings.controller';

export default angular.module('oauthApplicationApp.settings', [])
  .controller('SettingsController', SettingsController)
  .name;
