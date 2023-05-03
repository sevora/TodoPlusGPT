import React, { FC, useEffect, useState } from  'react';
import { ScrollView } from 'react-native';
import { addMonths, getUnixTime, fromUnixTime } from 'date-fns';
import copy from 'fast-copy';

import { TodoDictionary, TodoEntry } from './shared.types';
import Calendar from './Calendar';
import AppBar from './AppBar';
import TodoList from './TodoList';

const enum Pages {
  Calendar,
  TodoList
}

const App: FC = () => {
  const [ todos, setTodos ] = useState<TodoDictionary>({
    '1683128600': [
      { content: 'Hey there this is a simple task.', done: false },
      { content: 'Task from the same date', done: false }
    ],
    '1693128600': [
      { content: 'Another task', done: false }
    ]
  });
  const  [ baseTimestamp, setBaseTimestamp ] = useState<number>( getUnixTime(new Date()) );
  const [ currentPage, setCurrentPage ] = useState<Pages>(Pages.Calendar);

  const baseDate = fromUnixTime(baseTimestamp);

  const onMonthChange = (_: any, increment: number) => {
    setBaseTimestamp( getUnixTime( addMonths(baseDate, increment) ) );
  }

  const onDatePress = (_: any, date: Date) => {
    let key = String( getUnixTime(date) );
    let copyTodos = copy(todos);
    if (!copyTodos[key]) copyTodos[key] = [];
    copyTodos[key].push({ content: '', done: false }) 
    setTodos(copyTodos);
    setCurrentPage(Pages.TodoList);
  }

  const onAction = (key: string, index: number | null, action: "add" | "edit" | "delete", entry: TodoEntry | null) => {
    let copyTodos = copy(todos);
    let entries = copyTodos[key];

    switch (action) {
      case 'add':
        // prevent adding more empty tasks if latest task is empty
        if (entries.length > 0 && entries[entries.length-1].content.length == 0) return;
        copyTodos[key].push({ content: '', done: false }) 
        setTodos(copyTodos);
        break;

      case 'edit':
        copyTodos[key][index!] = entry!;
        setTodos(copyTodos);
        break;

      case 'delete':
        break;
      default:
        break;
    }
  }

  const onClose = () => {
    setCurrentPage(Pages.Calendar);
  }

  // cleanup function here
  useEffect(() => {
    if (currentPage !== Pages.TodoList) {
      const copyTodos = copy(todos);

      for (const key in copyTodos) {
        let entries = copyTodos[key];
        copyTodos[key] = entries.filter((entry: TodoEntry) => entry.content.length > 0 && !entry.done);
        if (copyTodos[key].length === 0) delete copyTodos[key];
      }
      setTodos(copyTodos);
    }
  }, [currentPage]);


  return (
    <ScrollView style={{ backgroundColor: '#fff' }}>
        <AppBar />
        { currentPage === Pages.Calendar && <Calendar baseDate={baseDate} onMonthChange={onMonthChange} onDatePress={onDatePress} /> }
        { currentPage === Pages.TodoList && <TodoList todos={todos} onAction={onAction} onClose={onClose}/> }
    </ScrollView>
  );
}

export default App;