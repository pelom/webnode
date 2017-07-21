'use strict';
import angular from 'angular';
import addZero from 'add-zero';
import Controller from '../../account/controller';
import {openModalView as openModalAccView} from '../conta/conta.modal.service';
import {openModalView as openModalPrtView} from '../produto/produto.modal.service';
import {openNfPagamentoModalView} from './nf.modal.service';

export default class NfEditController extends Controller {
  /*@ngInject*/
  constructor($window, $scope, $stateParams, $timeout, $state, toastr, usSpinnerService,
    NfService, ContaService, ProdutoService, Modal) {
    super($window, $scope, toastr, usSpinnerService);

    this.id = $stateParams.id;
    this.$state = $state;
    this.$timeout = $timeout;
    this.Modal = Modal;
    this.ProdutoService = ProdutoService;
    this.ContaService = ContaService;
    this.NfService = NfService;
    this.NfService.loadDomain().then(domain => {
      this.status = domain.status;
      this.parcelas = domain.parcelaPag;
      this.bandeiras = domain.bandeiraPag;
      this.tipos = domain.tipoPag;
      this.tipoNota = domain.tipoNota;
      this.ocorrencias = ['Mês'];
      this.numeroOcorrencia = '1;2;3;4;5;6;7;8;9;10;11;12'.split(';');
      this.init();
    });
  }

  init() {
    this.format = 'dd/MM/yyyy';
    this.col = true;
    if(this.id) {
      this.NfService.loadNf({ id: this.id })
        .then(this.callbackLoadNf())
        .finally(() => {
          this.usSpinnerService.stop('spinner-1');
        });
    } else {
      this.nf = this.createNf();
      this.NfService.setNotaFiscal(this.nf);
      this.$timeout(() => {
        this.usSpinnerService.stop('spinner-1');
      }, 100);
    }
  }

  callbackLoadNf() {
    return nf => {
      this.nf = nf;
      this.nf.dataEmissao = new Date(this.nf.dataEmissao);
      this.nf.dataVencimento = new Date(this.nf.dataVencimento);
      if(this.nf.tipoNota === 'Manual') {
        this.col = false;
      }

      try {
        if(this.nf.numero) {
          this.nf.numero = addZero(this.nf.numero, 6);
        }
        if(this.nf.serie) {
          this.nf.serie = addZero(this.nf.serie, 3);
        }
      } catch(err) {
        console.log(err);
      }

      if(this.nf.oportunidade) {
        this.nf.oportunidade.nome = `${this.nf.oportunidade.nome} - ${this.nf.oportunidade.fase}`;
      }
    };
  }

  createNf() {
    return {
      status: 'Cadastrada',
      tipoNota: 'Manual',
      ocorrencia: 'Mes',
      numeroOcorrencia: '1',
      produtos: [],
      valorTotal: 0,
      valorVenda: 0,
      valorDesconto: 0,
      valorFrete: 0,
      valorOutro: 0,
      valorSeguro: 0,
      valorIcms: 0,
      valorIpi: 0,
      valorPis: 0,
      valorCofins: 0,
    };
  }

  openFindConta(what) {
    let getParam = () => {
      if(typeof this.nf.emitente === 'string') {
        return this.nf.emitente;
      }
      return null;
    };
    let modalCtl = openModalAccView(this.Modal, getParam());
    modalCtl.onSelectAcc = acc => {
      if(what === 'emit') {
        this.nf.emitente = acc;
      } else if(what === 'dest') {
        this.nf.destinatario = acc;
      }
      modalCtl.dismiss();
    };
    modalCtl.onClose = () => {
      modalCtl.dismiss();
    };
    this.ContaService.setModalCtl(modalCtl);
  }

  findAcc(search, what) {
    if(search && search.length == 0) {
      if(what === 'emit') {
        this.nf.emitente = null;
      } else if(what === 'dest') {
        this.nf.destinatario = null;
      }
    } else if(search && search.length < 3) {
      return;
    }
    return this.ContaService.loadContaList({
      search,
    })
    .then(contas => {
      if(contas && contas.length == 1) {
        if(search === contas[0].nome) {
          if(what === 'emit') {
            this.nf.emitente = contas[0];
          } else if(what === 'dest') {
            this.nf.destinatario = contas[0];
          }
        }
      }
      return contas;
    })
    .finally(() => {
      this.usSpinnerService.stop('spinner-1');
    });
  }

  isEdit() {
    if(!this.nf) {
      return false;
    }

    if(this.nf.tipoNota === 'Manual') {
      return this.nf.status === 'Cadastrada';
    }
    return false;
  }

  isEditInfo() {
    if(!this.nf) {
      return false;
    }
    return this.nf.status === 'Cadastrada' || this.nf.status === 'Pendente';
  }

  addSubProduto() {
    let modalCtl = openModalPrtView(this.Modal, {
      uso: ['01 - Matéria-Prima', '00 - Mercadoria para Revenda']
    });
    modalCtl.onSelectProduct = prod => {
      console.log('onSelectProduct()', prod);
      this.col = false;
      prod.forEach(produto => {
        let result = this.nf.produtos.filter(item => item.produto._id === produto._id);
        if(result.length == 0) {
          this.nf.produtos.push({
            produto,
            nome: produto.nome,
            quantidade: 1,
            unidade: produto.unidade.split(' ')[0],
            categoria: produto.categoria,
            valor: 0,
            valorTotal: 0,
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

  calc() {
    this.nf.valorTotal = 0;

    if(this.nf.produtos && this.nf.produtos.length) {
      this.nf.valorVenda = 0;
      this.nf.produtos.forEach(prod => {
        prod.valorTotal = prod.valor * prod.quantidade;
        this.nf.valorVenda += prod.valorTotal;
      });
    }

    this.nf.valorTotal = this.nf.valorVenda
      + this.nf.valorFrete + this.nf.valorOutro
      + this.nf.valorSeguro - this.nf.valorDesconto;
  }

  saveNf(form) {
    if(form.$invalid) {
      return;
    }
    console.log(this.nf);

    if(this.nf.status === 'Faturada' && (!this.nf.pagamentos || this.nf.pagamentos.length == 0)) {
      this.toastr.warning('É necessário informar um pagamento', 'Faturamento');
      this.nf.status = 'Pendente';
      return;
    }
    this.usSpinnerService.spin('spinner-1');
    this.NfService.saveNf(this.nf)
      .then(() => {
        this.toastr.success('Nota fiscal salva com sucesso',
        `${this.nf.numero} ${this.nf.titulo}`);
        this.$state.go('nfs');
      })
      .catch(this.callbackError(form))
      .finally(() => {
        this.usSpinnerService.stop('spinner-1');
      });
  }

  pagamentos() {
    let modalCtl = openNfPagamentoModalView(this.Modal, {
      parcelas: this.parcelas, bandeiras: this.bandeiras, tipos: this.tipos});
    modalCtl.setPagamento = pagamentos => {
      console.log('setPagamento()', pagamentos);
      this.nf.pagamentos = pagamentos;
      modalCtl.dismiss();
    };
    modalCtl.onClose = () => {
      modalCtl.dismiss();
    };
    this.NfService.setModalCtl(modalCtl);
  }
}
