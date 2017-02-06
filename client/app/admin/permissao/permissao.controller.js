'use strict';
import angular from 'angular';
export default class PermissaoController {
  /*@ngInject*/
  constructor(PermissaoResource) {
    this.appList = [];
    // Use the User $resource to fetch all users
    this.appList = PermissaoResource.query();
    console.log(this.appList);
    angular.forEach(this.appList, function(item) {
      console.log(item);
    });

    this.sortType = 'name'; // set the default sort type
    this.sortReverse = false; // set the default sort order
    this.searchFish = ''; // set the default search/filter term

    // create the list of sushi rolls
    this.sushi = [{
        name: 'Cali Roll',
        fish: 'Crab',
        tastiness: 2
      },
      {
        name: 'Philly',
        fish: 'Tuna',
        tastiness: 4
      },
      {
        name: 'Tiger',
        fish: 'Eel',
        tastiness: 7
      },
      {
        name: 'Rainbow',
        fish: 'Variety',
        tastiness: 6
      }
    ];
  }
}
