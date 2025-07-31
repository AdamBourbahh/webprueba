// Servicio simplificado para frontend - Solo datos estáticos
import { staticContent } from '../data/staticContent.js';

// Funciones síncronas optimizadas
export const getStaticContent = () => staticContent;

export const getStaticPage = (pageId) => {
  const page = staticContent.pages.find(p => p.id === pageId);
  if (!page) {
    throw new Error(`Page ${pageId} not found`);
  }
  return page;
}; 