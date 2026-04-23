interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  return <div>{message}</div>;
}
