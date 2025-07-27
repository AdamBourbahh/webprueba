const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs-extra');

const DB_PATH = path.join(__dirname, '..', 'database', 'cpc.db');

// Asegurar que el directorio de la base de datos existe
fs.ensureDirSync(path.dirname(DB_PATH));

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err.message);
  } else {
    console.log('📦 Conectado a la base de datos SQLite');
  }
});

// Función para ejecutar queries de forma asíncrona
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

const getQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

const allQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Inicializar tablas
async function initDatabase() {
  try {
    // Tabla de usuarios
    await runQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'student' CHECK(role IN ('student', 'admin')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        is_active BOOLEAN DEFAULT 1
      )
    `);

    // Tabla de contenido (páginas y secciones)
    await runQuery(`
      CREATE TABLE IF NOT EXISTS content_pages (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        order_index INTEGER DEFAULT 0,
        category_id TEXT,
        is_published BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de secciones de contenido
    await runQuery(`
      CREATE TABLE IF NOT EXISTS content_sections (
        id TEXT PRIMARY KEY,
        page_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        content_type TEXT DEFAULT 'markdown' CHECK(content_type IN ('markdown', 'html')),
        order_index INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (page_id) REFERENCES content_pages (id) ON DELETE CASCADE
      )
    `);

    // Tabla de categorías de navegación
    await runQuery(`
      CREATE TABLE IF NOT EXISTS navigation_categories (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        order_index INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de progreso de usuarios
    await runQuery(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        page_id TEXT NOT NULL,
        section_id TEXT,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        progress_data JSON,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (page_id) REFERENCES content_pages (id) ON DELETE CASCADE,
        UNIQUE(user_id, page_id, section_id)
      )
    `);

    // Tabla de ejercicios de código
    await runQuery(`
      CREATE TABLE IF NOT EXISTS code_exercises (
        id TEXT PRIMARY KEY,
        page_id TEXT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        starter_code TEXT,
        solution_code TEXT,
        test_cases JSON NOT NULL,
        difficulty TEXT DEFAULT 'easy' CHECK(difficulty IN ('easy', 'medium', 'hard')),
        time_limit INTEGER DEFAULT 5,
        memory_limit INTEGER DEFAULT 128,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (page_id) REFERENCES content_pages (id) ON DELETE SET NULL
      )
    `);

    // Tabla de submissions de código
    await runQuery(`
      CREATE TABLE IF NOT EXISTS code_submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        exercise_id TEXT NOT NULL,
        code TEXT NOT NULL,
        language TEXT DEFAULT 'cpp',
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'running', 'accepted', 'wrong_answer', 'time_limit', 'runtime_error', 'compile_error')),
        test_results JSON,
        execution_time REAL,
        memory_used INTEGER,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
        FOREIGN KEY (exercise_id) REFERENCES code_exercises (id) ON DELETE CASCADE
      )
    `);

    // Tabla de archivos subidos
    await runQuery(`
      CREATE TABLE IF NOT EXISTS uploaded_files (
        id TEXT PRIMARY KEY,
        original_name TEXT NOT NULL,
        filename TEXT NOT NULL,
        file_path TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        uploaded_by INTEGER,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uploaded_by) REFERENCES users (id) ON DELETE SET NULL
      )
    `);

    // Crear índices para optimización
    await runQuery(`CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id)`);
    await runQuery(`CREATE INDEX IF NOT EXISTS idx_content_sections_page ON content_sections(page_id)`);
    await runQuery(`CREATE INDEX IF NOT EXISTS idx_code_submissions_user ON code_submissions(user_id)`);
    await runQuery(`CREATE INDEX IF NOT EXISTS idx_code_submissions_exercise ON code_submissions(exercise_id)`);

    // Crear usuario admin por defecto si no existe
    const adminExists = await getQuery(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      ['admin', 'admin@cpc.ugr.es']
    );

    if (!adminExists) {
      const bcrypt = require('bcryptjs');
      const adminPassword = await bcrypt.hash('admin123', 10);
      
      await runQuery(`
        INSERT INTO users (username, email, password_hash, role)
        VALUES (?, ?, ?, ?)
      `, ['admin', 'admin@cpc.ugr.es', adminPassword, 'admin']);
      
      console.log('👤 Usuario admin creado (admin/admin123)');
    }

    console.log('✅ Estructura de base de datos verificada');
    
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    throw error;
  }
}

module.exports = {
  db,
  runQuery,
  getQuery,
  allQuery,
  initDatabase
}; 