const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const tmp = require('tmp');
const { exec } = require('child_process');
const util = require('util');
const Joi = require('joi');

const { runQuery, getQuery, allQuery } = require('../config/database');
const { requireAuth, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const execAsync = util.promisify(exec);

// Configuración de límites de ejecución
const EXECUTION_CONFIG = {
  timeLimit: 5, // segundos
  memoryLimit: 128, // MB
  maxOutputSize: 1024 * 1024, // 1MB
  allowedLanguages: ['cpp', 'c', 'python', 'java'],
  tempDir: path.join(__dirname, '../temp/code')
};

// Asegurar que el directorio temporal existe
fs.ensureDirSync(EXECUTION_CONFIG.tempDir);

// Esquemas de validación
const exerciseSchema = Joi.object({
  id: Joi.string().required(),
  page_id: Joi.string().allow(''),
  title: Joi.string().required(),
  description: Joi.string().required(),
  starter_code: Joi.string().allow(''),
  solution_code: Joi.string().allow(''),
  test_cases: Joi.array().items(Joi.object({
    input: Joi.string().required(),
    expected_output: Joi.string().required(),
    description: Joi.string().allow('')
  })).required(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').default('easy'),
  time_limit: Joi.number().integer().min(1).max(30).default(5),
  memory_limit: Joi.number().integer().min(32).max(512).default(128)
});

const submissionSchema = Joi.object({
  exercise_id: Joi.string().required(),
  code: Joi.string().required(),
  language: Joi.string().valid(...EXECUTION_CONFIG.allowedLanguages).default('cpp')
});

// === UTILIDADES DE EJECUCIÓN ===

// Función para ejecutar código de forma segura
async function executeCode(code, language, testCases, timeLimit = 5, memoryLimit = 128) {
  const sessionId = uuidv4();
  const workDir = path.join(EXECUTION_CONFIG.tempDir, sessionId);
  
  try {
    // Crear directorio de trabajo temporal
    await fs.ensureDir(workDir);

    const results = [];
    let totalExecutionTime = 0;

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const result = await executeTestCase(
        code, 
        language, 
        testCase, 
        workDir, 
        timeLimit, 
        memoryLimit,
        i
      );
      
      results.push(result);
      totalExecutionTime += result.executionTime || 0;

      // Si hay error de compilación, no continuar con más test cases
      if (result.status === 'compile_error') {
        break;
      }
    }

    const finalStatus = determineOverallStatus(results);
    
    return {
      status: finalStatus,
      testResults: results,
      totalExecutionTime,
      summary: generateResultSummary(results)
    };

  } catch (error) {
    console.error('Error ejecutando código:', error);
    return {
      status: 'runtime_error',
      error: 'Error interno durante la ejecución',
      testResults: [],
      totalExecutionTime: 0
    };
  } finally {
    // Limpiar directorio temporal
    try {
      await fs.remove(workDir);
    } catch (err) {
      console.error('Error limpiando directorio temporal:', err);
    }
  }
}

async function executeTestCase(code, language, testCase, workDir, timeLimit, memoryLimit, index) {
  const startTime = Date.now();
  
  try {
    // Generar nombres de archivos
    const sourceFile = getSourceFileName(language, index);
    const executableFile = getExecutableFileName(language, index);
    const inputFile = `input_${index}.txt`;
    const outputFile = `output_${index}.txt`;

    const sourceFilePath = path.join(workDir, sourceFile);
    const inputFilePath = path.join(workDir, inputFile);
    const outputFilePath = path.join(workDir, outputFile);

    // Escribir código fuente
    await fs.writeFile(sourceFilePath, code);
    
    // Escribir entrada del test case
    await fs.writeFile(inputFilePath, testCase.input);

    // Compilar (si es necesario)
    const compileResult = await compileCode(language, sourceFile, executableFile, workDir);
    if (!compileResult.success) {
      return {
        status: 'compile_error',
        error: compileResult.error,
        executionTime: Date.now() - startTime,
        input: testCase.input,
        expectedOutput: testCase.expected_output
      };
    }

    // Ejecutar código
    const runResult = await runCode(
      language, 
      executableFile, 
      inputFilePath, 
      outputFilePath, 
      workDir, 
      timeLimit,
      memoryLimit
    );

    if (!runResult.success) {
      return {
        status: runResult.timeout ? 'time_limit' : 'runtime_error',
        error: runResult.error,
        executionTime: Date.now() - startTime,
        input: testCase.input,
        expectedOutput: testCase.expected_output
      };
    }

    // Leer salida
    let actualOutput = '';
    try {
      actualOutput = await fs.readFile(outputFilePath, 'utf8');
    } catch (err) {
      // Si no hay archivo de salida, considerar output vacío
      actualOutput = '';
    }

    // Comparar resultados
    const expectedOutput = testCase.expected_output.trim();
    const actualOutputTrimmed = actualOutput.trim();
    
    const isCorrect = expectedOutput === actualOutputTrimmed;

    return {
      status: isCorrect ? 'accepted' : 'wrong_answer',
      input: testCase.input,
      expectedOutput: expectedOutput,
      actualOutput: actualOutputTrimmed,
      executionTime: Date.now() - startTime,
      correct: isCorrect
    };

  } catch (error) {
    return {
      status: 'runtime_error',
      error: error.message,
      executionTime: Date.now() - startTime,
      input: testCase.input,
      expectedOutput: testCase.expected_output
    };
  }
}

function getSourceFileName(language, index) {
  const extensions = {
    'cpp': '.cpp',
    'c': '.c',
    'python': '.py',
    'java': '.java'
  };
  return `solution_${index}${extensions[language] || '.txt'}`;
}

function getExecutableFileName(language, index) {
  if (language === 'python') return `solution_${index}.py`;
  if (language === 'java') return `Solution_${index}`;
  return `solution_${index}`;
}

async function compileCode(language, sourceFile, executableFile, workDir) {
  try {
    let compileCommand;
    
    switch (language) {
      case 'cpp':
        compileCommand = `g++ -std=c++17 -O2 -Wall -o "${executableFile}" "${sourceFile}"`;
        break;
      case 'c':
        compileCommand = `gcc -std=c11 -O2 -Wall -o "${executableFile}" "${sourceFile}"`;
        break;
      case 'java':
        compileCommand = `javac "${sourceFile}"`;
        break;
      case 'python':
        // Python no necesita compilación
        return { success: true };
      default:
        return { success: false, error: 'Lenguaje no soportado' };
    }

    const { stderr } = await execAsync(compileCommand, { 
      cwd: workDir,
      timeout: 10000 // 10 segundos para compilar
    });

    if (stderr && stderr.trim()) {
      return { success: false, error: stderr };
    }

    return { success: true };

  } catch (error) {
    return { 
      success: false, 
      error: error.stderr || error.message || 'Error de compilación desconocido' 
    };
  }
}

async function runCode(language, executableFile, inputFile, outputFile, workDir, timeLimit, memoryLimit) {
  try {
    let runCommand;
    
    switch (language) {
      case 'cpp':
      case 'c':
        runCommand = `timeout ${timeLimit}s ./"${executableFile}" < "${inputFile}" > "${outputFile}"`;
        break;
      case 'python':
        runCommand = `timeout ${timeLimit}s python3 "${executableFile}" < "${inputFile}" > "${outputFile}"`;
        break;
      case 'java':
        const className = executableFile;
        runCommand = `timeout ${timeLimit}s java "${className}" < "${inputFile}" > "${outputFile}"`;
        break;
      default:
        return { success: false, error: 'Lenguaje no soportado para ejecución' };
    }

    await execAsync(runCommand, { 
      cwd: workDir,
      timeout: (timeLimit + 1) * 1000 // timeout adicional para el comando
    });

    return { success: true };

  } catch (error) {
    const isTimeout = error.code === 'ENOENT' || error.signal === 'SIGTERM' || 
                     error.message.includes('timeout') || error.killed;
    
    return { 
      success: false, 
      timeout: isTimeout,
      error: isTimeout ? 'Tiempo límite excedido' : (error.stderr || error.message)
    };
  }
}

function determineOverallStatus(results) {
  if (results.length === 0) return 'runtime_error';
  
  const hasCompileError = results.some(r => r.status === 'compile_error');
  if (hasCompileError) return 'compile_error';
  
  const hasRuntimeError = results.some(r => r.status === 'runtime_error');
  if (hasRuntimeError) return 'runtime_error';
  
  const hasTimeLimit = results.some(r => r.status === 'time_limit');
  if (hasTimeLimit) return 'time_limit';
  
  const hasWrongAnswer = results.some(r => r.status === 'wrong_answer');
  if (hasWrongAnswer) return 'wrong_answer';
  
  return 'accepted';
}

function generateResultSummary(results) {
  const total = results.length;
  const passed = results.filter(r => r.status === 'accepted').length;
  
  return {
    total,
    passed,
    failed: total - passed,
    percentage: total > 0 ? Math.round((passed / total) * 100) : 0
  };
}

// === RUTAS DE EJERCICIOS ===

// Obtener todos los ejercicios
router.get('/exercises', optionalAuth, async (req, res) => {
  try {
    const { page_id, difficulty } = req.query;
    
    let query = 'SELECT id, page_id, title, description, difficulty, time_limit, memory_limit, created_at FROM code_exercises WHERE 1=1';
    let params = [];

    if (page_id) {
      query += ' AND page_id = ?';
      params.push(page_id);
    }

    if (difficulty) {
      query += ' AND difficulty = ?';
      params.push(difficulty);
    }

    query += ' ORDER BY created_at DESC';

    const exercises = await allQuery(query, params);

    // Si el usuario está autenticado, agregar información de progreso
    if (req.user) {
      for (let exercise of exercises) {
        const submission = await getQuery(`
          SELECT status, submitted_at 
          FROM code_submissions 
          WHERE user_id = ? AND exercise_id = ? AND status = 'accepted'
          ORDER BY submitted_at DESC 
          LIMIT 1
        `, [req.user.id, exercise.id]);

        exercise.solved = !!submission;
        if (submission) {
          exercise.solvedAt = submission.submitted_at;
        }
      }
    }

    res.json(exercises);

  } catch (error) {
    console.error('Error al obtener ejercicios:', error);
    res.status(500).json({ error: 'Error al cargar ejercicios' });
  }
});

// Obtener un ejercicio específico
router.get('/exercises/:exerciseId', optionalAuth, async (req, res) => {
  try {
    const { exerciseId } = req.params;

    const exercise = await getQuery(`
      SELECT id, page_id, title, description, starter_code, difficulty, 
             time_limit, memory_limit, created_at
      FROM code_exercises 
      WHERE id = ?
    `, [exerciseId]);

    if (!exercise) {
      return res.status(404).json({ error: 'Ejercicio no encontrado' });
    }

    // Obtener test cases (solo mostrar entrada y descripción, no la salida esperada)
    const testCases = await getQuery('SELECT test_cases FROM code_exercises WHERE id = ?', [exerciseId]);
    const publicTestCases = JSON.parse(testCases.test_cases || '[]').map(tc => ({
      input: tc.input,
      description: tc.description || 'Test case'
    }));

    exercise.testCases = publicTestCases;

    // Si el usuario está autenticado, agregar información de submissions
    if (req.user) {
      const userSubmissions = await allQuery(`
        SELECT id, status, submitted_at, execution_time
        FROM code_submissions 
        WHERE user_id = ? AND exercise_id = ?
        ORDER BY submitted_at DESC
        LIMIT 10
      `, [req.user.id, exerciseId]);

      exercise.userSubmissions = userSubmissions;
      exercise.solved = userSubmissions.some(s => s.status === 'accepted');
    }

    res.json(exercise);

  } catch (error) {
    console.error('Error al obtener ejercicio:', error);
    res.status(500).json({ error: 'Error al cargar el ejercicio' });
  }
});

// === RUTAS DE SUBMISSIONS ===

// Enviar código para evaluación
router.post('/submit', requireAuth, async (req, res) => {
  try {
    const { error, value } = submissionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Datos de submission inválidos', 
        details: error.details.map(detail => detail.message) 
      });
    }

    const { exercise_id, code, language } = value;

    // Verificar que el ejercicio existe
    const exercise = await getQuery(`
      SELECT id, test_cases, time_limit, memory_limit 
      FROM code_exercises 
      WHERE id = ?
    `, [exercise_id]);

    if (!exercise) {
      return res.status(404).json({ error: 'Ejercicio no encontrado' });
    }

    // Crear submission en base de datos
    const submissionResult = await runQuery(`
      INSERT INTO code_submissions (user_id, exercise_id, code, language, status)
      VALUES (?, ?, ?, ?, 'pending')
    `, [req.user.id, exercise_id, code, language]);

    const submissionId = submissionResult.id;

    // Ejecutar código de forma asíncrona
    setImmediate(async () => {
      try {
        await runQuery(
          'UPDATE code_submissions SET status = ? WHERE id = ?',
          ['running', submissionId]
        );

        const testCases = JSON.parse(exercise.test_cases || '[]');
        const results = await executeCode(
          code,
          language,
          testCases,
          exercise.time_limit,
          exercise.memory_limit
        );

        // Actualizar submission con resultados
        await runQuery(`
          UPDATE code_submissions 
          SET status = ?, test_results = ?, execution_time = ?
          WHERE id = ?
        `, [
          results.status,
          JSON.stringify(results),
          results.totalExecutionTime,
          submissionId
        ]);

      } catch (execError) {
        console.error('Error ejecutando submission:', execError);
        await runQuery(
          'UPDATE code_submissions SET status = ?, test_results = ? WHERE id = ?',
          ['runtime_error', JSON.stringify({ error: 'Error interno de ejecución' }), submissionId]
        );
      }
    });

    res.status(202).json({
      message: 'Código enviado para evaluación',
      submissionId,
      status: 'pending'
    });

  } catch (error) {
    console.error('Error en submission:', error);
    res.status(500).json({ error: 'Error al procesar submission' });
  }
});

