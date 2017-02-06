'use strict';

import angular from 'angular';
import {PermissaoResource} from './permissao.service';

export default angular.module('oauthApplicationApp.permissaoresource', [])
  .factory('PermissaoResource', PermissaoResource).name;
