import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, LoadingOverlay } from '@mantine/core';
import { Game } from '../../game/core/Game';
import { FpsCounter } from './FpsCounter';

export const GameCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (el === null) return;

    const game = new Game(el);
    gameRef.current = game;
    let disposed = false;

    const onAssetsLoading = (value: boolean): void => {
      if (!disposed) setLoading(value);
    };

    game.start(onAssetsLoading).then(
      () => {
        if (disposed) game.destroy();
      },
      (err: unknown) => {
        console.error('Game failed to start', err);
      },
    );

    return () => {
      disposed = true;
      game.destroy();
      gameRef.current = null;
    };
  }, []);

  const getFps = useCallback(() => gameRef.current?.fps ?? 0, []);

  return (
    <>
      <Box pos="relative" w="100vw" h="100vh" style={{ overflow: 'hidden' }}>
        <Box ref={containerRef} w="100%" h="100%" />
        <LoadingOverlay
          visible={loading}
          overlayProps={{ color: '#0a0014', backgroundOpacity: 1 }}
          loaderProps={{ color: '#ff006e' }}
        />
      </Box>
      <FpsCounter getFps={getFps} />
    </>
  );
};