// Obtener estado de submission
router.get('/submissions/:submissionId', requireAuth, async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await getQuery(`
      SELECT s.*, e.title as exercise_title
      FROM code_submissions s
      JOIN code_exercises e ON s.exercise_id = e.id
      WHERE s.id = ? AND s.user_id = ?
    `, [submissionId, req.user.id]);

    if (!submission) {
      return res.status(404).json({ error: 'Submission no encontrada' });
    }

    // Parsear resultados de test si existen
    if (submission.test_results) {
      try {
        submission.test_results = JSON.parse(submission.test_results);
      } catch (err) {
        console.error('Error parsing test results:', err);
      }
    }

    res.json(submission);

  } catch (error) {
    console.error('Error al obtener submission:', error);
    res.status(500).json({ error: 'Error al cargar submission' });
  }
});

// Obtener historial de submissions del usuario
router.get('/submissions', requireAuth, async (req, res) => {
  try {
    const { exercise_id, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT s.id, s.exercise_id, s.language, s.status, s.execution_time, 
             s.submitted_at, e.title as exercise_title, e.difficulty
      FROM code_submissions s
      JOIN code_exercises e ON s.exercise_id = e.id
      WHERE s.user_id = ?
    `;
    let params = [req.user.id];

    if (exercise_id) {
      query += ' AND s.exercise_id = ?';
      params.push(exercise_id);
    }

    if (status) {
      query += ' AND s.status = ?';
      params.push(status);
    }

    query += ' ORDER BY s.submitted_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const submissions = await allQuery(query, params);

    res.json(submissions);

  } catch (error) {
    console.error('Error al obtener submissions:', error);
    res.status(500).json({ error: 'Error al cargar submissions' });
  }
});

// === RUTAS ADMINISTRATIVAS ===

// Crear nuevo ejercicio (solo admin)
router.post('/exercises', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { error, value } = exerciseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Datos de ejercicio inválidos', 
        details: error.details.map(detail => detail.message) 
      });
    }

    const { 
      id, page_id, title, description, starter_code, solution_code,
      test_cases, difficulty, time_limit, memory_limit 
    } = value;

    // Verificar que el ejercicio no existe
    const existing = await getQuery('SELECT id FROM code_exercises WHERE id = ?', [id]);
    if (existing) {
      return res.status(400).json({ error: 'Ya existe un ejercicio con ese ID' });
    }

    await runQuery(`
      INSERT INTO code_exercises (
        id, page_id, title, description, starter_code, solution_code,
        test_cases, difficulty, time_limit, memory_limit
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, page_id || null, title, description, starter_code || '', 
      solution_code || '', JSON.stringify(test_cases), difficulty, 
      time_limit, memory_limit
    ]);

    res.status(201).json({ message: 'Ejercicio creado exitosamente', id });

  } catch (error) {
    console.error('Error al crear ejercicio:', error);
    res.status(500).json({ error: 'Error al crear el ejercicio' });
  }
});

