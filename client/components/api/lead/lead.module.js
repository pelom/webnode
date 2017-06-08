'use strict';

import angular from 'angular';
import {LeadResource} from './lead.resource';
import {LeadService} from './lead.service';

export default angular.module('webnodeApp.lead.service', [])
  .factory('LeadResource', LeadResource)
  .factory('LeadService', LeadService)
  .name;
