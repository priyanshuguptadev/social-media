import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';

const CustomButton = ({ title, onPress, loading, disabled, variant = 'primary', style }) => {
  const isPrimary = variant === 'primary';
  const buttonStyle = isPrimary ? styles.primaryButton : styles.secondaryButton;
  const textStyle = isPrimary ? styles.primaryButtonText : styles.secondaryButtonText;

  return (
    <TouchableOpacity
      style={[buttonStyle, loading || disabled ? styles.disabledButton : null, style]}
      onPress={onPress}
      disabled={loading || disabled}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#FFFFFF" : "#111111"} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: '#111111',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: '#666666',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default CustomButton;
