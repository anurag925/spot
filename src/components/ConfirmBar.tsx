interface ConfirmBarProps {
  isActive: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmBar({ isActive, onCancel, onConfirm }: ConfirmBarProps) {
  return (
    <div className={`confirm-bar interactive ${isActive ? 'active' : ''}`}>
      <button onClick={onCancel}>
        Cancel
      </button>
      <button onClick={onConfirm}>
        Confirm Location
      </button>
    </div>
  );
}
