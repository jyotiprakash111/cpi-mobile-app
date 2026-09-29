import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../styles/theme';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  theme: ThemeColors;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  style,
  theme,
}) => {
  const getButtonStyles = (pressed: boolean) => {
    let bg = theme.primary;
    let border = 'transparent';
    let textColor = theme.textInverse;

    switch (variant) {
      case 'primary':
        bg = pressed ? theme.primaryDark : theme.primary;
        textColor = '#FFFFFF';
        break;
      case 'secondary':
        bg = pressed ? theme.surfaceAlt : theme.badgeBg;
        textColor = theme.text;
        border = theme.border;
        break;
      case 'outline':
        bg = pressed ? theme.primaryLight : 'transparent';
        border = theme.primary;
        textColor = theme.primary;
        break;
      case 'danger':
        bg = pressed ? '#8B0000' : theme.danger;
        textColor = '#FFFFFF';
        break;
      case 'success':
        bg = pressed ? '#0F5132' : theme.success;
        textColor = '#FFFFFF';
        break;
      case 'warning':
        bg = pressed ? '#664D03' : theme.warning;
        textColor = '#FFFFFF';
        break;
    }

    if (disabled) {
      bg = theme.surfaceAlt;
      border = theme.border;
      textColor = theme.textMuted;
    }

    const minHeight = size === 'sm' ? 40 : size === 'lg' ? 56 : 48;
    const paddingHorizontal = size === 'sm' ? 12 : size === 'lg' ? 20 : 16;
    const fontSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;

    return {
      container: {
        backgroundColor: bg,
        borderColor: border,
        borderWidth: variant === 'outline' || variant === 'secondary' || disabled ? 1.5 : 0,
        minHeight,
        paddingHorizontal,
        opacity: pressed && !disabled ? 0.85 : 1,
      },
      text: {
        color: textColor,
        fontSize,
      },
    };
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        getButtonStyles(pressed).container,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? theme.primary : '#FFFFFF'}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={size === 'sm' ? 16 : 20}
              color={getButtonStyles(false).text.color}
              style={styles.iconLeft}
            />
          )}
          <Text
            style={[
              styles.text,
              getButtonStyles(false).text,
              { fontWeight: '700' },
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={size === 'sm' ? 16 : 20}
              color={getButtonStyles(false).text.color}
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