// Actualizar ejercicio (solo admin)
router.put('/exercises/:exerciseId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { exerciseId } = req.params;
    const { 
      title, description, starter_code, solution_code,
      test_cases, difficulty, time_limit, memory_limit 
    } = req.body;

    const exercise = await getQuery('SELECT id FROM code_exercises WHERE id = ?', [exerciseId]);
    if (!exercise) {
      return res.status(404).json({ error: 'Ejercicio no encontrado' });
    }

    await runQuery(`
      UPDATE code_exercises 
      SET title = ?, description = ?, starter_code = ?, solution_code = ?,
          test_cases = ?, difficulty = ?, time_limit = ?, memory_limit = ?
      WHERE id = ?
    `, [
      title, description, starter_code || '', solution_code || '',
      JSON.stringify(test_cases), difficulty, time_limit, memory_limit,
      exerciseId
    ]);

    res.json({ message: 'Ejercicio actualizado exitosamente' });

  } catch (error) {
    console.error('Error al actualizar ejercicio:', error);
    res.status(500).json({ error: 'Error al actualizar el ejercicio' });
  }
});

// Ver todas las submissions (solo admin)
router.get('/admin/submissions', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { exercise_id, user_id, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT s.*, u.username, e.title as exercise_title
      FROM code_submissions s
      JOIN users u ON s.user_id = u.id
      JOIN code_exercises e ON s.exercise_id = e.id
      WHERE 1=1
    `;
    let params = [];

    if (exercise_id) {
      query += ' AND s.exercise_id = ?';
      params.push(exercise_id);
    }

    if (user_id) {
      query += ' AND s.user_id = ?';
      params.push(user_id);
    }

    if (status) {
      query += ' AND s.status = ?';
      params.push(status);
    }

    query += ' ORDER BY s.submitted_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const submissions = await allQuery(query, params);

    res.json(submissions);

  } catch (error) {
    console.error('Error al obtener submissions admin:', error);
    res.status(500).json({ error: 'Error al cargar submissions' });
  }
});

module.exports = router; 