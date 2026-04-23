export function EmptyState() {
  return (
    <div className="empty-state">
      <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '20px', marginBottom: '8px', color: 'var(--text)' }}>
        No spots yet
      </h3>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
        Be the first to mark something special!
      </p>
    </div>
  );
}