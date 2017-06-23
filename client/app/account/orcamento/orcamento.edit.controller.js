'use strict';
import angular from 'angular';
import Controller from '../controller';
import {openModalView} from '../conta/conta.modal.service';
import {openModalContatoFind} from '../contato/contato.modal.service';
import {openModalProdutoCatalogFind} from '../produto/produto.modal.service'

export default class OrcamentoEditController extends Controller {
  /*@ngInject*/
  constructor($window, $scope, $stateParams, $timeout, $state, toastr, usSpinnerService,
    OrcamentoService, ContaService, ContatoService, ProdutoService, Modal) {
    super($window, $scope, toastr, usSpinnerService);

    this.id = $stateParams.id;
    this.$state = $state;
    this.$timeout = $timeout;
    this.Modal = Modal;

    this.ProdutoService = ProdutoService;
    this.ContaService = ContaService;
    this.ContatoService = ContatoService;
    this.OrcamentoService = OrcamentoService;
    this.OrcamentoService.loadDomain().then(domain => {
      this.status = domain.status;
      this.init();
    });
  }

  init() {
    this.format = 'dd/MM/yyyy';
    if(this.id) {
      this.OrcamentoService.loadOrcamento({ id: this.id })
        .then(this.callbackLoadOrcamento())
        .finally(() => {
          this.usSpinnerService.stop('spinner-1');
        });
    } else {
      this.orcamento = this.createOrcamento();
      this.$timeout(() => {
        this.usSpinnerService.stop('spinner-1');
      }, 100);
    }
  }

  createOrcamento() {
    return {
      nome: ''
    };
  }

  callbackLoadOrcamento() {
    return orcamento => {
      this.orcamento = orcamento;
      this.configOrcamento();
    };
  }

  configOrcamento() {
    if(this.orcamento.dataValidade && typeof this.orcamento.dataValidade === 'string') {
      this.orcamento.dataValidade = new Date(this.orcamento.dataValidade);
    }
    if(this.orcamento.itens) {
      this.orcamento.itens.forEach(item => {
        item.produto.unidade = item.produto.unidade.split('-')[0].trim();
      });
    }
    this.configContato(this.orcamento.contato);
  }

  configContato(contato) {
    if(contato) {
      contato.name = `${contato.nome} ${contato.sobrenome}`;
    }
    return contato;
  }

  openFindConta() {
    let getParam = () => {
      if(typeof this.orcamento.conta === 'string') {
        return this.orcamento.conta;
      }
      return null;
    };
    let modalCtl = openModalView(this.Modal, getParam());
    modalCtl.onSelectAcc = acc => {
      console.log('onSelectAcc()', acc);
      this.orcamento.conta = acc;
      modalCtl.dismiss();
    };
    modalCtl.onClose = () => {
      modalCtl.dismiss();
    };
    this.ContaService.setModalCtl(modalCtl);
  }

  findAcc(search) {
    if(search && search.length == 0) {
      this.orcamento.conta = null;
    } else if(search && search.length < 3) {
      return;
    }
    return this.ContaService.loadContaList({
      search,
    })
    .then(contas => {
      if(contas && contas.length == 1) {
        if(search === contas[0].nome) {
          this.orcamento.conta = contas[0];
        }
      }
      return contas;
    })
    .finally(() => {
      this.usSpinnerService.stop('spinner-1');
    });
  }

  openFindContato() {
    let getParam = () => {
      if(typeof this.orcamento.contato === 'string') {
        return this.orcamento.contato;
      }
      return null;
    };
    let modalCtl = openModalContatoFind(this.Modal, getParam());
    modalCtl.onSelectAcc = ctt => {
      this.orcamento.contato = ctt;
      this.configOrcamento();
      modalCtl.dismiss();
    };
    modalCtl.onClose = () => {
      modalCtl.dismiss();
    };
    this.ContatoService.setModalCtl(modalCtl);
  }

  findCtt(search) {
    if(search && search.length == 0) {
      this.orcamento.contato = null;
    } else if(search && search.length < 3) {
      return;
    }
    return this.ContatoService.loadContatoList({
      search,
    })
    .then(contatos => {
      contatos.forEach(item => {
        this.configContato(item);
      });
      if(contatos && contatos.length == 1) {
        if(search === `${contatos[0].nome} ${contatos[0].sobrenome}`) {
          this.orcamento.contato = contatos[0];
        }
      }
      return contatos;
    })
    .finally(() => {
      this.usSpinnerService.stop('spinner-1');
    });
  }

  addProduto() {
    let getParam = () => {
      return {
        price: true,
        searchFull: '',
      };
    };
    let modalCtl = openModalProdutoCatalogFind(this.Modal, getParam());
    modalCtl.onSelectProduct = produto => {
      console.log(produto);

      let valorProduct = produto.precos[0].valor;
      let foundItem = this.orcamento.itens.filter(item => item.produto._id === produto._id);

      if(foundItem.length == 1) {
        let prd = foundItem[0];
        prd.quantidade++;
        prd.valorTotal += valorProduct;
      } else {
        this.orcamento.itens.push({
          produto,
          quantidade: 1,
          desconto: 0,
          valorCatalogo: valorProduct,
          valor: valorProduct,
          valorTotal: valorProduct,
        });
      }
      this.configOrcamento();
      modalCtl.dismiss();
    };
    modalCtl.onClose = () => {
      modalCtl.dismiss();
    };
    this.ProdutoService.setModalCtl(modalCtl);
  }

  openModalOrcamentoItem(orcamentoItem) {
    let modalView = this.createModalOrcamentoItem(`${orcamentoItem.produto.nome}`);
    let showOpen = this.Modal.show.open();
    let modalCtl = showOpen(modalView);
    modalCtl.params = orcamentoItem;
    modalCtl.onClose = () => {
      modalCtl.dismiss();
    };
    this.OrcamentoService.setModalCtl(modalCtl);
    return modalCtl;
  }

  createModalOrcamentoItem(title) {
    return {
      controller: 'OrcamentoItemModalController',
      controllerAs: 'ctl',
      dismissable: false,
      backdrop: 'static',
      keyboard: false,
      title,
      html: require('./orcamento.item.modal.html')
    };
  }

  excluirSub(id) {
    let newSub = this.orcamento.itens.filter(item => item._id !== id);
    this.orcamento.itens = newSub;
  }
}
