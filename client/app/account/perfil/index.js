'use strict';

import angular from 'angular';
import PerfilController from './perfil.controller';
import PerfilEditModalController from './perfiledit.modal.controller';

export default angular.module('webnodeApp.perfil', [])
  .controller('PerfilEditModalController', PerfilEditModalController)
  .controller('PerfilController', PerfilController).name;
