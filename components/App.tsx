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

  const createGoalPrompt = (goal: string) => {
    return (
      `Provide result in a strict JSON format given a text input. 
      Extract the number of days specified, use "days" as the key and a number as value. 
      Summarize the input, use "summary" as the key and the summary string as value.

      Input: 
      ${goal}
        
      Result:`
    )
  }

  const createStepsPrompt = (goalSummary: string, previousStepSummary: string, day: number) => {
    return (
      `Provide result in a strict JSON format given several inputs. 
      "Goal" specifies the goal and it must be used as context. 
      "Previous Step" specifies a summary of the previous step and must be heavily taken into consideration.
      "Day" specifies which day it is and it should be strictly remembered. 
      The result should have a key "steps" where its value is an array of strings that are concise specifying steps for that day formulated using the given inputs. 
      There should also be a "summary" key with the value being a string summarizing the "steps" generated.

      Goal: ${goalSummary}
      Previous Step: ${previousStepSummary}
      Day: ${day}
      
      Result:`
    )
  }

  const handleSubmitPromptWindow = async(prompt: string, date: Date) => {
    setCurrentPage(Pages.LoadingScreen); // improve loading screen

    try {
      const responseGoal = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: createGoalPrompt( prompt.trim() ),
        max_tokens: 700,
        temperature: 1.0
      });

      // console.log(response.data.choices[0].text);
      const goal: { days: number, summary: string } = JSON.parse(responseGoal.data.choices[0].text!);
      console.log(goal);
      const days = Math.min(goal.days, 20); // capped at 20 days

      let previousStepSummary: string = 'N/A';
      let copyTodos = copy(todos);

      for (let offset = 0; offset < days; ++offset) {
        let key = getUnixTime( addDays(date, offset) );
        if (!copyTodos[key]) copyTodos[key] = [];

        const responseStep = await openai.createCompletion({
          model: 'text-davinci-003',
          prompt: createStepsPrompt(goal.summary, previousStepSummary, offset + 1),
          max_tokens: 1000,
          temperature: 1.0  
        });

        const step: { steps: string[], summary: string } = JSON.parse(responseStep.data.choices[0].text!);
        console.log(step);
        previousStepSummary = step.summary;

        for (let content of step.steps) {
          copyTodos[key].push({ content, done: false } as TodoEntry);  
        }
      }

      setTodos(copyTodos);
      setCurrentPage(Pages.TodoList);
    } catch(error) {
      // add error handling such as toasts
      console.log(error);
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