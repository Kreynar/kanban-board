import {
  ADD_COLUMN,
  CHANGE_COLUMN_TITLE,
  REMOVE_COLUMN,
  ADD_TASK,
  CHANGE_TASK,
  REORDER_TASKS
} from "../actions";

const initialState = {
  columns: []
};

const getReorderedTasks = (tasks, taskSourceIndex, taskDestinationIndex) => {
  const result = Array.from(tasks);
  const [removed] = result.splice(taskSourceIndex, 1);
  result.splice(taskDestinationIndex, 0, removed);

  return result;
};

export default function rootReducer(state = initialState, { type, payload }) {
  let columns;
  switch (type) {
    case ADD_COLUMN:
      const idOfLastColumn =
        state.columns[state.columns.length - 1] &&
        state.columns[state.columns.length - 1].id;
      return {
        ...state,
        columns: [
          ...state.columns,
          {
            id: idOfLastColumn ? idOfLastColumn + 1 : 1,
            title: payload,
            tasks: []
          }
        ]
      };
    case CHANGE_COLUMN_TITLE:
      columns = state.columns.map(column =>
        column.id === payload.id ? { ...column, title: payload.title } : column
      );
      return {
        ...state,
        columns
      };
    case REMOVE_COLUMN:
      columns = state.columns.filter(column => column.id !== payload);
      return {
        ...state,
        columns
      };
    case ADD_TASK:
      const allColumnsTasks = state.columns.reduce(
        (tasks, column) => (tasks = [...tasks, ...column.tasks]),
        []
      );
      const taskWithHighestId = allColumnsTasks.sort(
        (taskPrevious, taskNext) => taskNext - taskPrevious
      )[0];
      columns = state.columns.map(column =>
        column.id === payload.columnId
          ? {
              ...column,
              tasks: [
                {
                  id: taskWithHighestId ? taskWithHighestId.id + 1 : 1,
                  title: payload.title,
                  description: payload.description
                },
                ...column.tasks
              ]
            }
          : column
      );
      return {
        ...state,
        columns
      };
    case CHANGE_TASK:
      columns = state.columns.map(column => ({
        ...column,
        tasks: column.tasks.map(task =>
          task.id === payload.taskId
            ? {
                ...task,
                title: payload.title,
                description: payload.description
              }
            : task
        )
      }));
      return {
        ...state,
        columns
      };
    case REORDER_TASKS:
      columns = state.columns.map(column => {
        if (column.id === payload.columnId) {
          return {
            ...column,
            tasks: getReorderedTasks(
              column.tasks,
              payload.taskSourceIndex,
              payload.taskDestinationIndex
            )
          };
        } else {
          return column;
        }
      });
    default:
      return state;
  }
}
