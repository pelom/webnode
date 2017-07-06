'use strict';

import angular from 'angular';
import {NfResource} from './nf.resource';
import {NfService} from './nf.service';

export default angular.module('webnodeApp.nf.service', [])
  .factory('NfResource', NfResource)
  .factory('NfService', NfService)
  .name;
