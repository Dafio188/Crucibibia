import React from 'react';

interface CustomKeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
}

export const CustomKeyboard: React.FC<CustomKeyboardProps> = ({
  onKeyPress,
  onBackspace,
}) => {
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
  ];

  const handleKeyClick = (key: string) => {
    if (key === '⌫') {
      onBackspace();
    } else {
      onKeyPress(key);
    }
  };

  // Handle physical keyboard input
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();

      if (e.key === 'Backspace') {
        e.preventDefault();
        onBackspace();
      } else if (/^[A-Z]$/.test(key)) {
        e.preventDefault();
        onKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKeyPress, onBackspace]);

  return (
    <div className="w-full max-w-lg mx-auto bg-gray-100 p-2 rounded-xl">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1 mb-1 last:mb-0">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => handleKeyClick(key)}
              className={`
                flex items-center justify-center rounded-lg font-bold
                transition-all duration-100 active:scale-95
                ${key === '⌫'
                  ? 'w-14 h-12 bg-gray-300 hover:bg-gray-400 text-gray-700'
                  : 'w-8 h-12 sm:w-9 bg-white hover:bg-gray-50 shadow-sm text-gray-800'
                }
              `}
            >
              {key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};
