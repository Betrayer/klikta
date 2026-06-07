import { Loader, Text, UnstyledButton } from '@mantine/core';
import type { ReactNode } from 'react';
import classes from './MenuButton.module.css';

type MenuButtonVariant = 'primary' | 'secondary' | 'tertiary';

interface MenuButtonProps {
  variant?: MenuButtonVariant;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

export const MenuButton = ({
  variant = 'secondary',
  fullWidth = true,
  loading = false,
  disabled = false,
  onClick,
  children,
}: MenuButtonProps) => {
  const inert = disabled || loading;
  return (
    <UnstyledButton
      className={classes.menuButton}
      data-variant={variant}
      data-disabled={inert ? 'true' : undefined}
      disabled={inert}
      onClick={inert ? undefined : onClick}
      style={fullWidth ? { width: '100%' } : undefined}
    >
      {loading ? (
        <Loader size="sm" color={variant === 'primary' ? '#fff' : 'primary'} />
      ) : (
        <Text className={classes.label} lineClamp={2}>
          {children}
        </Text>
      )}
    </UnstyledButton>
  );
};
