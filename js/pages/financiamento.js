import '../layout.js';
import { param } from '../utils.js';
import { initFinanciamento } from '../views/financiamento.js';

initFinanciamento(document, param('carro'));
