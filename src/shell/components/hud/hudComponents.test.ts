import { describe, expect, it } from 'vitest';
import { getHudComponent, registerHudComponent } from './hudComponents';

describe('HUD component registry', () => {
  it('returns undefined for an unregistered key', () => {
    expect(getHudComponent('missing-hud')).toBeUndefined();
  });

  it('returns a registered component by key', () => {
    const component = () => null;
    registerHudComponent('test-hud', component);
    expect(getHudComponent('test-hud')).toBe(component);
  });
});
