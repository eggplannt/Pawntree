import { memo } from 'react';
import { View, Image, type ImageSourcePropType } from 'react-native';
import { colorTheme } from '@/hooks/useColorTheme';

// Lichess cburnett piece set (GPLv2+, Colin M.L. Burnett)
const PIECES: Record<string, ImageSourcePropType> = {
  K: require('@/assets/pieces/wK.png'),
  Q: require('@/assets/pieces/wQ.png'),
  R: require('@/assets/pieces/wR.png'),
  B: require('@/assets/pieces/wB.png'),
  N: require('@/assets/pieces/wN.png'),
  P: require('@/assets/pieces/wP.png'),
  k: require('@/assets/pieces/bK.png'),
  q: require('@/assets/pieces/bQ.png'),
  r: require('@/assets/pieces/bR.png'),
  b: require('@/assets/pieces/bB.png'),
  n: require('@/assets/pieces/bN.png'),
  p: require('@/assets/pieces/bP.png'),
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

export const Chessboard = memo(function Chessboard({
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
                {piece && PIECES[piece] && (
                  <Image
                    source={PIECES[piece]}
                    style={{ width: '85%', height: '85%' }}
                    resizeMode="contain"
                  />
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
});
