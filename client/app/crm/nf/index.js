'use strict';

import angular from 'angular';
import NfController from './nf.controller';
import NfEditController from './nf.edit.controller';
export default angular.module('webnodeApp.nf', [])
  .controller('NfEditController', NfEditController)
  .controller('NfController', NfController)
  .name;
