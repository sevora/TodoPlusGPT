import { useEffect, useState, FC, Fragment } from 'react';
import { BackHandler, StyleSheet, Text, TextInput, SafeAreaView, TouchableHighlight, Image } from 'react-native';
import { getUnixTime, fromUnixTime } from 'date-fns';
import DatePicker from 'react-native-date-picker';

export interface PromptWindowProps {
  initialDate?: Date;
  onSubmit?: (prompt: string, date: Date) => void;
  onClose?: () => void;
}

const PromptWindow: FC<PromptWindowProps> = ({ initialDate=new Date(), onSubmit, onClose }) => {
  const [ isLabelVisible, setIsLabelVisible ] = useState<boolean>(true);
  const [ value, setValue ] = useState<string>(''); 
  const [ dateTimestamp, setDateTimestamp ] = useState<number>( getUnixTime(initialDate) );
  const date = fromUnixTime(dateTimestamp);

  const handleBackButton = () => {
    onClose && onClose();
    return true;
  }

  const handleFocusText = () => {
    setIsLabelVisible(false);
  }

  const handleBlurText = () => {
    setValue( value.trim() );
    setIsLabelVisible(true);
  }

  const handleChangeText = (text: string) => {
    setValue(text);
  }

  const handleDateChange = (date: Date) => {
    setDateTimestamp( getUnixTime(date) );
  }

  const handleButtonPress = () => {
    onSubmit!(value.trim(), date);
  } 

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", handleBackButton);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", handleBackButton)
    }
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.labelText}>Step 1. Describe your Goal</Text>
      <TextInput 
        style={styles.textInputPrompt} 
        multiline={true} 
        maxLength={300}
        onFocus={handleFocusText}
        onBlur={handleBlurText}
        onChangeText={handleChangeText}
      >
        { (isLabelVisible && value.length === 0) ? (
          <Text style={styles.placeholderText}>
             Enter information about your goal. 
             You may specify its expected duration and any other detail
             that may be necessary.
          </Text>
        ) : <Text style={styles.valueText}>{value}</Text> }
      </TextInput>
      
      <Text style={styles.labelText}>Step 2. Choose a Starting Date</Text>
      <DatePicker androidVariant='iosClone' mode='date' theme='light' date={date} onDateChange={handleDateChange} style={{ marginBottom: 35 }}/>

      <Text style={styles.labelText}>Step 3. Hit the Button</Text>
      <TouchableHighlight style={styles.buttonContainer} onPress={onSubmit ? handleButtonPress : undefined}>
        <Fragment>
          <Image source={require('./../assets/icons/bolt.png')} style={{ height: 25, width: 25, marginRight: 10, tintColor: '#eee' }} resizeMode='contain'/>
          <Text style={styles.buttonText}>Generate Tasks</Text>
        </Fragment>
      </TouchableHighlight>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    paddingTop: 0,
    padding: 20
  },

  labelText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 15
  },

  textInputPrompt: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 5,
    height: 200,
    textAlignVertical: 'top',
    marginBottom: 25
  },

  placeholderText: {
    color: '#666',
    lineHeight: 25,
    fontSize: 18
  },

  valueText: {
    lineHeight: 25,
    fontSize: 18
  },

  buttonContainer: {
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 15,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },

  buttonText: {
    fontSize: 20,
    color: '#eee',
    fontWeight: 'normal'
  }
})

export default PromptWindow;