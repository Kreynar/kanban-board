import React, { Component } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Modal from "react-modal";
import { connect } from "react-redux";
import {
  createActionAddColumn,
  createActionChangeColumnTitle,
  createActionRemoveColumn,
  createActionAddTask,
  createActionChangeTask,
  createActionMoveTaskInSameColumn,
  createActionRemoveTask,
  createActionMoveTaskToAnotherColumn
} from "store/actions";
import { Link } from "react-router-dom";

Modal.setAppElement("#root");

// fake data generator
const getItems = (count, offset = 0) =>
  Array.from({ length: count }, (v, k) => k).map(k => ({
    id: `item-${k + offset}`,
    content: `item ${k + offset}`
  }));

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? "lightgreen" : "grey",

  // styles we need to apply on draggables
  ...draggableStyle
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  padding: grid,
  width: 250
});

const TITLE_REQUIRED_WARNING = "Please enter title";

class Board extends Component {
  state = {
    items: getItems(10),
    selected: getItems(5, 10),
    isColumnModalShown: false,
    editedColumnId: null,
    isTaskModalShown: false,
    editedTaskId: null,
    isTitleRequiredWarningShown: false
  };

  columnTitleInputRef = React.createRef();
  taskTitleInputRef = React.createRef();
  taskDescriptionInputRef = React.createRef();

  onDragEnd = result => {
    const { source, destination } = result;
    if (destination) {
      const sourceColumnId = source.droppableId;
      const destinationColumnId = destination.droppableId;
      if (sourceColumnId === destinationColumnId) {
        this.props.moveTaskInSameColumn(
          sourceColumnId,
          source.index,
          destination.index
        );
      } else {
        this.props.moveTaskToAnotherColumn(
          sourceColumnId,
          destinationColumnId,
          source.index,
          destination.index
        );
      }
    }
  };

  openColumnModal = (editedColumnId = null) => {
    this.setState({
      editedColumnId,
      isColumnModalShown: true,
      isTitleRequiredWarningShown: false
    });
  };

  closeColumnModal = () => this.setState({ isColumnModalShown: false });

  handleColumnModalSubmit = () => {
    if (this.columnTitleInputRef.current.value) {
      const { editedColumnId } = this.state;
      const { changeColumnTitle, addColumn } = this.props;
      if (editedColumnId) {
        changeColumnTitle(
          editedColumnId,
          this.columnTitleInputRef.current.value
        );
      } else {
        addColumn(this.columnTitleInputRef.current.value);
      }
      this.setState({ isColumnModalShown: false });
    } else {
      this.setState({ isTitleRequiredWarningShown: true });
    }
  };

  openTaskModal = ({ editedColumnId = null, editedTaskId = null }) => {
    this.setState({
      isTaskModalShown: true,
      editedTaskId,
      editedColumnId,
      isTitleRequiredWarningShown: false
    });
  };

  handleTaskModalSubmit = () => {
    const title = this.taskTitleInputRef.current.value;
    if (title) {
      const { editedTaskId, editedColumnId } = this.state;
      const { addTask, changeTask } = this.props;
      const description = this.taskDescriptionInputRef.current.value;
      if (editedTaskId) {
        changeTask(editedTaskId, title, description);
      } else {
        addTask(editedColumnId, title, description);
      }
      this.setState({ isTaskModalShown: false });
    } else {
      this.setState({ isTitleRequiredWarningShown: true });
    }
  };

  onTaskRemove = taskId => {
    this.setState({ isTaskModalShown: false });
    this.props.removeTask(taskId);
  };

  closeTaskModal = () => this.setState({ isTaskModalShown: false });

