import 'react-native-url-polyfill/auto';
import React, { FC, useEffect, useState } from  'react';
import { ScrollView, SafeAreaView } from 'react-native';
import { addMonths, getUnixTime, fromUnixTime, addDays } from 'date-fns';
import { Configuration, OpenAIApi } from 'openai';
import copy from 'fast-copy';

import { TodoDictionary, TodoEntry } from './shared.types';

import ApiKeyWindow from './ApiKeyWindow';
import Calendar from './Calendar';
import AppBar from './AppBar';
import TodoList from './TodoList';
import PromptWindow from './PromptWindow';

const enum Pages {
  ApiKeyWindow,
  Calendar,
  TodoList,
  PromptWindow
}

const App: FC = () => {
  const [ todos, setTodos ] = useState<TodoDictionary>({});
  const [ apiKey, setApiKey ] = useState<string>('');
  const configuration = new Configuration({ apiKey });
  const openai = new OpenAIApi(configuration);

  const currentDate = new Date();
  const [ baseTimestamp, setBaseTimestamp ] = useState<number>( getUnixTime(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) );
  const [ currentPage, setCurrentPage ] = useState<Pages>(apiKey.length === 0 ? Pages.ApiKeyWindow : Pages.Calendar);
  const baseDate = fromUnixTime(baseTimestamp);

  const handleApiKeySubmit = (key: string) => {
    if (key.trim().length === 0) return;
    setApiKey(key);
    setCurrentPage(Pages.Calendar);
  }

  const handleMonthChangeCalendar = (_: any, increment: number) => {
    setBaseTimestamp( getUnixTime( addMonths(baseDate, increment) ) );
  }

  const handleDatePressCalendar = (_: any, date: Date) => {
    let key = String( getUnixTime(date) );
    let copyTodos = copy(todos);
    if (!copyTodos[key]) copyTodos[key] = [];
    copyTodos[key].push({ content: '', done: false });
    setTodos(copyTodos);
    setCurrentPage(Pages.TodoList);
  }

  const handleActionTodo = (key: string, index: number | null, action: "add" | "edit" | "delete", entry: TodoEntry | null) => {
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

  const handlePressPromptWindow = () => {
    setCurrentPage(Pages.PromptWindow);
  }

  const handleCloseTodo = () => {
    setCurrentPage(Pages.Calendar);
  }

  const handleClosePromptWindow = () => {
    setCurrentPage(Pages.Calendar);
  }

  const handleSubmitPromptWindow = async(prompt: string, date: Date) => {
    try {
      const response = await openai.createCompletion({
        model: 'text-davinci-001',
        prompt: `
        I am a bot that provides steps to achieve the goal specified below in a strict format in JSON. The JSON has a result key which has a value of an array of each step. Each step has a key called "day" which has a value of a number specifying the day it should be done and another key called content with the value of a string outlining the step:
        ${prompt.trim()}

        Result:
        `.trim(),
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.5
        
      });
     
      let result: { day: number, content: string }[] = JSON.parse(response.data.choices[0].text!);
      // console.log(JSON.stringify(result, null, 2));
      // console.log(response.data.choices)

      // let result: { day: number, content: string }[] = [
      //   {
      //     "day": 1,
      //     "content": "Do some basic stretches to limber up your body."
      //   },
      //   {
      //     "day": 2,
      //     "content": "Do some cardio exercises to get your heart rate up."
      //   },
      //   {
      //     "day": 3,
      //     "content": "Do some strength training exercises to tone your body."
      //   }
      // ]

      let copyTodos = copy(todos);

      for (let entry of result) {  
        let offset = entry.day - 1;
        let key = getUnixTime( addDays(date, offset) );
        if (!copyTodos[key]) copyTodos[key] = [];
        copyTodos[key].push({ content: entry.content, done: false } as TodoEntry);
      }
      setTodos(copyTodos);
      setCurrentPage(Pages.TodoList);
    } catch(error) {
      // add error handling such as toasts
      console.log(error)
    }
  }

  const renderPage = (page: Pages) : JSX.Element => {
    const renders: { [key in Pages]: JSX.Element } = {
      [Pages.ApiKeyWindow]: <ApiKeyWindow onSubmit={handleApiKeySubmit} />,
      [Pages.Calendar]: <Calendar baseDate={baseDate} onMonthChange={handleMonthChangeCalendar} onDatePress={handleDatePressCalendar} />,
      [Pages.TodoList]: <TodoList todos={todos} onAction={handleActionTodo} onClose={handleCloseTodo}/>,
      [Pages.PromptWindow]: <PromptWindow initialDate={baseDate} onClose={handleClosePromptWindow} onSubmit={handleSubmitPromptWindow} />
    };

    return renders[page];
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
      <SafeAreaView>
        <AppBar showButton={currentPage !== Pages.PromptWindow && currentPage !== Pages.ApiKeyWindow} onPressButton={handlePressPromptWindow} />
        { renderPage(currentPage) }
      </SafeAreaView>
    </ScrollView>
  );
}

export default App;