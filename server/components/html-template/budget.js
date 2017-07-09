import HtmlTemplate from './html.template';
import config from '../../config/environment';
export default class BudgetHtmlTemplate extends HtmlTemplate {
  constructor(title, budget) {
    super();
    this.subject = 'Orçamento';
    this.data = {
      title,
      message: 'Itens do orçamento',
      copymark: 'ARL 2010-2017',
      budget,
      itens: budget.itens,
      url: config.url
    };
  }
  getTemplate() {
    return this.pathResolve('./budget.html');
  }
}
