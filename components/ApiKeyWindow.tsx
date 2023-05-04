import { FC, useState } from 'react';
import { StyleSheet, Text, SafeAreaView, TextInput, TouchableHighlight } from 'react-native';

interface ApiKeyWindowProps {
  onSubmit?: (apiKey: string) => void;
}

const ApiKeyWindow: FC<ApiKeyWindowProps> = ({ onSubmit }) => {
  const [ apiKey, setApiKey ] = useState<string>('');

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.labelText}>Enter your OpenAI API Key</Text>
      <Text style={styles.messageText}>
        The application requires the use of an OpenAI model. An API key 
        must be used. The key is only saved locally on the device and is only used to 
        communicate with the API.
      </Text>
      <TextInput placeholderTextColor='#666' placeholder='Enter your OpenAI key...' secureTextEntry style={styles.textInput} value={apiKey} onChangeText={setApiKey}></TextInput>

      <TouchableHighlight style={styles.submitButtonContainer} onPress={onSubmit ? () => onSubmit(apiKey.trim()) : undefined}>
        <Text style={styles.submitButtonText}>Save Credentials</Text>
      </TouchableHighlight>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    padding: 25,
    display: 'flex'
  },

  labelText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 15
  },

  messageText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 25,
    marginBottom: 15,
  },

  textInput: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#666',
    color: '#222',
    borderRadius: 10,
  },

  submitButtonContainer: {
    marginTop: 15,
    padding: 20,
    backgroundColor: '#222',
    borderRadius: 10,

    display: 'flex',
    alignItems: 'center'
  },

  submitButtonText: {
    color: '#eee'
  }
});

export default ApiKeyWindow;