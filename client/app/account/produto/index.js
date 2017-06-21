'use strict';

import angular from 'angular';
import ProdutoController from './produto.controller';
import ProdutoEditController from './produto.edit.controller';
import ProdutoCatalogController from './produtocatalog.controller';
import ProdutoCatalogEditModalController from './produtocatalog.edit.modal.controller';
import ProdutoFindModalController from './produtofind.modal.controller';

export default angular.module('webnodeApp.produto', [])
  .controller('ProdutoCatalogEditModalController', ProdutoCatalogEditModalController)
  .controller('ProdutoCatalogController', ProdutoCatalogController)
  .controller('ProdutoFindModalController', ProdutoFindModalController)
  .controller('ProdutoController', ProdutoController)
  .controller('ProdutoEditController', ProdutoEditController)
  .name;
