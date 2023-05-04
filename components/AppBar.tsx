import { FC } from 'react';
import { StyleSheet, Text, SafeAreaView, TouchableHighlight, GestureResponderEvent } from 'react-native';

export interface AppBarProps {
  showButton?: boolean;
  onPressButton?: (event: GestureResponderEvent) => void;
}

const AppBar: FC<AppBarProps> = ({ showButton, onPressButton }) => {
    return (
      <SafeAreaView style={styles.root}>
        <Text style={styles.title}>TodoPlusGPT</Text>

        { showButton && (
          <TouchableHighlight style={styles.button} onPress={onPressButton}>
            <Text style={styles.buttonText}>Generate from Goal</Text>
          </TouchableHighlight>
        ) }
      </SafeAreaView>
    )
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    height: 70,
    padding: 5,
    backgroundColor: '#fff',

    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  title: {
    color: '#222',
    fontSize: 16,
    fontWeight: '500',

    borderColor: '#222',
    borderLeftWidth: 3,
    paddingVertical: 5,
    paddingLeft: 10,
    marginLeft: 7
  },

  button: {
    padding: 10,
    backgroundColor: '#222',
    borderWidth: 2,
    borderRadius: 5
  },

  buttonText: {
    color: '#eee',
    fontWeight: 'bold'
  }
});

export default AppBar;