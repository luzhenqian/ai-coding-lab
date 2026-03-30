'use client';

import { useState, useEffect } from 'react';
import type { CardWithRelations, Priority } from '@/types';
import { useBoardContext } from '@/hooks/useBoard';
import { useSync } from '@/hooks/useSync';
import Modal from '@/components/ui/Modal';
import ColorPicker from '@/components/ui/ColorPicker';
import Checklist from './Checklist';
import TagBadge from './TagBadge';

interface CardDetailProps {
  card: CardWithRelations;
  onClose: () => void;
}

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: '#64748b' },
  { value: 'medium', label: 'Medium', color: '#3b82f6' },
  { value: 'high', label: 'High', color: '#f59e0b' },
  { value: 'urgent', label: 'Urgent', color: '#ef4444' },
];

export default function CardDetail({ card, onClose }: CardDetailProps) {
  const { state, dispatch } = useBoardContext();
  const { enqueue } = useSync();
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTagSelect, setShowTagSelect] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#8b5cf6');

  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description);
  }, [card.title, card.description]);

  const updateField = (changes: Partial<CardWithRelations>) => {
    dispatch({ type: 'UPDATE_CARD', id: card.id, changes });
    enqueue({ method: 'PATCH', url: `/api/cards/${card.id}`, body: changes });
  };

  const handleTitleBlur = () => {
    if (title.trim() !== card.title) updateField({ title: title.trim() });
  };

  const handleDescBlur = () => {
    if (description !== card.description) updateField({ description });
  };

  const handleArchive = () => {
    dispatch({ type: 'ARCHIVE_CARD', id: card.id });
    enqueue({ method: 'POST', url: `/api/cards/${card.id}/archive`, body: { action: 'archive' } });
    onClose();
  };

  const handleDelete = () => {
    dispatch({ type: 'DELETE_CARD', id: card.id });
    enqueue({ method: 'DELETE', url: `/api/cards/${card.id}` });
    onClose();
  };

  const handleToggleChecklist = (itemId: string) => {
    dispatch({ type: 'TOGGLE_CHECKLIST_ITEM', cardId: card.id, itemId });
    const item = card.checklist.find(i => i.id === itemId);
    if (item) {
      enqueue({ method: 'PATCH', url: `/api/checklist/${itemId}`, body: { checked: !item.checked } });
    }
  };

  const handleAddChecklistItem = async (text: string) => {
    const res = await fetch('/api/checklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId: card.id, text }),
    });
    const item = await res.json();
    dispatch({ type: 'ADD_CHECKLIST_ITEM', cardId: card.id, item });
  };

  const handleDeleteChecklistItem = (itemId: string) => {
    dispatch({ type: 'DELETE_CHECKLIST_ITEM', cardId: card.id, itemId });
    enqueue({ method: 'DELETE', url: `/api/checklist/${itemId}` });
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    const res = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTagName.trim(), color: newTagColor }),
    });
    const tag = await res.json();
    dispatch({ type: 'ADD_TAG', tag });
    await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'link', cardId: card.id, tagId: tag.id }),
    });
    dispatch({ type: 'ADD_CARD_TAG', cardId: card.id, tagId: tag.id });
    setNewTagName('');
  };

  const handleToggleExistingTag = async (tagId: string) => {
    const hasTag = card.tags.some(t => t.id === tagId);
    if (hasTag) {
      dispatch({ type: 'REMOVE_CARD_TAG', cardId: card.id, tagId });
      enqueue({ method: 'POST', url: '/api/tags', body: { action: 'unlink', cardId: card.id, tagId } });
    } else {
      dispatch({ type: 'ADD_CARD_TAG', cardId: card.id, tagId });
      enqueue({ method: 'POST', url: '/api/tags', body: { action: 'link', cardId: card.id, tagId } });
    }
  };

  return (
    <Modal open={true} onClose={onClose} title="Card Details">
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        onBlur={handleTitleBlur}
        className="w-full text-lg font-semibold bg-transparent border-b border-transparent hover:border-[#2a2a4a] focus:border-blue-500 text-slate-100 focus:outline-none pb-1 mb-4"
      />
      <div className="mb-4">
        <button onClick={() => setShowColorPicker(!showColorPicker)} className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: card.color }} />
          Color
        </button>
        {showColorPicker && (
          <div className="mt-2">
            <ColorPicker value={card.color} onChange={color => { updateField({ color }); setShowColorPicker(false); }} />
          </div>
        )}
      </div>
      <div className="mb-4">
        <label className="text-sm text-slate-400 block mb-1">Priority</label>
        <div className="flex gap-2">
          {PRIORITIES.map(p => (
            <button
              key={p.value}
              onClick={() => updateField({ priority: p.value })}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                card.priority === p.value
                  ? 'ring-1 ring-offset-1 ring-offset-[#16213e]'
                  : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                backgroundColor: p.color + '30',
                color: p.color,
                ...(card.priority === p.value ? { ringColor: p.color } : {}),
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <label className="text-sm text-slate-400 block mb-1">Due Date</label>
        <input
          type="date"
          value={card.dueDate ? new Date(card.dueDate * 1000).toISOString().split('T')[0] : ''}
          onChange={e => {
            const ts = e.target.value ? Math.floor(new Date(e.target.value).getTime() / 1000) : null;
            updateField({ dueDate: ts });
          }}
          className="px-3 py-1.5 rounded-lg bg-[#1a1a2e] border border-[#2a2a4a] text-slate-200 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>
      <div className="mb-4">
        <label className="text-sm text-slate-400 block mb-1">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          onBlur={handleDescBlur}
          rows={3}
          placeholder="Add a description..."
          className="w-full px-3 py-2 rounded-lg bg-[#1a1a2e] border border-[#2a2a4a] text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>
      <div className="mb-4">
        <label className="text-sm text-slate-400 block mb-2">Tags</label>
        <div className="flex flex-wrap gap-1 mb-2">
          {card.tags.map(tag => (
            <button key={tag.id} onClick={() => handleToggleExistingTag(tag.id)}>
              <TagBadge tag={tag} />
            </button>
          ))}
        </div>
        <button onClick={() => setShowTagSelect(!showTagSelect)} className="text-xs text-blue-400 hover:text-blue-300">
          + Manage tags
        </button>
        {showTagSelect && (
          <div className="mt-2 p-3 bg-[#1a1a2e] rounded-lg border border-[#2a2a4a]">
            <div className="space-y-1 mb-2">
              {state.tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => handleToggleExistingTag(tag.id)}
                  className={`flex items-center gap-2 w-full text-left px-2 py-1 rounded text-sm ${
                    card.tags.some(t => t.id === tag.id) ? 'bg-[#2a2a4a]' : 'hover:bg-[#2a2a4a]/50'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                  <span className="text-slate-300">{tag.name}</span>
                  {card.tags.some(t => t.id === tag.id) && <span className="ml-auto text-green-400 text-xs">✓</span>}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-2 pt-2 border-t border-[#2a2a4a]">
              <input
                value={newTagName}
                onChange={e => setNewTagName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                placeholder="New tag..."
                className="flex-1 px-2 py-1 rounded bg-[#16213e] border border-[#2a2a4a] text-slate-200 text-xs focus:outline-none focus:border-blue-500"
              />
              <button onClick={handleAddTag} className="px-2 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700">Add</button>
            </div>
          </div>
        )}
      </div>
      <div className="mb-4">
        <Checklist
          items={card.checklist}
          onToggle={handleToggleChecklist}
          onAdd={handleAddChecklistItem}
          onDelete={handleDeleteChecklistItem}
        />
      </div>
      <div className="flex justify-between pt-4 border-t border-[#2a2a4a]">
        <button onClick={handleArchive} className="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-amber-400 hover:bg-amber-400/10">
          Archive
        </button>
        <button onClick={handleDelete} className="px-3 py-1.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10">
          Delete
        </button>
      </div>
    </Modal>
  );
}
