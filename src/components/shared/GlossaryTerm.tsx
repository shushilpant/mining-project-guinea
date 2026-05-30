// ============================================================
// GlossaryTerm — wraps a piece of domain jargon so a first-timer can
// hover (or focus) it to read a plain-language definition. Falls back
// to rendering the text plainly if the term isn't in the glossary.
//
//   <GlossaryTerm term="PEP" />            → defined term "PEP"
//   <GlossaryTerm term="beneficial owner"> the real owner </GlossaryTerm>
// ============================================================

import type { ReactNode } from 'react';
import { lookupTerm } from '@/content/guide';
import { InfoTip } from '@/components/shared/InfoTip';

interface GlossaryTermProps {
  /** Key looked up in the glossary (case-insensitive). */
  term: string;
  /** Visible text; defaults to the matched term's canonical spelling. */
  children?: ReactNode;
  align?: 'start' | 'end' | 'center';
}

export function GlossaryTerm({ term, children, align = 'start' }: GlossaryTermProps) {
  const entry = lookupTerm(term);
  const label = children ?? entry?.term ?? term;

  // Unknown term → render plainly so we never show a broken affordance.
  if (!entry) return <>{label}</>;

  return (
    <InfoTip
      title={entry.term}
      body={entry.definition}
      label={`Definition of ${entry.term}`}
      align={align}
      className="!inline"
    >
      <span className="cursor-help border-b border-dotted border-ink-4/60 text-inherit underline-offset-2 hover:border-brand-600 hover:text-brand-700">
        {label}
      </span>
    </InfoTip>
  );
}
