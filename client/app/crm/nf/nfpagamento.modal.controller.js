'use strict';
import moment from 'moment';

export default class NfPagamentoModalController {
  /*@ngInject*/
  constructor($state, $scope, toastr, usSpinnerService, NfService, ProdutoService) {
    this.toastr = toastr;
    this.$state = $state;
    this.NfService = NfService;
    this.usSpinnerService = usSpinnerService;

    this.ProdutoService = ProdutoService;
    this.despesas = [];
    this.receitas = [];
    this.loadPlanAccount('#FLXCX-D', this.despesas);
    this.loadPlanAccount('#FLXCX-R', this.receitas);
    this.init($scope);
  }

  loadPlanAccount(codigo, list) {
    this.ProdutoService.loadProdutoList({ search: codigo}).then(produtos => {
      console.log(codigo, produtos);
      if(produtos.length == 0) {
        return;
      }
      this.ProdutoService.loadProduto({id: produtos[0]._id}).then(produto => {
        console.log(codigo, produto);
        if(produto) {
          produto.subproduto.forEach(item => {
            list.push(item.produto);
          });
        }
      });
    });
  }

  init($scope) {
    this.format = 'dd/MM/yyyy';
    this.tipos = this.NfService.getModalCtl().params.tipos;
    this.parcelas = this.NfService.getModalCtl().params.parcelas;
    this.bandeiras = this.NfService.getModalCtl().params.bandeiras;
    this.valorTotal = this.NfService.getNotaFiscal().valorTotal;
    this.dataVencimento = this.NfService.getNotaFiscal().dataVencimento;
    this.oportunidade = this.NfService.getNotaFiscal().oportunidade;
    if(this.dataVencimento) {
      this.dataVencimento = moment().toDate();
    }

    this.tipoPagamento = this.tipos[0];
    this.parcela = this.parcelas[0];
    this.bandeira = this.bandeiras[0];

    $scope.$watch('ctl.tipoPagamento', () => {
      this.parcela = '1 - Àvista';
    });
  }

  setPagamento() {
    let pagList = [];
    let pa = Number(this.parcela.substring(0, 1));
    let pag = this.createPagamentoParcela(
      pa, this.dataVencimento, this.dataPagamento, this.valorTotal);
    pagList.push(pag);

    this.NfService.getModalCtl().setPagamento(pagList);
  }

  gerar() {
    let pagList = [];
    let pa = Number(this.parcela.substring(0, 1));
    if(this.parcela === '1 - Àvista') {
      let pag = this.createPagamentoParcela(
        pa, moment().toDate(), this.dataPagamento, this.valorTotal);
      pagList.push(pag);
    } else {
      let data = this.dataVencimento ? moment(this.dataVencimento) : moment();
      let valor = this.valorTotal / pa;
      for(var i = 0; i < pa; i++) {
        let p = this.createPagamentoParcela(
          i + 1, data.toDate(), undefined, valor);
        pagList.push(p);
        data = data.add(1, 'month');
      }
    }

    this.NfService.getModalCtl().setPagamento(pagList);
  }
  createPagamentoParcela(parcela, dataVencimento, dataPagamento, valor) {
    return {
      tipo: this.tipoPagamento,
      dataCriacao: moment().toDate(),
      parcela,
      planoConta: this.planoConta,
      dataVencimento,
      dataPagamento,
      valor,
      bandeira: this.isCartao() ? this.bandeira : undefined,
      autorizacao: this.isCartao() ? this.autorizacao : undefined,
      documento: this.documento ? this.documento : undefined,
    };
  }
  close() {
    this.NfService.getModalCtl().onClose();
  }

  isCartao() {
    return this.isCartaoCredito() || this.isCartaoDebito();
  }
  isCartaoCredito() {
    return this.tipoPagamento === 'Cartão Crédito';
  }
  isCartaoDebito() {
    return this.tipoPagamento === 'Cartão Débito';
  }
  isParcela() {
    if(this.isCartaoCredito()) {
      return true;
    }
    return false;
  }
}
