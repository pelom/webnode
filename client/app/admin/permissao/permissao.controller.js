'use strict';
export default class PermissaoController {
  /*@ngInject*/
  constructor(PermissaoService, PermissaoResource, Modal) {
    this.PermissaoService = PermissaoService;
    this.appList = [];

    //var prom = PermissaoResource.query();
    //prom.$promise.then(data => {
    //  data.forEach(function(item) {
    //    console.log(item);
        /*item.applications.forEach(i=> {
          let keysList = Object.keys(i);
          keysList.forEach(k => {
            //console.log(k + '' + i[k]);
          });
        })*/
    //  });
      //console.log(Object.keys(data))
    //});
    this.appList = PermissaoResource.query();
    this.Modal = Modal;
    this.sortType = 'nome'; // set the default sort type
    this.sortReverse = false; // set the default sort order
    this.searchFish = ''; // set the default search/filter term
  }

  openMod(id, nome) {
    console.log(id, nome);
    var del = this.Modal.confirm.delete(function() {
      console.log('DELETE');
    });
    del(nome);
  }

  createApp() {
    console.log(this.PermissaoService);
    return this.PermissaoService.createApp({
      nome: 'Application'
    })
    .then(() => {
      console.log('OK');
    })
    .catch(err => {
      console.log('Ex:', err);
    });
  }
}
