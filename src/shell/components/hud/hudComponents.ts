import type { ComponentType } from 'react';

const registry = new Map<string, ComponentType>();

export const registerHudComponent = (
  key: string,
  component: ComponentType,
): void => {
  registry.set(key, component);
};

export const getHudComponent = (key: string): ComponentType | undefined =>
  registry.get(key);
