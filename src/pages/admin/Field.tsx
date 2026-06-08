// Small labelled form-field wrapper used by the Admin create forms.
export function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-ink-2 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
