'use strict';
import angular from 'angular';
import Controller from '../../account/controller';
import moment from 'moment';
moment.locale('pt-br');
export default class ProdutoCatalogController extends Controller {
  /*@ngInject*/
  constructor($window, $scope, toastr, ProdutoService, usSpinnerService, Modal) {
    super($window, $scope, toastr, usSpinnerService);

    this.Modal = Modal;
    this.filterAz = 'A B C D E F G H I J K L M N O P Q R S T U V X Z W Y'.split(' ');
    this.ProdutoService = ProdutoService;
    this.ProdutoService.loadDomain().then(domain => {
      this.categorias = domain.categorias;
      this.init();
    });
    this.managerChange($scope);
  }

  managerChange($scope) {
    $scope.$watch('ctl.selectCat', () => {
      this.filterCatalogo('');
    });
  }

  init() {
    this.ProdutoService.loadCatalogoList()
    .then(produtos => {
      this.produtos = produtos;
      this.configPrice();
    })
    .catch(err => {
      console.log('Ex:', err);
    })
    .finally(() => {
      this.usSpinnerService.stop('spinner-1');
    });
  }

  filterCatalogo(search) {
    console.log(search);
    this.usSpinnerService.spin('spinner-1');
    this.ProdutoService.loadCatalogoList({ search, categoria: this.selectCat })
    .then(produtos => {
      this.produtos = produtos;
      this.configPrice();
    })
    .catch(err => {
      console.log('Ex:', err);
    })
    .finally(() => {
      this.usSpinnerService.stop('spinner-1');
    });
  }

  configPrice() {
    this.produtos.forEach(item => {
      item.unidadeFull = item.unidade;
      item.unidade = item.unidade.split('-')[0].trim();
      if(item.precos && item.precos.length != 0) {
        item.valor = item.precos[0].valor;
        item.descricaoPreco = item.precos[0].descricao;
      } else {
        item.valor = 0.0;
      }
    });
  }
  openCatalogModal(produto) {
    let modalView = this.createModalView('');
    let showOpen = this.Modal.show.open();
    let modalCtl = showOpen(modalView);
    modalCtl.onSaveCatalogo = () => {
      modalCtl.dismiss();
      this.filterCatalogo('');
    };
    modalCtl.onClose = () => {
      modalCtl.dismiss();
    };
    console.log(produto);
    modalCtl.params = produto;
    this.ProdutoService.setModalCtl(modalCtl);
    return modalCtl;
  }

  createModalView(title) {
    return {
      controller: 'ProdutoCatalogEditModalController',
      controllerAs: 'ctl',
      dismissable: false,
      backdrop: 'static',
      keyboard: false,
      title,
      html: require('./produtocatalog.edit.modal.html')
    };
  }
}
