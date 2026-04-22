import { useState } from 'react';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../types';

interface AddSpotModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    story: string;
    category: string;
  }) => void;
  spotName: string;
  spotStory: string;
  selectedCategory: string;
  onNameChange: (name: string) => void;
  onStoryChange: (story: string) => void;
  onCategoryChange: (category: string) => void;
}

export function AddSpotModal({
  isVisible,
  onClose,
  onSubmit,
  spotName,
  spotStory,
  selectedCategory,
  onNameChange,
  onStoryChange,
  onCategoryChange,
}: AddSpotModalProps) {
  const handleSubmit = () => {
    onSubmit({ name: spotName, story: spotStory, category: selectedCategory });
  };

  return (
    <div
      className={`modal-overlay ${isVisible ? 'active' : ''}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal interactive">
        <div className="modal-header">
          <h2 className="modal-title">Spot Details</h2>
          <button className="close-card" id="close-modal" onClick={onClose}>
            <svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <line x1={18} y1={6} x2={6} y2={18} />
              <line x1={6} y1={6} x2={18} y2={18} />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Name your spot</label>
            <input
              type="text"
              className="form-input"
              id="spot-name"
              placeholder="The Secret Garden, Best Tacos Ever..."
              maxLength={50}
              value={spotName}
              onChange={(e) => onNameChange(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">What's the story?</label>
            <textarea
              className="form-textarea"
              id="spot-story"
              placeholder="This hidden courtyard has the best coffee..."
              maxLength={500}
              value={spotStory}
              onChange={(e) => onStoryChange(e.target.value)}
            />
            <p className="form-hint">Tell people why this place matters</p>
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <div className="category-selector">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  className={`category-option ${selectedCategory === key ? 'selected' : ''}`}
                  onClick={() => onCategoryChange(key)}
                >
                  <div className="dot" style={{ background: CATEGORY_COLORS[key] }} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="submit-btn"
            id="submit-btn"
            disabled={!spotName.trim()}
            onClick={handleSubmit}
          >
            Drop the Pin
          </button>
        </div>
      </div>
    </div>
  );
}