  render() {
    const {
      isColumnModalShown,
      isTaskModalShown,
      editedTaskId,
      editedColumnId,
      isTitleRequiredWarningShown
    } = this.state;
    const { columns, removeColumn } = this.props;
    const editedColumnTitle =
      editedColumnId &&
      columns.find(column => column.id === editedColumnId) &&
      columns.find(column => column.id === editedColumnId).title;
    const editedTask =
      editedTaskId &&
      columns
        .reduce((tasks, column) => (tasks = [...column.tasks, ...tasks]), [])
        .find(task => task.id === editedTaskId);

    return (
      <div>
        <button onClick={() => this.openColumnModal()}>Add column</button>
        <Modal isOpen={isColumnModalShown} contentLabel="Column">
          <>
            <div>
              <button onClick={this.closeColumnModal}>Close</button>
            </div>
            <div>
              Title:
              <input
                type="text"
                ref={this.columnTitleInputRef}
                defaultValue={editedColumnTitle}
              />
            </div>
            <div>
              <button onClick={this.handleColumnModalSubmit}>OK</button>
              {isTitleRequiredWarningShown && TITLE_REQUIRED_WARNING}
            </div>
          </>
        </Modal>
        <Modal isOpen={isTaskModalShown} contentLabel="Task">
          <>
            <div>
              <button onClick={this.closeTaskModal}>Close</button>
            </div>
            {editedTaskId && (
              <button>
                <Link to={`/tasks/${editedTaskId}`}>Go to page</Link>
              </button>
            )}
            <div>
              Title:
              <input
                type="text"
                ref={this.taskTitleInputRef}
                defaultValue={editedTask && editedTask.title}
              />
            </div>
            <div>
              Description:
              <input
                type="text"
                ref={this.taskDescriptionInputRef}
                defaultValue={editedTask && editedTask.description}
              />
            </div>
            {editedTaskId && (
              <div>
                <button onClick={() => this.onTaskRemove(editedTaskId)}>
                  Remove
                </button>
              </div>
            )}
            <div>
              <button onClick={() => this.handleTaskModalSubmit()}>OK</button>
              {isTitleRequiredWarningShown && TITLE_REQUIRED_WARNING}
            </div>
          </>
        </Modal>
        {columns.length ? (
          <DragDropContext onDragEnd={this.onDragEnd}>
            <div style={{ display: "flex" }}>
              {columns.map(column => (
                <Droppable droppableId={column.id} key={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      style={getListStyle(snapshot.isDraggingOver)}
                    >
                      <button onClick={() => this.openColumnModal(column.id)}>
                        {column.title}
                      </button>
                      {column.tasks.length === 0 && (
                        <button onClick={() => removeColumn(column.id)}>
                          Remove column
                        </button>
                      )}
                      <button
                        onClick={() =>
                          this.openTaskModal({ editedColumnId: column.id })
                        }
                      >
                        Add task
                      </button>
                      {column.tasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              onClick={() =>
                                this.openTaskModal({ editedTaskId: task.id })
                              }
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={getItemStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style
                              )}
                            >
                              <div>
                                {task.id} - {task.title}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        ) : (
          "No columns"
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  columns: state.columns
});

const mapDispatchToProps = dispatch => ({
  addColumn: title => dispatch(createActionAddColumn(title)),
  changeColumnTitle: (id, title) =>
    dispatch(createActionChangeColumnTitle(id, title)),
  removeColumn: id => dispatch(createActionRemoveColumn(id)),
  addTask: (columnId, title, description) =>
    dispatch(createActionAddTask(columnId, title, description)),
  changeTask: (taskId, title, description) =>
    dispatch(createActionChangeTask(taskId, title, description)),
  removeTask: taskId => dispatch(createActionRemoveTask(taskId)),
  moveTaskInSameColumn: (columnId, taskSourceIndex, taskDestinationIndex) =>
    dispatch(
      createActionMoveTaskInSameColumn(
        columnId,
        taskSourceIndex,
        taskDestinationIndex
      )
    ),
  moveTaskToAnotherColumn: (
    sourceColumnId,
    destinationColumnId,
    sourceTaskIndex,
    destinationTaskIndex
  ) =>
    dispatch(
      createActionMoveTaskToAnotherColumn(
        sourceColumnId,
        destinationColumnId,
        sourceTaskIndex,
        destinationTaskIndex
      )
    )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Board);
