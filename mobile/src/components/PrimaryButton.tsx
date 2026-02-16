import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
};

export function PrimaryButton({
  title,
  onPress,
  disabled = false,
}: Props): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null,
      ]}
    >
      <Text style={styles.label}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1D4ED8',
    borderRadius: 12,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  disabled: {
    backgroundColor: '#94A3B8',
  },
  pressed: {
    opacity: 0.8,
  },
});
