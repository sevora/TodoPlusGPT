import { FC, useEffect } from 'react';
import { BackHandler, Image, StyleSheet, SafeAreaView, Text, TextInput, TouchableHighlight } from 'react-native';
import { fromUnixTime, format } from 'date-fns';

import { TodoDictionary, TodoEntry } from './shared.types';

export interface TodoListProps {
  todos?: TodoDictionary;
  onAction?: (key: string, index: number | null, action: "add" | "edit" | "delete", entry: TodoEntry | null) => void;
  onClose?: () => void;
}

const TodoList: FC<TodoListProps> = ({ todos={}, onAction, onClose }) => {
  let sortedTodoKeys = Object.keys(todos).sort((x, y) => {
    return Number(x) - Number(y);
  });

  const handleBackButton = () => {
    onClose && onClose();
    return true;
  }

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", handleBackButton);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", handleBackButton)
    }
  }, []);

  return (
    <SafeAreaView style={styles.todoListContainer}>
      { sortedTodoKeys.map(key => {
        let date = fromUnixTime( Number(key) );

        const handleAdd = () => {
          onAction && onAction(key, null, "add", { content: '', done: false } as TodoEntry);
        }

        const handleEdit = (index: number, content: string, done: boolean) => {
          onAction && onAction(key, index, "edit", { content, done } as TodoEntry);
        }

        const handleDelete = (index: number) => {
          onAction && onAction(key, index, "delete", null);
        }

        return (
          <TodoGroup 
            key={key} 
            date={date} 
            entries={todos[key]}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )
      }) }
    </SafeAreaView>
  )
}

export interface TodoGroupProps {
  date: Date;
  entries: TodoEntry[];
  onAdd?: () => void;
  onEdit?: (index: number, content: string, done: boolean) => void;
  onDelete?: (index: number) => void;
  [otherProperty: string]: any;
}

const TodoGroup: FC<TodoGroupProps> = ({ date, entries, onAdd, onEdit, onDelete }) => {
  return (
    <SafeAreaView style={styles.todoGroupContainer}>
      <TodoHeader date={date} onAdd={onAdd} />
      <SafeAreaView style={styles.todoGroupItemContainer}>
        { entries.map((entry, index) => {

          const handleEditItem = (content: string, done: boolean) => {
            onEdit && onEdit(index, content, done);
          }

          const handleDeleteItem = () => {
            onDelete && onDelete(index);
          }

          return (
            <TodoItem 
              key={index}
              content={entry.content}
              done={entry.done}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
            />
          )
        } )}
      </SafeAreaView>
    </SafeAreaView>
  )
}

export interface TodoHeaderProps {
  date: Date;
  onAdd?: () => void;
}

const TodoHeader: FC<TodoHeaderProps> = ({ date, onAdd }) => {
  return (
    <SafeAreaView style={styles.todoHeaderContainer}>
      <Text style={styles.todoHeaderText}>{ format(date, 'MMMM dd, yyyy') }</Text>

      <TouchableHighlight onPress={onAdd} underlayColor='#eee'>
        <Image source={require('./../assets/icons/add.png')} style={{ height: 20, width: 20, opacity: 0.5 }} resizeMode='contain'/>
      </TouchableHighlight>
    </SafeAreaView>
  )
}

export interface TodoItemProps {
  content: string;
  done: boolean;
  onEdit?: (content: string, done: boolean) => void;
  onDelete?: () => void;
}

const TodoItem: FC<TodoItemProps> = ({ content, done, onEdit, onDelete }) => {
  const emptyCheckbox = require('./../assets/icons/checkbox_empty.png');
  const filledCheckbox = require('./../assets/icons/checkbox_filled.png');

  let containerStyle: any = { ...styles.todoItemContainer };
  let textStyle: any = { ...styles.todoItemText };

  if (done) {
    containerStyle = { ...containerStyle, backgroundColor: '#eee' };
    textStyle = { ...textStyle, color: '#bbb', textDecorationLine: 'line-through' };
  }

  return (
    <SafeAreaView style={containerStyle}>
      
      <TouchableHighlight onPress={onEdit ? () => onEdit(content, !done) : undefined} underlayColor='#eee'>
        <Image source={done ? filledCheckbox : emptyCheckbox} style={{ height: 20, width: 20, opacity: done ? 0.1 : 0.5 }} resizeMode='contain'/>
      </TouchableHighlight>

      <TextInput placeholder='Enter your task here...' placeholderTextColor='#666' autoComplete='off' multiline={true} style={textStyle} value={content} onChangeText={onEdit && !done ? (text) => onEdit(text, done) : undefined}/>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  todoListContainer: {
    padding: 0
  },

  todoGroupContainer: {
    marginBottom: 0
  },

  todoGroupItemContainer: {
    padding: 10
  },

  todoHeaderContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    padding: 5,
    paddingRight: 10,

    borderBottomColor: '#eee',
    borderBottomWidth: 2
  },

  todoHeaderText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#222'
  },

  todoItemContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    
    padding: 5,
    paddingLeft: 10,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#f5f5f5'
  },

  todoItemText: {
    padding: 5,
    fontSize: 18,
    color: '#222',
    marginRight: 25
  }
});

export default TodoList;