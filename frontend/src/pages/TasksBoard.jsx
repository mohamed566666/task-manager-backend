import React, { useState } from 'react';
import { DndContext, closestCorners, PointerSensor, KeyboardSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useTasks } from '../context/TaskContext';
import Column from '../components/board/Column';
import TaskCard from '../components/board/TaskCard';
import AddTaskModal from '../components/modals/AddTaskModal';
import { Plus, Filter } from 'lucide-react';

const TasksBoard = () => {
  const { tasks, updateTaskStatus, filterPriority, setFilterPriority } = useTasks();
  const [activeTask, setActiveTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const columns = ['todo', 'in-progress', 'done'];

  const handleDragStart = ({ active }) => {
    setActiveTask(tasks.find(t => t.id === active.id) || null);
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over) { setActiveTask(null); return; }
    const overId = over.id;
    if (columns.includes(overId)) {
      updateTaskStatus(active.id, overId);
    } else {
      const overTask = tasks.find(t => t.id === overId);
      if (overTask && overTask.status !== activeTask?.status) {
        updateTaskStatus(active.id, overTask.status);
      }
    }
    setActiveTask(null);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>Project Board</h1>
          <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.95rem' }}>Drag and drop tasks between columns</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '8px 14px' }}>
            <Filter size={15} color="#64748b" />
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.88rem', outline: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
            >
              <option value="all">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Add Task Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 8px 24px rgba(99,102,241,0.3)', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Plus size={18} />
            Add Task
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '16px', flex: 1 }}>
          {columns.map(colId => (
            <Column
              key={colId}
              id={colId}
              tasks={tasks.filter(t => t.status === colId)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>

      <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default TasksBoard;
