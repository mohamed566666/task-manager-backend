import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';

const columnHeaders = {
  todo: { label: 'To Do', color: '#94a3b8', dot: '#94a3b8' },
  'in-progress': { label: 'In Progress', color: '#818cf8', dot: '#6366f1' },
  done: { label: 'Done', color: '#4ade80', dot: '#22c55e' },
};

const Column = ({ id, tasks }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const header = columnHeaders[id];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: '320px', width: '320px', flex: '0 0 320px' }}>
      {/* Column Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: header.dot, boxShadow: `0 0 8px ${header.dot}` }}></div>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#e2e8f0', margin: 0 }}>{header.label}</h3>
          <span style={{ background: 'rgba(255,255,255,0.07)', color: '#64748b', fontSize: '0.78rem', fontWeight: 600, padding: '2px 8px', borderRadius: '6px' }}>
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        style={{
          flex: 1,
          minHeight: '500px',
          background: isOver ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.02)',
          border: isOver ? '1px dashed rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.06)',
          borderRadius: '20px',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          transition: 'all 0.2s',
        }}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => <TaskCard key={task.id} task={task} />)}
        </SortableContext>

        {tasks.length === 0 && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155', fontSize: '0.85rem', fontStyle: 'italic' }}>
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
};

export default Column;
