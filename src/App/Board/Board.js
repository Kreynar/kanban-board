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
  createActionReorderTasks
} from "store/actions";

Modal.setAppElement("#root");

// fake data generator
const getItems = (count, offset = 0) =>
  Array.from({ length: count }, (v, k) => k).map(k => ({
    id: `item-${k + offset}`,
    content: `item ${k + offset}`
  }));

const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

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

class Board extends Component {
  state = {
    items: getItems(10),
    selected: getItems(5, 10),
    isColumnModalShown: false,
    editedColumnId: null,
    isTaskModalShown: false,
    editedTaskId: null
  };

  columnTitleInputRef = React.createRef();
  taskTitleInputRef = React.createRef();
  taskDescriptionInputRef = React.createRef();

  /**
   * A semi-generic way to handle multiple lists. Matches
   * the IDs of the droppable container to the names of the
   * source arrays stored in the state.
   */
  id2List = {
    droppable: "items",
    droppable2: "selected"
  };

  onDragEnd = result => {
    const getList = droppableId => this.state[this.id2List[droppableId]];

    const { source, destination } = result;

    if (destination) {
      const sourceColumnId = source.droppableId;
      const destinationColumnId = destination.droppableId;
      if (sourceColumnId === destinationColumnId) {
        this.props.reorderTasks(
          sourceColumnId,
          source.index,
          destination.index
        );
        // const column = reorder(
        //   this.props.columns.find(column => column.id === sourceColumnId),
        //   source.index,
        //   destination.index
        // );
        // let state = { column };
        // if (sourceColumnId === "droppable2") {
        //   state = { selected: column };
        // }
        // this.setState(state);
      } else {
        const result = move(
          this.getList(sourceColumnId),
          this.getList(destinationColumnId),
          source,
          destination
        );

        this.setState({
          items: result.droppable,
          selected: result.droppable2
        });
      }
    }
  };

  openColumnModal = (editedColumnId = null) => {
    this.setState({
      editedColumnId,
      isColumnModalShown: true
    });
  };

  closeColumnModal = () => this.setState({ isColumnModalShown: false });

  handleColumnModalSubmit = () => {
    const { editedColumnId } = this.state;
    const { changeColumnTitle, addColumn } = this.props;
    if (editedColumnId) {
      changeColumnTitle(editedColumnId, this.columnTitleInputRef.current.value);
    } else {
      addColumn(this.columnTitleInputRef.current.value);
    }
    this.setState({ isColumnModalShown: false });
  };

  openTaskModal = ({ editedColumnId = null, editedTaskId = null }) => {
    this.setState({ isTaskModalShown: true, editedTaskId, editedColumnId });
  };

  handleTaskModalSubmit = () => {
    const { editedTaskId, editedColumnId } = this.state;
    const { addTask, changeTask } = this.props;
    const title = this.taskTitleInputRef.current.value;
    const description = this.taskDescriptionInputRef.current.value;
    if (editedTaskId) {
      changeTask(editedTaskId, title, description);
    } else {
      addTask(editedColumnId, title, description);
    }
    this.setState({ isTaskModalShown: false });
  };

  closeTaskModal = () => this.setState({ isTaskModalShown: false });

  render() {
    const { isColumnModalShown, isTaskModalShown, editedTaskId } = this.state;
    const { columns, removeColumn } = this.props;
    return (
      <div>
        <button onClick={() => this.openColumnModal()}>Add column</button>
        <Modal isOpen={isColumnModalShown} contentLabel="Column">
          <>
            <button onClick={this.closeColumnModal}>Close</button>
            Title:
            <input type="text" ref={this.columnTitleInputRef} />
            <button onClick={this.handleColumnModalSubmit}>OK</button>
          </>
        </Modal>
        <Modal isOpen={isTaskModalShown} contentLabel="Task">
          <>
            <button onClick={this.closeTaskModal}>Close</button>
            Title:
            <input type="text" ref={this.taskTitleInputRef} />
            Description:
            <input type="text" ref={this.taskDescriptionInputRef} />
            <button onClick={() => this.removeTask(editedTaskId)}>
              Remove
            </button>
            <button onClick={() => this.handleTaskModalSubmit()}>OK</button>
          </>
        </Modal>
        {columns.length ? (
          <DragDropContext onDragEnd={this.onDragEnd}>
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
  reorderTasks: (columnId, taskSourceIndex, taskDestinationIndex) =>
    dispatch(
      createActionReorderTasks(columnId, taskSourceIndex, taskDestinationIndex)
    )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Board);
