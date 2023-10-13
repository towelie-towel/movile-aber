import { useState, useEffect } from 'react';
import { Keyboard } from 'react-native';

const useKeyboard = () => {
  const [keyboard, setKeyboard] = useState<{ keyboardVisible: boolean; keyboardHeight: number }>({
    keyboardHeight: 0,
    keyboardVisible: false,
  });

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboard({
        ...keyboard,
        keyboardHeight: e.endCoordinates.height,
        keyboardVisible: true,
      });
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboard({
        ...keyboard,
        keyboardHeight: 0,
        keyboardVisible: false,
      });
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return keyboard;
};

export default useKeyboard;
