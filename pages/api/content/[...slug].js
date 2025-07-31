import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { slug } = req.query;
  
  // Solo permitir método GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // slug será un array como ['estructuras', 'arrays']
    const [category, section] = slug;
    
    if (!category || !section) {
      return res.status(400).json({ error: 'Category and section are required' });
    }
    
    // Construir la ruta del archivo markdown
    const filePath = path.join(process.cwd(), 'src', 'content', 'aprende', category, `${section}.md`);
    
    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    // Leer el contenido del archivo
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Devolver el contenido
    res.status(200).json({ 
      content,
      category,
      section,
      source: 'markdown'
    });
    
  } catch (error) {
    console.error('Error reading markdown content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 