import { FC } from 'react';
import { StyleSheet, Text, View, FlatList, ListRenderItemInfo } from 'react-native';
import { addDays, getUnixTime, isSameDay } from 'date-fns';

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
const MONTHS = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

const currentDate = new Date();

const Calendar: FC = () => {

  return (
    <View style={styles.root}>
      <FlatList
        numColumns={7}
        data={DAYS_OF_WEEK} 
        renderItem={renderDaysOfWeek}
      />
      <FlatList 
        numColumns={7}
        style={styles.gridContainer}
        data={getCalendarDays(currentDate.getUTCMonth(), currentDate.getUTCFullYear(), 7*6)}
        renderItem={renderDays}
      />
    </View>
  );
}

interface DayOfWeekCellProps {
  value: string;
}

const renderDaysOfWeek = (data: ListRenderItemInfo<string>) => {
  return (
    <View style={{ ...styles.gridItem, ...styles.daysOfWeekCell }}>
      <Text style={styles.daysOfWeekText}>{data.item.slice(0,3)}</Text>
    </View>
  )
}

const renderDays = (data: ListRenderItemInfo<Date>) => {
  let viewStyle = { ...styles.gridItem, ...styles.dayCell, ...styles.excludedDateCell };
  let textStyle = { ...styles.dayText,  ...styles.excludedDateText };

  if ( data.item.getMonth() === currentDate.getMonth() ) {
    viewStyle = { ...viewStyle, ...styles.includedDateCell };
    textStyle = { ...textStyle, ...styles.includedDateText };
  } 

  if ( isSameDay(data.item, currentDate) ) {
    viewStyle = { ...viewStyle, ...styles.initialDateCell }
    textStyle = { ...textStyle, ...styles.initialDateText }
  }

  return (
    <View style={viewStyle}>
      <Text style={textStyle}>
        {data.item.getDate()}
      </Text>
    </View>
  )
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
    display: 'flex',
    flexDirection: 'column'
  },

  gridContainer: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    flexGrow: 11,
    borderColor: 'rgba(0,0,0,0.1)'
  },

  gridItem: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },

  daysOfWeekCell: {
    height: 50
  },

  daysOfWeekText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center'
  },

  dayCell: {
    height: 100,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)'
  },

  dayText: {
    color: 'rgba(0,0,0,0.7)'
  },

  includedDateCell: {
    backgroundColor: '#fff' 
  },

  includedDateText: {
    color: 'rgba(0,0,0,0.5)'
  },

  excludedDateCell: {
    backgroundColor: '#eee'
  },

  excludedDateText: {
    color: 'rgba(0,0,0,0.2)'
  },

  initialDateCell: {
    backgroundColor: '#000'
  },

  initialDateText: {
    color: '#fff'
  }
});


export default Calendar;