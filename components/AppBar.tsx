import { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const AppBar: FC = () => {
    return (
      <View style={styles.root}>
        <Text style={styles.title}>TodoPlusGPT</Text>
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
    justifyContent: 'center',
    alignItems: 'center'
  },

  title: {
    color: '#222',
    fontSize: 16,
    fontWeight: '500',
    
    alignSelf: 'flex-start',
    borderColor: '#222',
    borderBottomWidth: 2,
    paddingVertical: 10,
    paddingHorizontal: 12
  }
});

export default AppBar;