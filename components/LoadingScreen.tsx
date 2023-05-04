import { FC } from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';

interface LoadingScreenProps {

}

const LoadingScreen: FC<LoadingScreenProps> = () => {
  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.text}>Loading...</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },

  text: {
    color: '#222',
    fontSize: 32,
    fontWeight: 'bold'
  }
})

export default LoadingScreen;