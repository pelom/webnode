'use strict';

import angular from 'angular';
import {ProdutoResource} from './produto.resource';
import {ProdutoService} from './produto.service';

export default angular.module('webnodeApp.produto.service', [])
  .factory('ProdutoResource', ProdutoResource)
  .factory('ProdutoService', ProdutoService)
  .name;
