import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { useNavigation } from '@react-navigation/native';

const ScreenHeader = ({ title, showBackButton = false, leftComponent, rightComponent }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[styles.header, { paddingTop: insets.top || 44 }]}>
      {leftComponent ? leftComponent : (
        showBackButton ? (
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialDesignIcons name="arrow-left" size={24} color="#000000" />
          </TouchableOpacity>
        ) : <View style={styles.headerPlaceholder} />
      )}

      <Text style={styles.headerTitle}>{title}</Text>

      {rightComponent ? rightComponent : <View style={styles.headerPlaceholder} />}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.98)',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.5,
  },
  headerPlaceholder: {
    width: 40,
  },
});

export default ScreenHeader;
