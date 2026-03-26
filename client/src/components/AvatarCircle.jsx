import React from 'react';
import { Image } from 'react-native';

const AvatarCircle = ({ username = 'guest', size = 36 }) => {
  return (
    <Image
      source={{ uri: `https://i.pravatar.cc/150?u=${username}` }}
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#F0F0F0' }}
    />
  );
};

export default AvatarCircle;
