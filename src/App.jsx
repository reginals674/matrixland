import React, { useState, useEffect } from 'react';
import { Trophy, Star, HelpCircle, Play, BookOpen, Award, Zap, Home, Settings } from 'lucide-react';

// Componente principal del juego
const MatrixLand = () => {
  const [gameState, setGameState] = useState('menu'); // menu, playing, levelComplete
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentOperation, setCurrentOperation] = useState('suma');
  const [difficulty, setDifficulty] = useState('basico');
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [matrix1, setMatrix1] = useState([]);
  const [matrix2, setMatrix2] = useState([]);
  const [userAnswer, setUserAnswer] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [mode, setMode] = useState('campana'); // campana, libre

  // Generar matriz aleatoria
  const generateRandomMatrix = (rows, cols, max = 10) => {
    return Array(rows).fill(0).map(() => 
      Array(cols).fill(0).map(() => Math.floor(Math.random() * max) + 1)
    );
  };

  // Operaciones con matrices
  const addMatrices = (m1, m2) => {
    return m1.map((row, i) => row.map((val, j) => val + m2[i][j]));
  };

  const subtractMatrices = (m1, m2) => {
    return m1.map((row, i) => row.map((val, j) => val - m2[i][j]));
  };

  const multiplyMatrices = (m1, m2) => {
    const result = Array(m1.length).fill(0).map(() => Array(m2[0].length).fill(0));
    for (let i = 0; i < m1.length; i++) {
      for (let j = 0; j < m2[0].length; j++) {
        for (let k = 0; k < m2.length; k++) {
          result[i][j] += m1[i][k] * m2[k][j];
        }
      }
    }
    return result;
  };

  const transposeMatrix = (m) => {
    return m[0].map((_, colIndex) => m.map(row => row[colIndex]));
  };

  const determinant2x2 = (m) => {
    return m[0][0] * m[1][1] - m[0][1] * m[1][0];
  };

  const determinant3x3 = (m) => {
    return m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
           m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
           m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  };

  // Iniciar nuevo desafío
  const startNewChallenge = () => {
    let size, operation, m1, m2, answer;

    if (difficulty === 'basico') {
      size = 2;
      const ops = ['suma', 'resta'];
      operation = ops[Math.floor(Math.random() * ops.length)];
      m1 = generateRandomMatrix(size, size, 5);
      m2 = generateRandomMatrix(size, size, 5);
      answer = operation === 'suma' ? addMatrices(m1, m2) : subtractMatrices(m1, m2);
    } else if (difficulty === 'intermedio') {
      size = 3;
      const ops = ['suma', 'resta', 'multiplicacion', 'transpuesta'];
      operation = ops[Math.floor(Math.random() * ops.length)];
      m1 = generateRandomMatrix(size, size, 8);
      
      if (operation === 'multiplicacion') {
        m2 = generateRandomMatrix(size, size, 8);
        answer = multiplyMatrices(m1, m2);
      } else if (operation === 'transpuesta') {
        m2 = null;
        answer = transposeMatrix(m1);
      } else {
        m2 = generateRandomMatrix(size, size, 8);
        answer = operation === 'suma' ? addMatrices(m1, m2) : subtractMatrices(m1, m2);
      }
    } else { // avanzado
      size = Math.random() > 0.5 ? 2 : 3;
      const ops = ['determinante', 'multiplicacion', 'transpuesta'];
      operation = ops[Math.floor(Math.random() * ops.length)];
      m1 = generateRandomMatrix(size, size, 10);
      
      if (operation === 'determinante') {
        m2 = null;
        answer = size === 2 ? [[determinant2x2(m1)]] : [[determinant3x3(m1)]];
      } else if (operation === 'transpuesta') {
        m2 = null;
        answer = transposeMatrix(m1);
      } else {
        m2 = generateRandomMatrix(size, size, 10);
        answer = multiplyMatrices(m1, m2);
      }
    }

    setCurrentOperation(operation);
    setMatrix1(m1);
    setMatrix2(m2);
    setCorrectAnswer(answer);
    setUserAnswer(Array(answer.length).fill(0).map(() => Array(answer[0].length).fill('')));
    setFeedback('');
  };

  // Verificar respuesta
  const checkAnswer = () => {
    const isCorrect = userAnswer.every((row, i) => 
      row.every((val, j) => parseFloat(val) === correctAnswer[i][j])
    );

    if (isCorrect) {
      const points = difficulty === 'basico' ? 10 : difficulty === 'intermedio' ? 20 : 30;
      setScore(score + points);
      setTotalScore(totalScore + points);
      setFeedback('¡Correcto! 🎉');
      setConsecutiveErrors(0);
      
      setTimeout(() => {
        if (mode === 'campana') {
          setCurrentLevel(currentLevel + 1);
          if (currentLevel % 5 === 0) {
            setGameState('levelComplete');
          } else {
            startNewChallenge();
          }
        } else {
          startNewChallenge();
        }
      }, 1500);
    } else {
      setLives(lives - 1);
      setConsecutiveErrors(consecutiveErrors + 1);
      setFeedback('❌ Incorrecto. Revisa tus cálculos.');
      
      if (lives - 1 <= 0 && mode === 'campana') {
        setFeedback('❌ Game Over. Intenta de nuevo.');
        setTimeout(() => resetGame(), 2000);
      }
    }
  };

  // Actualizar entrada del usuario
  const updateUserAnswer = (i, j, value) => {
    const newAnswer = [...userAnswer];
    newAnswer[i][j] = value;
    setUserAnswer(newAnswer);
  };

  // Reiniciar juego
  const resetGame = () => {
    setGameState('menu');
    setCurrentLevel(1);
    setScore(0);
    setLives(3);
    setConsecutiveErrors(0);
  };

  // Comenzar juego
  const startGame = (selectedMode, selectedDifficulty) => {
    setMode(selectedMode);
    setDifficulty(selectedDifficulty);
    setGameState('playing');
    setLives(selectedMode === 'libre' ? 999 : 3);
    startNewChallenge();
  };

  // Obtener símbolo de operación
  const getOperationSymbol = (op) => {
    const symbols = {
      suma: '+',
      resta: '-',
      multiplicacion: '×',
      transpuesta: 'T',
      determinante: 'det'
    };
    return symbols[op] || op;
  };

  // Obtener descripción de operación
  const getOperationDescription = (op) => {
    const descriptions = {
      suma: 'Suma cada elemento de la primera matriz con el elemento correspondiente de la segunda matriz.',
      resta: 'Resta cada elemento de la segunda matriz del elemento correspondiente de la primera matriz.',
      multiplicacion: 'Multiplica las matrices. Recuerda: el elemento (i,j) es la suma de productos de la fila i de M1 con la columna j de M2.',
      transpuesta: 'Intercambia filas por columnas. El elemento (i,j) se convierte en (j,i).',
      determinante: 'Calcula el determinante de la matriz. Para 2×2: ad-bc. Para 3×3: usa la regla de Sarrus o expansión por cofactores.'
    };
    return descriptions[op];
  };

  useEffect(() => {
    if (gameState === 'playing' && matrix1.length === 0) {
      startNewChallenge();
    }
  }, [gameState]);

  // Pantalla de menú
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-2xl">
                <span className="text-6xl">🎩</span>
              </div>
            </div>
            <h1 className="text-6xl font-bold text-cyan-300 mb-2" style={{textShadow: '0 0 20px rgba(34,211,238,0.5)'}}>
              MATRIXLAND
            </h1>
            <p className="text-xl text-cyan-100">Aventura Matemática de Matrices</p>
            <div className="flex justify-center gap-4 mt-4">
              <div className="bg-blue-800/50 px-4 py-2 rounded-lg">
                <Trophy className="inline mr-2 text-yellow-400" size={20} />
                <span className="text-cyan-100">Score Total: {totalScore}</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Modo Campaña */}
            <div className="bg-blue-800/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-cyan-400/30 hover:border-cyan-400 transition-all">
              <h2 className="text-2xl font-bold text-cyan-300 mb-4 flex items-center gap-2">
                <Zap className="text-yellow-400" />
                Modo Campaña
              </h2>
              <p className="text-cyan-100 mb-6">Avanza por niveles de dificultad creciente. ¡Cuidado con tus vidas!</p>
              
              <div className="space-y-3">
                <button
                  onClick={() => startGame('campana', 'basico')}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
                >
                  🟢 Nivel Básico (2×2)
                </button>
                <button
                  onClick={() => startGame('campana', 'intermedio')}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
                >
                  🟡 Nivel Intermedio (3×3)
                </button>
                <button
                  onClick={() => startGame('campana', 'avanzado')}
                  className="w-full bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
                >
                  🔴 Nivel Avanzado
                </button>
              </div>
            </div>

            {/* Modo Libre */}
            <div className="bg-blue-800/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-cyan-400/30 hover:border-cyan-400 transition-all">
              <h2 className="text-2xl font-bold text-cyan-300 mb-4 flex items-center gap-2">
                <BookOpen className="text-purple-400" />
                Modo Libre
              </h2>
              <p className="text-cyan-100 mb-6">Practica sin límites de tiempo ni vidas. ¡Aprende a tu ritmo!</p>
              
              <div className="space-y-3">
                <button
                  onClick={() => startGame('libre', 'basico')}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
                >
                   Práctica Básica
                </button>
                <button
                  onClick={() => startGame('libre', 'intermedio')}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
                >
                   Práctica Intermedia
                </button>
                <button
                  onClick={() => startGame('libre', 'avanzado')}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
                >
                   Práctica Avanzada
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Pantalla de nivel completado
  if (gameState === 'levelComplete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-cyan-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-blue-800/50 backdrop-blur-sm rounded-2xl p-8 border-2 border-yellow-400/50 text-center">
          <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-4xl font-bold text-yellow-300 mb-4">¡Nivel Completado!</h2>
          <p className="text-2xl text-cyan-100 mb-6">Nivel {currentLevel - 1}</p>
          <p className="text-xl text-cyan-200 mb-8">Puntuación: {score}</p>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                setGameState('playing');
                startNewChallenge();
              }}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              Continuar
            </button>
            <button
              onClick={resetGame}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              Volver al Menú
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de juego
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-blue-800/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-cyan-400/30">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={resetGame}
                className="bg-cyan-600 hover:bg-cyan-700 text-white p-2 rounded-lg transition-all"
              >
                <Home size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-cyan-300">MATRIXLAND</h1>
                <p className="text-cyan-100 text-sm">
                  {mode === 'campana' ? `Nivel ${currentLevel}` : 'Modo Libre'} - {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-blue-900/50 px-4 py-2 rounded-lg">
                <Star className="inline text-yellow-400 mr-1" size={18} />
                <span className="text-cyan-100 font-bold">{score}</span>
              </div>
              {mode === 'campana' && (
                <div className="bg-blue-900/50 px-4 py-2 rounded-lg">
                  <span className="text-cyan-100">❤️ {lives}</span>
                </div>
              )}
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-all"
              >
                <HelpCircle size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Ayuda contextual */}
        {(showHelp || consecutiveErrors >= 2) && (
          <div className="bg-purple-800/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-purple-400/30">
            <h3 className="text-lg font-bold text-purple-300 mb-2">
              💡 Ayuda: {currentOperation.charAt(0).toUpperCase() + currentOperation.slice(1)}
            </h3>
            <p className="text-purple-100">{getOperationDescription(currentOperation)}</p>
          </div>
        )}

        {/* Área de juego */}
        <div className="bg-blue-800/50 backdrop-blur-sm rounded-xl p-6 border border-cyan-400/30">
          <h2 className="text-xl font-bold text-cyan-300 mb-4 text-center">
            Resuelve: {currentOperation === 'transpuesta' ? 'Transpuesta de M1' : currentOperation === 'determinante' ? 'Determinante de M1' : `M1 ${getOperationSymbol(currentOperation)} M2`}
          </h2>

          <div className="flex justify-center items-center gap-8 mb-6 flex-wrap">
            {/* Matriz 1 */}
            <div>
              <p className="text-cyan-200 text-center mb-2 font-semibold">Matriz 1</p>
              <div className="bg-blue-900/50 p-4 rounded-lg border-2 border-cyan-500">
                {matrix1.map((row, i) => (
                  <div key={i} className="flex gap-2 mb-2 last:mb-0">
                    {row.map((val, j) => (
                      <div key={j} className="w-12 h-12 bg-cyan-600 rounded flex items-center justify-center text-white font-bold text-lg">
                        {val}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Símbolo de operación */}
            {matrix2 && (
              <>
                <div className="text-4xl text-cyan-300 font-bold">
                  {getOperationSymbol(currentOperation)}
                </div>

                {/* Matriz 2 */}
                <div>
                  <p className="text-cyan-200 text-center mb-2 font-semibold">Matriz 2</p>
                  <div className="bg-blue-900/50 p-4 rounded-lg border-2 border-cyan-500">
                    {matrix2.map((row, i) => (
                      <div key={i} className="flex gap-2 mb-2 last:mb-0">
                        {row.map((val, j) => (
                          <div key={j} className="w-12 h-12 bg-cyan-600 rounded flex items-center justify-center text-white font-bold text-lg">
                            {val}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="text-4xl text-cyan-300 font-bold">=</div>

            {/* Matriz respuesta */}
            <div>
              <p className="text-cyan-200 text-center mb-2 font-semibold">Tu Respuesta</p>
              <div className="bg-blue-900/50 p-4 rounded-lg border-2 border-yellow-500">
                {userAnswer.map((row, i) => (
                  <div key={i} className="flex gap-2 mb-2 last:mb-0">
                    {row.map((val, j) => (
                      <input
                        key={j}
                        type="number"
                        value={val}
                        onChange={(e) => updateUserAnswer(i, j, e.target.value)}
                        className="w-12 h-12 bg-white/10 border-2 border-yellow-400 rounded text-center text-white font-bold text-lg focus:outline-none focus:border-yellow-300"
                        placeholder="?"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`text-center text-xl font-bold mb-4 ${feedback.includes('Correcto') ? 'text-green-400' : 'text-red-400'}`}>
              {feedback}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-center gap-4">
            <button
              onClick={checkAnswer}
              disabled={userAnswer.some(row => row.some(val => val === ''))}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 disabled:scale-100"
            >
              ✓ Verificar Respuesta
            </button>
            <button
              onClick={startNewChallenge}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105"
            >
              ↻ Nuevo Desafío
            </button>
          </div>
        </div>

        {/* Consejos */}
        <div className="mt-6 text-center text-cyan-200 text-sm">
          💡 {difficulty === 'basico' 
            ? 'Tip: En suma y resta, opera elemento por elemento'
            : difficulty === 'intermedio'
            ? 'Tip: Para multiplicar matrices, multiplica filas por columnas'
            : 'Tip: Para determinantes 2×2 usa: ad-bc'}
        </div>
      </div>
    </div>
  );
};

export default MatrixLand;