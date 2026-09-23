import '../layout.js';
import { $, param } from '../utils.js';
import { renderComprar } from '../views/comprar.js';

renderComprar($('#conteudo'), param('id'));
