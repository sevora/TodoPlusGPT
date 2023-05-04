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
import LoadingScreen from './LoadingScreen';

const enum Pages {
  ApiKeyWindow,
  Calendar,
  TodoList,
  PromptWindow,
  LoadingScreen
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
    setCurrentPage(Pages.LoadingScreen);

    try {
      const response = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: `I am a bot that provides steps to achieve the goal specified below in a strict format in JSON. The result is an array of each step. Each step has a key called "day" which has a value of a number specifying the day it should be done. Another key is called "tasks" which is an array. That array is an of strings outlining the tasks for that day:
        Goal: """
        ${prompt.trim()}
        """

        Result:
        `.trim(),
        max_tokens: 1000,
        temperature: 1.0
      });

      console.log(response.data.choices[0].text);
      let result: { day: number, tasks: string[] }[] = JSON.parse(response.data.choices[0].text!);
      // console.log(result)
      // console.log(JSON.stringify(result, null, 2));
      // console.log(response.data.choices)

      // [
      //   {
      //     "day": 1,
      //     "steps": [
      //       "Research different violin techniques and decide which one you would like to focus on.",
      //       "Purchase a violin and necessary accessories.",
      //       "Find a qualified violin teacher to help you learn the basics of playing the instrument."
      //     ]
      //   },
      //   {
      //     "day": 2,
      //     "steps": [
      //       "Practice playing the violin for at least one hour a day.",
      //       "Listen to recordings of professional violinists and try to replicate their techniques.",
      //       "Ask your teacher for advice and tips on how to improve your playing."
      //     ]
      //   },
      //   {
      //     "day": 3,
      //     "steps": [
      //       "Continue to practice for at least one hour a day.",
      //       "Attend concerts and master classes to learn from professional violinists.",
      //       "Take part in competitions and performances to challenge yourself and gain experience."
      //     ]
      //   },
      //   {
      //     "day": 4,
      //     "steps": [
      //       "Continue to practice for at least one hour a day.",
      //       "Learn new pieces of music and work on perfecting them.",
      //       "Record yourself playing and listen back to evaluate your performance."
      //     ]
      //   },
      //   {
      //     "day": 5,
      //     "steps": [
      //       "Continue to practice for at least one hour a day.",
      //       "Take lessons from different teachers to gain different perspectives.",
      //       "Find a mentor who can help you reach your goals."
      //     ]
      //   }
      // ]

      let copyTodos = copy(todos);

      for (let entry of result) {  
        let offset = entry.day - 1;
        let key = getUnixTime( addDays(date, offset) );
        if (!copyTodos[key]) copyTodos[key] = [];

        for (let task of entry.tasks) {
         copyTodos[key].push({ content: task, done: false } as TodoEntry);
        }
      }
      setTodos(copyTodos);
      setCurrentPage(Pages.TodoList);
    } catch(error) {
      // add error handling such as toasts
      console.log(error)
    } finally {
      setCurrentPage(Pages.TodoList);
    }
  }

  const renderPage = (page: Pages) : JSX.Element => {
    const renders: { [key in Pages]: JSX.Element } = {
      [Pages.ApiKeyWindow]: <ApiKeyWindow onSubmit={handleApiKeySubmit} />,
      [Pages.Calendar]: <Calendar baseDate={baseDate} onMonthChange={handleMonthChangeCalendar} onDatePress={handleDatePressCalendar} />,
      [Pages.TodoList]: <TodoList todos={todos} onAction={handleActionTodo} onClose={handleCloseTodo}/>,
      [Pages.PromptWindow]: <PromptWindow initialDate={baseDate} onClose={handleClosePromptWindow} onSubmit={handleSubmitPromptWindow} />,
      [Pages.LoadingScreen]: <LoadingScreen />
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
        <AppBar showButton={[ Pages.LoadingScreen, Pages.ApiKeyWindow, Pages.PromptWindow].indexOf(currentPage) === -1} onPressButton={handlePressPromptWindow} />
        { renderPage(currentPage) }
      </SafeAreaView>
    </ScrollView>
  );
}

export default App;