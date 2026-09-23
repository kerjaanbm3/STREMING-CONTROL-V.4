import { useEffect, useRef } from 'react';

export interface HotkeyMap {
  [actionName: string]: () => void;
}

export function useHotkeys(actions: HotkeyMap, enabled = true) {
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger hotkeys if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }

      const code = e.code;
      const isShift = e.shiftKey;
      const isCtrl = e.ctrlKey;

      // SCORE TIM A (+1 / -1)
      if (code === 'Numpad7' && !isShift && actionsRef.current['SCORE_A_PLUS']) {
        e.preventDefault();
        actionsRef.current['SCORE_A_PLUS']();
      } else if (code === 'Numpad7' && isShift && actionsRef.current['SCORE_A_MINUS']) {
        e.preventDefault();
        actionsRef.current['SCORE_A_MINUS']();
      }

      // SCORE TIM B (+1 / -1)
      else if (code === 'Numpad9' && !isShift && actionsRef.current['SCORE_B_PLUS']) {
        e.preventDefault();
        actionsRef.current['SCORE_B_PLUS']();
      } else if (code === 'Numpad9' && isShift && actionsRef.current['SCORE_B_MINUS']) {
        e.preventDefault();
        actionsRef.current['SCORE_B_MINUS']();
      }

      // TIMER START / PAUSE (Space or Numpad5)
      else if ((code === 'Space' || code === 'Numpad5') && !isCtrl && actionsRef.current['TIMER_TOGGLE']) {
        e.preventDefault();
        actionsRef.current['TIMER_TOGGLE']();
      }

      // CELEBRATION (Goal / WWCD - Key G or NumpadEnter)
      else if ((code === 'KeyG' || code === 'NumpadEnter') && actionsRef.current['TRIGGER_CELEBRATION']) {
        e.preventDefault();
        actionsRef.current['TRIGGER_CELEBRATION']();
      }

      // LOWER THIRD (Key L)
      else if (code === 'KeyL' && actionsRef.current['TOGGLE_LOWER_THIRD']) {
        e.preventDefault();
        actionsRef.current['TOGGLE_LOWER_THIRD']();
      }

      // SPONSOR CAROUSEL (Key S)
      else if (code === 'KeyS' && actionsRef.current['TOGGLE_SPONSOR']) {
        e.preventDefault();
        actionsRef.current['TOGGLE_SPONSOR']();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled]);
}
