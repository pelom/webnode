'use strict';
import Controller from '../../account/controller';
import moment from 'moment';
moment.locale('pt-br');

export default class BancoFluxoCaixaController extends Controller {
  /*@ngInject*/
  constructor($window, $scope, toastr,
    BancoService, NfService, ProdutoService, usSpinnerService, Modal) {
    super($window, $scope, toastr, usSpinnerService);

    this.NfService = NfService;
    this.ProdutoService = ProdutoService;

    this.isPrevisao = false;
    this.cashFlow = [];
    let now = new Date();
    this.nowSelect = moment().format('MMMM');
    for(var i = 6; i < 12; i++) {
      let start = moment(new Date(now.getFullYear(), i, 1));
      let end = moment(start).endOf('month');
      let cel = {
        index: i - 6,
        mes: start.format('MMMM'),
        start, end,
      };
      this.cashFlow.push(cel);
    }

    this.receitas = [];
    this.loadPlanAccount('#FLXCX-R', planList => {
      let cells = [];
      planList.forEach(plan => {
        let celR = {
          nome: plan.nome,
          saidas: []
        };
        let celP = {
          nome: '',
          saidas: []
        };
        cells.push(celR);
        cells.push(celP);
        this.cashFlow.forEach(month => {
          this.findCash(month.start.toDate(), month.end.toDate(),
            'entrada', celR, celP, month.index);
        });
      });
      this.receitas = cells;
      console.log('receitas', this.receitas);
    });

    this.despesas = [];
    this.loadPlanAccount('#FLXCX-D', planList => {
      let cells = [];
      planList.forEach(plan => {
        let celR = {
          nome: plan.nome,
          saidas: []
        };
        let celP = {
          nome: '',
          saidas: []
        };
        cells.push(celR);
        cells.push(celP);
        this.cashFlow.forEach(month => {
          this.findCash(month.start.toDate(), month.end.toDate(),
            'saida', celR, celP, month.index);
        });
      });
      this.despesas = cells;
      console.log('despesas', this.despesas);
    });

    this.Modal = Modal;
    this.format = 'dd/MM/yyyy';

    this.colors = ['#000000', '#a94442', '#337ab7'];
    this.labels = [];
    this.options = {
      title: {
        display: true,
        text: `Contas a ${this.status}`
      },
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          fontColor: 'rgb(255, 99, 132)'
        }
      }
      //maintainAspectRatio: false,
    };
    this.data = [[], []];
    this.datasetOverride = [{
      label: 'Registros',
      borderWidth: 1,
      type: 'bar'
    },
    {
      label: 'Vencidos',
      borderWidth: 1,
      //hoverBackgroundColor: 'rgba(255,99,132,0.4)',
      //hoverBorderColor: 'rgba(255,99,132,1)',
      type: 'bar'
    },
    {
      label: 'Total',
      borderWidth: 1,
      //hoverBackgroundColor: 'rgba(255,99,132,0.4)',
      //hoverBorderColor: 'rgba(255,99,132,1)',
      type: 'bar'
    }];
  }

  loadPlanAccount(codigo, callback) {
    this.ProdutoService.loadProdutoList({ search: codigo}).then(produtos => {
      if(produtos.length == 0) {
        return;
      }
      this.ProdutoService.loadProduto({id: produtos[0]._id}).then(produto => {
        if(produto) {
          let list = [];
          produto.subproduto.forEach(item => {
            list.push(item.produto);
          });
          return callback(list);
        }
      });
    });
  }

  findCash(start, end, type, arrayR, arrayP, index) {
    this.NfService.cashFlowInputOrigin({
      start,
      end,
      type,
    })
      .then(result => {
        let isSet = () => result.length > 0 && arrayR.nome === result[0]._id[0];
        arrayR.saidas[index] = isSet() ? result[0].realizado : 0;
        arrayP.saidas[index] = isSet() ? result[0].previsao : 0;
      })
      .finally(() => {
        this.usSpinnerService.stop('spinner-1');
      });
  }

  isActive(status) {
    return status === this.status;
  }

}
