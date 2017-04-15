'use strict';
/* eslint no-sync: 0 */
import angular from 'angular';

class MenuItem {
  constructor(state, title, icon = undefined, show = true) {
    this.icon = icon;
    this.state = state;
    this.title = title;
    this.show = show;
    this.itemList = [];
  }
  addItem(item) {
    this.itemList.push(item);
  }
}
export class NavbarComponent {
  isCollapsed = true;
  constructor($rootScope, appConfig, Auth) {
    'ngInject';
    this.isLoggedIn = Auth.isLoggedInSync;
    this.isAdmin = Auth.isAdminSync;
    this.getCurrentUser = Auth.getCurrentUserSync;
    this.application = {show: true};
    $rootScope.$on('$stateChangeStart', (event, next) => {
      Auth.isLoggedIn(loggedIn => {
        if(isNaoEstaLogando(loggedIn)) {
          this.application = criarApplication();
        } else {
          let user = Auth.getCurrentUserSync();
          user.application.forEach(item => {
            item.show = true;
            item.modulos.forEach(m => {
              m.show = true;
            });
          });
          this.application = user.application[0];
        }
        console.log('next.name', next.name);
        if(next.name === 'signupvalid') {
          this.application.show = false;
        }
        /* else if(this.isAdmin()) {
          this.application = criarApplicationAdmin();
        } else {
          this.application = criarApplicationUser();
        }*/
        //configApplication(this.application, next);
      });
    });
    /*$rootScope.$on('newapp', (event, appli) => {
      console.log('newapp', appli);
      this.application = appli;
    });
    */
    let isNaoEstaLogando = function(logIn) {
      return !logIn;
    };
    let configApplication = function(application, next) {
      application.show = next.name !== 'signupvalid';
      return application;
    };
    let criarApplication = function() {
      return angular.copy(appConfig.applicationDefault);
    };
    /*let criarMenuLeftUser = function() {
      let menuItemList = [];
      //menuItemList.push(new MenuItem('main', 'Home'));
      return menuItemList;
    };
    let criarMenuLeftAdmin = function() {
      let menuItemList = [];
      menuItemList.push(new MenuItem('admin', 'Início'));
      return menuItemList;
    };
    let criarApplicationAdmin = function() {
      let application = criarApplication();
      application.menuRight = [];
      application.menuLeft = criarMenuLeftAdmin();
      return application;
    };
    let criarApplicationUser = function() {
      let application = criarApplication();
      application.menuRight = [];
      application.menuLeft = criarMenuLeftUser();
      return application;
    };*/
  }
  activeCollapsed() {
    this.isCollapsed = true;
  }
}

export default angular.module('directives.navbar', [])
  .component('navbar', {
    template: require('./navbar.html'),
    controller: NavbarComponent
  })
  .name;
