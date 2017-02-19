export function AplicacaoResource($resource) {
  'ngInject';
  return $resource('/api/application/:id/:controller', {
    id: '@_id'
  }, {
    update: { method: 'PUT' },
    updateModulo: {
      method: 'PUT',
      params: {
        controller: 'modulo'
      }
    },
    createModulo: {
      method: 'POST',
      params: {
        controller: 'modulo'
      }
    }
  });
}
