import { FC } from 'react';
import { StyleSheet, Text, View, TouchableHighlight } from 'react-native';

const AppBar: FC = () => {
    return (
      <View style={styles.root}>
        <Text style={styles.title}>TodoPlusGPT</Text>

        <TouchableHighlight style={styles.button}>
          <Text style={styles.buttonText}>Generate from Goal</Text>
        </TouchableHighlight>
      </View>
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