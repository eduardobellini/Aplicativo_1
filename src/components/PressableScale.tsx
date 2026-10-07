import { ReactNode, useRef } from 'react';
import { Animated, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
};

export default function PressableScale({ children, style, scaleTo = 0.96, ...rest }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue: number) =>
    Animated.spring(scale, {
      toValue,
      speed: 40,
      bounciness: toValue === 1 ? 8 : 0,
      useNativeDriver: true,
    }).start();

  return (
    <Pressable
      {...rest}
      onPressIn={e => {
        animateTo(scaleTo);
        rest.onPressIn?.(e);
      }}
      onPressOut={e => {
        animateTo(1);
        rest.onPressOut?.(e);
      }}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
