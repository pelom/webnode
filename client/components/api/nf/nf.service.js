'use strict';
import angular from 'angular';
export function NfService(NfResource, Util) {
  'ngInject';
  let safeCb = Util.safeCb;
  let cadastradas = 0;
  let pendentes = 0;
  let faturadas = 0;
  let canceladas = 0;

  let nfList = [];
  let notaFiscal;
  let modalCtl;
  let produtoService = {
    getNotaFiscal() {
      return notaFiscal;
    },
    getCadastradas() {
      return cadastradas;
    },
    getPendentes() {
      return pendentes;
    },
    getFaturadas() {
      return faturadas;
    },
    getCanceladas() {
      return canceladas;
    },
    getModalCtl() {
      return modalCtl;
    },
    setNotaFiscal(nota) {
      notaFiscal = nota
    },
    setModalCtl(modCtl) {
      modalCtl = modCtl;
    },
    cashFlowInputOrigin(query, callback) {
      return NfResource.cashFlowInputOrigin(query, function(data) {
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    loadDomain(callback) {
      return NfResource.domain(function(data) {
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    loadNf(nf, callback) {
      return NfResource.get(nf, data => {
        notaFiscal = data;
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    loadNfList(query, callback) {
      return NfResource.query(query, function(data) {
        nfList = data;
        let countStatus = nfs => {
          cadastradas = 0;
          pendentes = 0;
          faturadas = 0;
          canceladas = 0;
          nfs.forEach(item => {
            if(item.status === 'Cadastrada') {
              cadastradas++;
            } else if(item.status === 'Pendente') {
              pendentes++;
            } else if(item.status === 'Faturada') {
              faturadas++;
            } else if(item.status === 'Cancelada') {
              canceladas++;
            }
          });
        };
        countStatus(nfList);
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    saveNf(newNf, callback) {
      let nf = {
        _id: newNf._id,
        titulo: newNf.titulo,
        dataVencimento: newNf.dataVencimento,
        status: newNf.status,
        descricao: newNf.descricao,
        tipoNota: newNf.tipoNota,
        emitente: newNf.emitente,
        destinatario: newNf.destinatario,
        produtos: newNf.produtos,
        ocorrencia: newNf.ocorrencia,
        numeroOcorrencia: newNf.numeroOcorrencia,

        serie: newNf.serie,
        numero: newNf.numero,
        dataEmissao: newNf.dataEmissao,
        valorTotal: newNf.valorTotal,
        valorVenda: newNf.valorVenda,
        valorDesconto: newNf.valorDesconto,
        valorFrete: newNf.valorFrete,
        valorOutro: newNf.valorOutro,
        valorSeguro: newNf.valorSeguro,
        valorIcms: newNf.valorIcms,
        valorPis: newNf.valorPis,
        valorIpi: newNf.valorIpi,
        valorCofins: newNf.valorCofins,

        pagamentos: newNf.pagamentos,
      };
      if(angular.isUndefined(nf._id)) {
        return NfResource.save(nf, function(data) {
          return safeCb(callback)(data);
        }, function(err) {
          console.log('Ex:', err);
          return safeCb(callback)(err);
        }).$promise;
      }
      return NfResource.update(nf, function(data) {
        return safeCb(callback)(data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    uploadFile(file, callback) {
      return NfResource.upload(file, function(data) {
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    }
  };
  return produtoService;
}
