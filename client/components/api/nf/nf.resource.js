import angular from 'angular';
export function NfResource($resource) {
  'ngInject';
  return $resource('/api/invoice/:id/:controller', {
    id: '@_id'
  }, {
    update: { method: 'PUT' },
    domain: {
      method: 'GET',
      params: {
        id: 'domain'
      }
    },
    cashFlowInputOrigin: {
      method: 'GET',
      isArray: true,
      params: {
        id: 'cashFlowInputOrigin',
      }
    },
    upload: {
      method: 'POST',
      transformRequest: angular.identity,
      headers: { 'Content-Type': undefined },
      params: {
        id: 'upload'
      }
    }
  });
}
