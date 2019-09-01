export const ADD_COLUMN = "ADD_COLUMN";
export const CHANGE_COLUMN_TITLE = "CHANGE_COLUMN_TITLE";
export const REMOVE_COLUMN = "REMOVE_COLUMN";
export const ADD_TASK = "ADD_TASK";
export const CHANGE_TASK = "CHANGE_TASK";
export const REORDER_TASKS = "REORDER_TASKS";

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

export const createActionReorderTasks = (
  columnId,
  taskSourceIndex,
  taskDestinationIndex
) => ({
  type: REORDER_TASKS,
  payload: { columnId, taskSourceIndex, taskDestinationIndex }
});
