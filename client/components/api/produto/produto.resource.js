export function ProdutoResource($resource) {
  'ngInject';
  return $resource('/api/product/:id/:controller', {
    id: '@_id'
  }, {
    update: { method: 'PUT' },
    domain: {
      method: 'GET',
      params: {
        id: 'domain'
      }
    },
    catalogo: {
      method: 'GET',
      isArray: true,
      params: {
        id: 'catalog'
      }
    },
  });
}
