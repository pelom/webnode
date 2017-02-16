export function AplicacaoResource($resource) {
  'ngInject';
  return $resource('/api/application/:id/:controller', {
    id: '@_id'
  }, {
    'update': { method: 'PUT' },
    modulo: {
      method: 'PUT',
      params: {
        controller: 'modulo'
      }
    }
  });
}
