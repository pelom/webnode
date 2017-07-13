//import angular from 'angular';
export function BancoResource($resource) {
  'ngInject';
  return $resource('/api/bank/:id/:controller', {
    id: '@_id'
  }, {
    update: { method: 'PUT' },
    domain: {
      method: 'GET',
      params: {
        id: 'domain'
      }
    },
    accountPayable: {
      method: 'GET',
      isArray: true,
      params: {
        id: 'accountPayable'
      }
    },
    operation: {
      method: 'PUT',
      params: {
        controller: 'operation'
      }
    }
  });
}
