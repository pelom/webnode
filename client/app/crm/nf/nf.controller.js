'use strict';
import angular from 'angular';
import addZero from 'add-zero';
import Controller from '../../account/controller';
import moment from 'moment';
moment.locale('pt-br');
export default class NfController extends Controller {
  /*@ngInject*/
  constructor($window, $scope, toastr, NfService, usSpinnerService) {
    super($window, $scope, toastr, usSpinnerService);

    this.dataInicio = moment().startOf('month')
      .toDate();
    this.dataFim = moment().endOf('month')
      .toDate();
    this.format = 'dd/MM/yyyy';
    this.NfService = NfService;
    this.NfService.loadNfList({
      start: this.dataInicio,
      end: this.dataFim,
    })
    .then(notas => {
      this.notas = notas;
      this.notas.forEach(nf => {
        if(nf.numero) {
          nf.numero = addZero(nf.numero, 6);
        }
        if(nf.serie) {
          nf.serie = addZero(nf.serie, 3);
        }
      });
    })
    .catch(err => {
      console.log('Ex:', err);
    })
    .finally(() => {
      usSpinnerService.stop('spinner-1');
    });
    this.status = '';
    let mapTypeFile = new Map();
    mapTypeFile.set('text/csv', 'text/csv');
    mapTypeFile.set('text/xml', 'text/xml');

    $scope.$watch('ctl.buffer', () => {
      console.log(this.buffer);
      if(this.buffer && !mapTypeFile.get(this.buffer.type)) {
        this.toastr.info('Selecione arquivo no formato XML ou CSV',
         `Formato do arquivo inválido ${this.buffer.type}`);
        this.buffer = null;
        return;
      }

      if(this.buffer && this.buffer.size >= 1024 * 1024 * 2) {
        this.toastr.info('O arquivo selecionado excede a capacidade de 2MB',
         'Tamanho do arquivo inválido');
        this.buffer = null;
        return;
      }

      if(this.buffer) {
        const data = new FormData();
        data.append('file', this.buffer);

        this.usSpinnerService.spin('spinner-1');
        this.NfService.uploadFile(data)
          .then(() => {
            console.log('Ok');
          })
          .finally(() => {
            this.usSpinnerService.stop('spinner-1');
          });
      }
    });
  }

  findNfStatus(status) {
    this.status = status;
    this.usSpinnerService.spin('spinner-1');
    this.NfService.loadNfList({
      status: this.status,
      start: this.dataInicio,
      end: this.dataFim,
    })
    .then(notas => {
      this.notas = notas;
      this.notas.forEach(nf => {
        if(nf.numero) {
          nf.numero = addZero(nf.numero, 6);
        }
        if(nf.serie) {
          nf.serie = addZero(nf.serie, 3);
        }
      });
    })
    .catch(err => {
      console.log('Ex:', err);
    })
    .finally(() => {
      this.usSpinnerService.stop('spinner-1');
    });
  }

  isActive(status) {
    return status === this.status;
  }
}
