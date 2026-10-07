import { RefObject, useCallback, useEffect, useRef } from 'react';
import { Keyboard, ScrollView, TextInput, View } from 'react-native';

const TOP_GAP = 110;

export function useScrollToFocused() {
  const scrollRef = useRef<ScrollView>(null);
  const contentRef = useRef<View>(null);
  const focused = useRef<TextInput | null>(null);

  const scrollToFocused = useCallback(() => {
    const input = focused.current;
    const content = contentRef.current;
    if (!input || !content) return;
    input.measureLayout(content, (_x, y) => {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - TOP_GAP), animated: true });
    });
  }, []);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', scrollToFocused);
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      focused.current = null;
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, [scrollToFocused]);

  const focusHandler = (ref: RefObject<TextInput | null>) => () => {
    focused.current = ref.current;
    if (Keyboard.isVisible()) scrollToFocused();
  };

  return { scrollRef, contentRef, focusHandler };
}
