/*eslint no-useless-constructor: 0*/
'use strict';
import angular from 'angular';
import Controller from '../../account/controller';
import {openModalView} from './produto.modal.service';
import moment from 'moment';
moment.locale('pt-br');

export default class ProdutoEditController extends Controller {
  /*@ngInject*/
  constructor($window, $scope, $state, $timeout, $stateParams,
    toastr, usSpinnerService, ProdutoService, Modal) {
    super($window, $scope, toastr, usSpinnerService, Modal);
    this.id = $stateParams.id;
    this.$timeout = $timeout;
    this.$state = $state;
    this.Modal = Modal;
    this.ProdutoService = ProdutoService;
    this.ProdutoService.loadDomain().then(domain => {
      this.uso = domain.uso;
      this.categorias = domain.categorias;
      this.unidade = domain.unidade;
      this.unidade.sort();
      this.init();
    });
  }

  init() {
    if(this.id) {
      this.ProdutoService.loadProduto({ id: this.id })
        .then(this.callbackLoadProduto())
        .finally(() => {
          this.usSpinnerService.stop('spinner-1');
        });
    } else {
      this.produto = this.createProduto();
      this.$timeout(() => {
        this.usSpinnerService.stop('spinner-1');
      }, 100);
    }
  }

  callbackLoadProduto() {
    return produto => {
      this.produto = produto;
      if(!this.produto.subproduto) {
        this.produto.subproduto = [];
      }
      if(this.produto.codigoFornecedor) {
        this.produto.codigoFornecedor = this.produto.codigoFornecedor.join(';');
      }
    };
  }

  createProduto() {
    return {
      nome: '',
      subproduto: [],
    };
  }

  addSubProduto() {
    let modalCtl = openModalView(this.Modal, {
      uso: ['01 - Matéria-Prima', '00 - Mercadoria para Revenda']
    });
    modalCtl.onSelectProduct = prod => {
      console.log('onSelectProduct()', prod);

      prod.forEach(produto => {
        let result = this.produto.subproduto.filter(item => item.produto._id === produto._id);
        if(result.length == 0) {
          this.produto.subproduto.push({
            produto,
            quantidade: 1,
            unidade: produto.unidade,
            descricao: '',
          });
        }
      });

      modalCtl.dismiss();
    };
    modalCtl.onClose = () => {
      modalCtl.dismiss();
    };
    this.ProdutoService.setModalCtl(modalCtl);
  }

  save(form) {
    if(form.$invalid) {
      return;
    }

    if(this.produto.codigoFornecedor) {
      this.produto.codigoFornecedor = this.produto.codigoFornecedor.split(';');
    }
    this.usSpinnerService.spin('spinner-1');
    this.ProdutoService.saveProduto(this.produto)
      .then(() => {
        this.toastr.success('Produto salvo com sucesso',
        `${this.produto.nome}`);
        this.$state.go('produtos');
      })
      .catch(this.callbackError(form))
      .finally(() => {
        this.usSpinnerService.stop('spinner-1');
      });
  }

  excluirSub(id) {
    let newSub = this.produto.subproduto
      .filter(item => item._id !== id);
    this.produto.subproduto = newSub;
  }

  clonar() {
    this.produto = angular.copy(this.produto);
    Reflect.deleteProperty(this.produto, '_id');
    this.produto.subproduto.forEach(item => {
      Reflect.deleteProperty(item, '_id');
    });
    this.toastr.info('Produto clonado com sucesso', `${this.produto.nome}`);
  }
}
