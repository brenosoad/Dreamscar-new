import '../layout.js';
import { $, param } from '../utils.js';
import { renderPost } from '../views/post.js';

renderPost($('#conteudo'), param('slug'));
