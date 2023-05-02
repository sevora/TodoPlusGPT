import { FC } from 'react';
import { StyleSheet, Text, View, FlatList, ListRenderItemInfo, TouchableHighlight, Image, GestureResponderEvent } from 'react-native';
import { addDays, isSameDay } from 'date-fns';

export const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
export const MONTHS = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

export interface CalendarProps {
  /**
   * The date in the calendar marked as the current date.
   */
  currentDate?: Date;
  /**
   * This is the date that we actually use as basis.
   */
  baseDate?: Date;
  /**
   * Called whenever the next or previous month is clicked.
   */
  onMonthChange?: (event: GestureResponderEvent, value: number) => void; 
  /**
   * Called whenever a date is clicked.
   */
  onDatePress?: (event: GestureResponderEvent, value: Date) => void;
}

const Calendar: FC<CalendarProps> = ({ currentDate=new Date(), baseDate=new Date(), onMonthChange, onDatePress }) => {
  
  const renderDaysOfWeek = (data: ListRenderItemInfo<string>) => {
    return (
      <View style={{ ...styles.gridItem, ...styles.daysOfWeekCell }}>
        <Text style={styles.daysOfWeekText}>{data.item.slice(0,3)}</Text>
      </View>
    )
  }

  const renderDays = (data: ListRenderItemInfo<Date>) => {
    let containerStyle = { ...styles.gridItem, ...styles.dayCell, ...styles.excludedDateCell };
    let textStyle = { ...styles.dayText,  ...styles.excludedDateText };

    if ( data.item.getMonth() === baseDate.getMonth() ) {
      containerStyle = { ...containerStyle, ...styles.includedDateCell };
      textStyle = { ...textStyle, ...styles.includedDateText };
    } 

    if ( isSameDay(data.item, currentDate) ) {
      containerStyle = { ...containerStyle, ...styles.initialDateCell }
      textStyle = { ...textStyle, ...styles.initialDateText }
    }

    return (
      <TouchableHighlight style={containerStyle} onPress={onDatePress ? (event) => onDatePress(event, data.item) : undefined} underlayColor='#ccc'>
        <Text style={textStyle}>
          {data.item.getDate()}
        </Text>
      </TouchableHighlight>
    )
  }

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        
        <TouchableHighlight style={styles.button} underlayColor='#ccc' onPress={onMonthChange ? (event) => onMonthChange(event, -1) : undefined}>
          <Image source={require('./../assets/icons/back.png')} style={{ height: 20, width: 20 }} resizeMode='contain'/>
        </TouchableHighlight>

        <Text style={styles.monthText}>
          { MONTHS[baseDate.getMonth()] + ' ' }
          <Text style={styles.yearText}>{baseDate.getFullYear()}</Text>
        </Text>

        <TouchableHighlight style={styles.button} underlayColor='#ccc' onPress={onMonthChange ? (event) => onMonthChange(event, 1) : undefined}>
          <Image source={require('./../assets/icons/next.png')} style={{ height: 20, width: 20 }} resizeMode='contain'/>
        </TouchableHighlight>
      </View>
      <View>
        <FlatList 
          scrollEnabled={false}
          numColumns={7}
          data={DAYS_OF_WEEK} 
          renderItem={renderDaysOfWeek}
        />
        <FlatList 
          scrollEnabled={false}
          numColumns={7}
          style={styles.gridContainer}
          data={getCalendarDays(baseDate.getUTCMonth(), baseDate.getUTCFullYear(), 7*6)}
          renderItem={renderDays}
        />
      </View>
    </View>
  );
}

const getCalendarDays = (month: number, year: number, length: number) => {
  let current = new Date(year, month, 1);
  let difference = 0 - current.getDay();
  current = addDays(current, difference);

  let result = [];

  while (result.length < length) {
    result.push(current);
    current = addDays(current, 1);
  }

  return result;
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff'
  },

  topBar: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-around',
    flexDirection: 'row',
    alignItems: 'center'
  },
  
  button: {
    borderRadius: 100,
    padding: 10,

    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },

  monthText: {
    width: '65%',
    color: '#222',
    fontSize: 32,
    fontWeight: "400",
    textAlign: 'center'
  },

  yearText: {
    fontWeight: "200"
  },

  gridContainer: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#eee'
  },

  gridItem: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },

  daysOfWeekCell: {
    height: 50,
    backgroundColor: '#fff'
  },

  daysOfWeekText: {
    fontSize: 16,
    color: '#222',
    textAlign: 'center'
  },

  dayCell: {
    flexGrow: 1,
    height: 100,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee'
  },

  dayText: {
    color: '#222'
  },

  includedDateCell: {
    backgroundColor: '#fff' 
  },

  includedDateText: {
    color: '#222'
  },

  excludedDateCell: {
    backgroundColor: '#eee'
  },

  excludedDateText: {
    color: '#bbb'
  },

  initialDateCell: {
    backgroundColor: '#222'
  },

  initialDateText: {
    color: '#fcfcfc'
  }
});

export default Calendar;