import * as keychain from 'react-native-keychain';

const SERVICE = 'authTokenService';

export const saveToken = async token => {
  try {
    await keychain.setGenericPassword('token', token, { service: SERVICE });
  } catch (error) {
    console.error('Error saving token to Keychain:', error);
  }
};

export const getToken = async () => {
  try {
    const credentials = await keychain.getGenericPassword({ service: SERVICE });
    if (credentials) {
      return credentials.password;
    } else {
      console.log('No credentials found');
      return null;
    }
  } catch (error) {
    console.error('Error retrieving token from Keychain:', error);
    return null;
  }
};

export const deleteToken = async () => {
  try {
    await keychain.resetGenericPassword({ service: SERVICE });
  } catch (error) {
    console.error('Error deleting token from Keychain:', error);
  }
};
