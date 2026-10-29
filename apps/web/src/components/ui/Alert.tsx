import { clsx } from 'clsx';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

type Variant = 'error' | 'success' | 'warning' | 'info';

const variants = {
  error: { cls: 'bg-red-50 border-red-200 text-red-800', Icon: XCircle },
  success: { cls: 'bg-green-50 border-green-200 text-green-800', Icon: CheckCircle },
  warning: { cls: 'bg-yellow-50 border-yellow-200 text-yellow-800', Icon: AlertCircle },
  info: { cls: 'bg-blue-50 border-blue-200 text-blue-800', Icon: Info },
};

interface AlertProps {
  variant?: Variant;
  message: string | string[];
  className?: string;
}

export function Alert({ variant = 'error', message, className }: AlertProps) {
  const { cls, Icon } = variants[variant];
  const messages = Array.isArray(message) ? message : [message];
  return (
    <div className={clsx('flex gap-3 rounded-lg border p-3 text-sm', cls, className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex flex-col gap-1">
        {messages.map((m, i) => (
          <p key={i}>{m}</p>
        ))}
      </div>
    </div>
  );
}
