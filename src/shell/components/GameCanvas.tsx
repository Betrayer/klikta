import { useCallback, useEffect, useRef } from 'react';
import { Box } from '@mantine/core';
import { Game } from '../../game/core/Game';
import { FpsCounter } from './FpsCounter';

export const GameCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el === null) return;

    const game = new Game(el);
    gameRef.current = game;
    let disposed = false;

    game.start().then(
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
      <Box ref={containerRef} w="100vw" h="100vh" style={{ overflow: 'hidden' }} />
      <FpsCounter getFps={getFps} />
    </>
  );
};
