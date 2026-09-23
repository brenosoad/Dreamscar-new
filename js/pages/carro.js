import '../layout.js';
import { $, param } from '../utils.js';
import { renderCarro } from '../views/carro.js';

renderCarro($('#conteudo'), param('id'));
