// Shows the rule and evidence that triggered a flag — the key explainability component.

interface RulePillProps {
  rule: string;
  evidence: string;
}

export function RulePill({ rule, evidence }: RulePillProps) {
  return (
    <div className="mt-3 rounded border border-line bg-surface-2 p-3 text-xs">
      <div className="font-medium text-ink-2 mb-1">
        <span className="text-ink-4 mr-1">Rule triggered:</span>
        {rule}
      </div>
      <div className="text-ink-3">
        <span className="font-medium text-ink-2">Evidence: </span>
        {evidence}
      </div>
    </div>
  );
}
