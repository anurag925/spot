interface ConfirmBarProps {
  isActive: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmBar({ isActive, onCancel, onConfirm }: ConfirmBarProps) {
  return (
    <div
      className={`confirm-bar interactive ${isActive ? 'active' : ''}`}
      id="confirm-bar"
    >
      <button className="btn-secondary" onClick={onCancel}>
        Cancel
      </button>
      <button className="btn-primary" onClick={onConfirm}>
        Confirm Location
      </button>
    </div>
  );
}