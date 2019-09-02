export const ADD_COLUMN = "ADD_COLUMN";
export const CHANGE_COLUMN_TITLE = "CHANGE_COLUMN_TITLE";
export const REMOVE_COLUMN = "REMOVE_COLUMN";
export const ADD_TASK = "ADD_TASK";
export const CHANGE_TASK = "CHANGE_TASK";
export const REMOVE_TASK = "REMOVE_TASK";
export const MOVE_TASK_IN_SAME_COLUMN = "MOVE_TASK_IN_SAME_COLUMN";
export const MOVE_TASK_TO_ANOTHER_COLUMN = "MOVE_TASK_TO_ANOTHER_COLUMN";

export const createActionAddColumn = title => ({
  type: ADD_COLUMN,
  payload: title
});

export const createActionChangeColumnTitle = (id, title) => ({
  type: CHANGE_COLUMN_TITLE,
  payload: { id, title }
});

export const createActionRemoveColumn = id => ({
  type: REMOVE_COLUMN,
  payload: id
});

export const createActionAddTask = (columnId, title, description) => ({
  type: ADD_TASK,
  payload: { columnId, title, description }
});

export const createActionChangeTask = (taskId, title, description) => ({
  type: CHANGE_TASK,
  payload: { taskId, title, description }
});

export const createActionRemoveTask = taskId => ({
  type: REMOVE_TASK,
  payload: taskId
});

export const createActionMoveTaskInSameColumn = (
  columnId,
  taskSourceIndex,
  taskDestinationIndex
) => ({
  type: MOVE_TASK_IN_SAME_COLUMN,
  payload: { columnId, taskSourceIndex, taskDestinationIndex }
});

export const createActionMoveTaskToAnotherColumn = (
  sourceColumnId,
  destinationColumnId,
  sourceTaskIndex,
  destinationTaskIndex
) => ({
  type: MOVE_TASK_TO_ANOTHER_COLUMN,
  payload: {
    sourceColumnId,
    destinationColumnId,
    sourceTaskIndex,
    destinationTaskIndex
  }
});
