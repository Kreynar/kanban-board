import React from "react";
import { connect } from "react-redux";
import { createActionRemoveTask } from "store/actions";

const TaskPage = ({ history, task, columnTitle, removeTask }) => {
  const navigateToBoard = () => history.push("/");
  const handleTaskRemove = () => {
    removeTask(task.id);
    navigateToBoard();
  };
  return (
    <div>
      {task ? (
        <>
          <div>
            {task.id} - {task.title}
          </div>
          <div>Column: {columnTitle}</div>
          <div>Description: {task.description}</div>
          <div>Created at: {task.timeCreated}</div>
          <div>Updated at: {task.timeUpdated}</div>
          <div>
            <button onClick={handleTaskRemove}>Remove</button>
          </div>
          <div>
            <button onClick={navigateToBoard}>Back to board</button>
          </div>
        </>
      ) : (
        <>
          <div>Task not found</div>
          <div>
            <button onClick={navigateToBoard}>Back to board</button>
          </div>
        </>
      )}
    </div>
  );
};

const mapStateToProps = (state, componentProps) => {
  const task =
    componentProps.match.params.id &&
    state.columns
      .reduce((tasks, column) => (tasks = [...tasks, ...column.tasks]), [])
      .find(task => task.id === +componentProps.match.params.id);
  const column =
    componentProps.match.params.id &&
    state.columns.find(column =>
      column.tasks.some(task => task.id === +componentProps.match.params.id)
    );
  return {
    task,
    columnTitle: column && column.title
  };
};

const mapDispatchToProps = dispatch => ({
  removeTask: taskId => dispatch(createActionRemoveTask(taskId))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TaskPage);
