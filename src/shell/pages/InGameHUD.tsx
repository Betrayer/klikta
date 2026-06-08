import { createElement } from 'react';
import { FramedHud } from '../components/hud/FramedHud';
import { RingedHud } from '../components/hud/RingedHud';
import { MinimalHud } from '../components/hud/MinimalHud';
import { getHudComponent } from '../components/hud/hudComponents';
import { useHudSpec } from '../components/hud/useHudSpec';

export const InGameHUD = () => {
  const hud = useHudSpec();

  if (hud.customComponent !== undefined) {
    const custom = getHudComponent(hud.customComponent);
    if (custom !== undefined) return createElement(custom);
  }

  if (hud.style === 'ringed') return <RingedHud />;

  if (hud.style === 'minimal') return <MinimalHud />;

  return <FramedHud />;
};
