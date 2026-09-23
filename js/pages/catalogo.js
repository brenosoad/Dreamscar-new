import '../layout.js';
import { initCatalog } from '../catalog.js';

initCatalog(document, {
  getQuery: () => new URLSearchParams(location.search),
  setQuery: (params) => {
    const qs = params.toString();
    history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
  },
});
