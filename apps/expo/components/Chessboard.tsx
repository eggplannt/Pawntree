import { View, Text } from 'react-native';
import { colorTheme } from '@/hooks/useColorTheme';

const PIECE_CHARS: Record<string, string> = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
};

function parseFen(fen: string): (string | null)[][] {
  const rows = fen.split(' ')[0].split('/');
  return rows.map((row) => {
    const squares: (string | null)[] = [];
    for (const ch of row) {
      if (/\d/.test(ch)) {
        for (let i = 0; i < parseInt(ch); i++) squares.push(null);
      } else {
        squares.push(ch);
      }
    }
    return squares;
  });
}

interface ChessboardProps {
  fen: string;
  orientation?: 'white' | 'black';
  darkSquareColor?: string;
  lightSquareColor?: string;
}

export function Chessboard({
  fen,
  orientation = 'white',
  darkSquareColor = colorTheme.gold.dim,
  lightSquareColor = '#dcc8a0',
}: ChessboardProps) {
  const board = parseFen(fen);
  const rows = orientation === 'white' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const cols = orientation === 'white' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];

  return (
    <View style={{ aspectRatio: 1, borderRadius: 8, overflow: 'hidden' }}>
      {rows.map((row) => (
        <View key={row} style={{ flex: 1, flexDirection: 'row' }}>
          {cols.map((col) => {
            const isLight = (row + col) % 2 === 0;
            const piece = board[row]?.[col];
            return (
              <View
                key={col}
                style={{
                  flex: 1,
                  backgroundColor: isLight ? lightSquareColor : darkSquareColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {piece && (
                  <Text
                    style={{
                      fontSize: 28,
                      lineHeight: 34,
                      color: piece === piece.toUpperCase() ? '#f0ebe3' : '#1a1a1a',
                      textShadowColor: piece === piece.toUpperCase() ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.3)',
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 2,
                    }}
                  >
                    {PIECE_CHARS[piece]}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}
