import React, { FC, useState } from  'react';
import { ScrollView } from 'react-native';

import { addMonths, getUnixTime, fromUnixTime } from 'date-fns';

import Calendar from './Calendar';
import AppBar from './AppBar';

const App: FC = () => {
  const  [baseTimestamp, setBaseTimestamp ] = useState<number>( getUnixTime(new Date()) );
  const baseDate = fromUnixTime(baseTimestamp);

  const onMonthChange = (_: any, increment: number) => {
    setBaseTimestamp( getUnixTime( addMonths(baseDate, increment) ) );
  }

  return (
    <ScrollView>
        <AppBar />
        <Calendar baseDate={baseDate} onMonthChange={onMonthChange} />
    </ScrollView>
  );
}

export default App;