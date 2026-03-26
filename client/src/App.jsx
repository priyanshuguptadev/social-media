/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import ModernHomeScreen from './screens/ModernHomeScreen';
import PostDetailScreen from './screens/PostDetailScreen';
import ConfirmLogoutModal from './screens/ConfirmLogoutModal';
import ProfileScreen from './screens/ProfileScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import useStore from './store/useStore';

const Stack = createNativeStackNavigator();

function App() {
  const checkAuth = useStore(state => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, []);
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="ModernHome">
          <Stack.Screen
            options={{ headerShown: false, animation: 'slide_from_bottom' }}
            name="Register"
            component={RegisterScreen}
          />
          <Stack.Screen
            options={{ headerShown: false, animation: 'slide_from_bottom' }}
            name="Login"
            component={LoginScreen}
          />
          <Stack.Screen
            options={{ headerShown: false, animation: 'fade' }}
            name="ModernHome"
            component={ModernHomeScreen}
          />
          <Stack.Screen
            options={{ headerShown: false, animation: 'slide_from_right' }}
            name="PostDetail"
            component={PostDetailScreen}
          />
          <Stack.Screen
            options={{ headerShown: false, animation: 'slide_from_left' }}
            name="Profile"
            component={ProfileScreen}
          />
          <Stack.Screen
            options={{ headerShown: false, animation: 'slide_from_bottom', presentation: 'containedTransparentModal' }}
            name="ConfirmLogoutModal"
            component={ConfirmLogoutModal}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
