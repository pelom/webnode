import HtmlTemplate from './html.template';
import config from '../../config/environment';
export default class ProductPriceHtmlTemplate extends HtmlTemplate {
  constructor(user, product) {
    super();
    this.subject = 'Orçamento';
    this.data = {
      title: `${user.empresa}`,
      message: 'Itens do orçamento',
      copymark: 'ARL 2010-2017',
      product,
      itens: product.subproduto,
      url: config.url
    };
  }
  getTemplate() {
    return this.pathResolve('./budget.html');
  }
}
