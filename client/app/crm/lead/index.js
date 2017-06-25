'use strict';

import angular from 'angular';
import LeadController from './lead.controller';
import LeadEditController from './lead.edit.controller';
export default angular.module('webnodeApp.lead', [])
  .controller('LeadEditController', LeadEditController)
  .controller('LeadController', LeadController)
  .name;
