import {
  ADD_COLUMN,
  CHANGE_COLUMN_TITLE,
  REMOVE_COLUMN,
  ADD_TASK,
  CHANGE_TASK,
  MOVE_TASK_IN_SAME_COLUMN,
  REMOVE_TASK,
  MOVE_TASK_TO_ANOTHER_COLUMN
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

const getReorderedColumns = ({
  sourceTasksArray,
  destinationTasksArray,
  sourceTaskIndex,
  destinationTaskIndex
}) => {
  const sourceTasksArrayClone = [...sourceTasksArray];
  const destinationTasksArrayClone = [...destinationTasksArray];
  const [removedTask] = sourceTasksArrayClone.splice(sourceTaskIndex, 1);
  destinationTasksArrayClone.splice(destinationTaskIndex, 0, removedTask);
  return {
    sourceTasksArray: sourceTasksArrayClone,
    destinationTasksArray: destinationTasksArrayClone
  };
};

export default function rootReducer(state = initialState, { type, payload }) {
  let columns, currentDateTime;
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
        (taskPrevious, taskNext) => taskNext.id - taskPrevious.id
      )[0];
      currentDateTime = new Date().toLocaleString("en-GB");
      columns = state.columns.map(column =>
        column.id === payload.columnId
          ? {
              ...column,
              tasks: [
                {
                  id: taskWithHighestId ? taskWithHighestId.id + 1 : 1,
                  title: payload.title,
                  description: payload.description,
                  timeCreated: currentDateTime,
                  timeUpdated: currentDateTime
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
      currentDateTime = new Date().toLocaleString("en-GB");
      columns = state.columns.map(column => ({
        ...column,
        tasks: column.tasks.map(task =>
          task.id === payload.taskId
            ? {
                ...task,
                title: payload.title,
                description: payload.description,
                timeUpdated: currentDateTime
              }
            : task
        )
      }));
      return {
        ...state,
        columns
      };
    case REMOVE_TASK:
      columns = state.columns.map(column => ({
        ...column,
        tasks: column.tasks.filter(task => task.id !== payload)
      }));
      return {
        ...state,
        columns
      };
    case MOVE_TASK_IN_SAME_COLUMN:
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
      return {
        ...state,
        columns
      };
    case MOVE_TASK_TO_ANOTHER_COLUMN:
      const { sourceTasksArray, destinationTasksArray } = getReorderedColumns({
        sourceTasksArray: state.columns.find(
          column => column.id === payload.sourceColumnId
        ).tasks,
        destinationTasksArray: state.columns.find(
          column => column.id === payload.destinationColumnId
        ).tasks,
        sourceTaskIndex: payload.sourceTaskIndex,
        destinationTaskIndex: payload.destinationTaskIndex
      });
      columns = state.columns.map(column => {
        if (column.id === payload.sourceColumnId) {
          return { ...column, tasks: sourceTasksArray };
        } else if (column.id === payload.destinationColumnId) {
          return { ...column, tasks: destinationTasksArray };
        } else return column;
      });
      return {
        ...state,
        columns
      };
    default:
      return state;
  }
}
