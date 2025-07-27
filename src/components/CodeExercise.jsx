import { useState, useEffect } from 'react';
import { Play, CheckCircle, XCircle, Clock, AlertCircle, Code, Trophy } from 'lucide-react';
import { codeService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CodeExercise = ({ exerciseId, embedded = false }) => {
  const { isAuthenticated } = useAuth();
  const [exercise, setExercise] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [submission, setSubmission] = useState(null);
  const [submissionId, setSubmissionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Cargar ejercicio
  useEffect(() => {
    loadExercise();
  }, [exerciseId]);

  // Polling para submissions en progreso
  useEffect(() => {
    if (submissionId && submission?.status === 'pending') {
      const interval = setInterval(checkSubmissionStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [submissionId, submission?.status]);

  const loadExercise = async () => {
    try {
      setLoading(true);
      const data = await codeService.getExercise(exerciseId);
      setExercise(data);
      setCode(data.starter_code || '');
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkSubmissionStatus = async () => {
    if (!submissionId) return;

    try {
      const data = await codeService.getSubmission(submissionId);
      setSubmission(data);

      if (data.status !== 'pending' && data.status !== 'running') {
        setSubmissionId(null); // Detener polling
      }
    } catch (err) {
      console.error('Error checking submission:', err);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      alert('Por favor escribe algo de código antes de enviar');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await codeService.submitCode({
        exercise_id: exerciseId,
        code: code,
        language: language
      });

      setSubmissionId(response.submissionId);
      setSubmission({ status: 'pending', id: response.submissionId });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'wrong_answer':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'time_limit':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'runtime_error':
      case 'compile_error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
      case 'running':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Code className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'accepted': 'Aceptado',
      'wrong_answer': 'Respuesta incorrecta',
      'time_limit': 'Tiempo límite excedido',
      'runtime_error': 'Error en tiempo de ejecución',
      'compile_error': 'Error de compilación',
      'pending': 'En cola...',
      'running': 'Ejecutando...'
    };
    return statusMap[status] || status;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'hard': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-warm-orange"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700 dark:text-red-300">Error: {error}</span>
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        Ejercicio no encontrado
      </div>
    );
  }

  return (
    <div className={`${embedded ? '' : 'max-w-6xl mx-auto p-6'} space-y-6`}>
      {/* Header del ejercicio */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-light text-black dark:text-white mb-2">
              {exercise.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                {exercise.difficulty}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                Límite: {exercise.time_limit}s, {exercise.memory_limit}MB
              </span>
              {exercise.solved && (
                <div className="flex items-center space-x-1 text-green-600">
                  <Trophy className="h-4 w-4" />
                  <span className="text-xs">Resuelto</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 font-light leading-relaxed">
            {exercise.description}
          </p>
        </div>

        {/* Test cases públicos */}
        {exercise.testCases && exercise.testCases.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-light text-black dark:text-white mb-3">
              Ejemplos:
            </h3>
            <div className="space-y-3">
              {exercise.testCases.map((testCase, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Entrada:
                      </div>
                      <pre className="text-sm bg-white dark:bg-gray-900 p-2 rounded border">
                        {testCase.input || '(sin entrada)'}
                      </pre>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Salida esperada:
                      </div>
                      <pre className="text-sm bg-white dark:bg-gray-900 p-2 rounded border">
                        {testCase.expected_output}
                      </pre>
                    </div>
                  </div>
                  {testCase.description && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {testCase.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Editor y resultados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor de código */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-light text-black dark:text-white">
              Tu código
            </h3>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-orange"
            >
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
            </select>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-96 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-orange font-mono text-sm resize-none"
            placeholder="Escribe tu código aquí..."
            spellCheck={false}
          />

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {isAuthenticated ? 'Listo para enviar' : 'Inicia sesión para guardar tu progreso'}
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting || !code.trim()}
              className="flex items-center space-x-2 bg-warm-orange hover:bg-warm-red text-white px-6 py-2 rounded-lg font-light transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Ejecutar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Resultados */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
          <h3 className="text-lg font-light text-black dark:text-white mb-4">
            Resultados
          </h3>

          {!submission && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <Code className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Ejecuta tu código para ver los resultados</p>
            </div>
          )}

          {submission && (
            <div className="space-y-4">
              {/* Estado general */}
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                {getStatusIcon(submission.status)}
                <div>
                  <div className="font-medium text-black dark:text-white">
                    {getStatusText(submission.status)}
                  </div>
                  {submission.execution_time && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Tiempo: {submission.execution_time.toFixed(2)}ms
                    </div>
                  )}
                </div>
              </div>

              {/* Resultados de test cases */}
              {submission.test_results && submission.test_results.testResults && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Test cases ({submission.test_results.summary?.passed || 0}/{submission.test_results.summary?.total || 0}):
                  </div>
                  {submission.test_results.testResults.map((result, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                      {getStatusIcon(result.status)}
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Test {index + 1}: {getStatusText(result.status)}
                      </span>
                      {result.executionTime && (
                        <span className="text-xs text-gray-500">
                          ({result.executionTime}ms)
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Errores */}
              {submission.test_results && submission.test_results.error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="text-sm text-red-700 dark:text-red-300 font-mono">
                    {submission.test_results.error}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Historial de submissions (solo si está autenticado) */}
      {isAuthenticated && exercise.userSubmissions && exercise.userSubmissions.length > 0 && (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
          <h3 className="text-lg font-light text-black dark:text-white mb-4">
            Tus envíos recientes
          </h3>
          <div className="space-y-2">
            {exercise.userSubmissions.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(sub.status)}
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {getStatusText(sub.status)}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  {sub.execution_time && (
                    <span>{sub.execution_time.toFixed(2)}ms</span>
                  )}
                  <span>{new Date(sub.submitted_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeExercise; 