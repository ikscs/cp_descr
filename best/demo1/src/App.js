import React, { useState, useEffect } from 'react';
import './App.css';

// Массив карт (каждая карта представлена числом, которое будет показываться при открытии)
const initialCards = [
  { id: 1, value: 'A' },
  { id: 2, value: 'B' },
  { id: 3, value: 'C' },
  { id: 4, value: 'D' },
  { id: 5, value: 'E' },
  { id: 6, value: 'F' },
  { id: 7, value: 'G' },
  { id: 8, value: 'H' },
  { id: 1, value: 'A' },
  { id: 2, value: 'B' },
  { id: 3, value: 'C' },
  { id: 4, value: 'D' },
  { id: 5, value: 'E' },
  { id: 6, value: 'F' },
  { id: 7, value: 'G' },
  { id: 8, value: 'H' },
];

// Перемешивание массива
const shuffleArray = (array) => {
  let shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

const App = () => {
  // Состояние игры
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  // Инициализация карты при первом рендере
  useEffect(() => {
    const shuffledCards = shuffleArray(initialCards);
    setCards(shuffledCards);
  }, []);

  // Функция для обработки клика на карту
  const handleCardClick = (card) => {
    if (flippedCards.length === 2 || card.flipped || matchedCards.includes(card.id)) return;

    const newFlippedCards = [...flippedCards, card];
    setFlippedCards(newFlippedCards);

    // Если открыто две карты, проверяем их на совпадение
    if (newFlippedCards.length === 2) {
      if (newFlippedCards[0].value === newFlippedCards[1].value) {
        setMatchedCards([...matchedCards, newFlippedCards[0].id, newFlippedCards[1].id]);
      }

      setTimeout(() => {
        setFlippedCards([]);
      }, 1000);
    }
  };

  // Функция для проверки, завершена ли игра
  useEffect(() => {
    if (matchedCards.length === cards.length) {
      setGameOver(true);
    }
  }, [matchedCards, cards]);

  return (
    <div className="game-container">
      {gameOver && <div className="game-over">Победа! Игра завершена!</div>}
      <div className="card-grid">
        {cards.map((card) => {
          const isFlipped = flippedCards.includes(card) || matchedCards.includes(card.id);

          return (
            <div
              key={card.id}
              className={`card ${isFlipped ? 'flipped' : ''}`}
              onClick={() => handleCardClick(card)}
            >
              {isFlipped ? card.value : '?'}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default App;
