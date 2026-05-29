import { useState, useMemo } from 'react';
import { useCountry } from '@/context/CountryContext';
import { useDataStore } from '@/store/dataStore';
import { getOperators, getPEPExposure, getBeneficialOwnerTree } from '@/services/dataService';
import { PageHeader } from '@/components/shared/PageHeader';
import { MetricCard } from '@/components/shared/MetricCard';
import { Users, AlertTriangle, Search, ChevronRight, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BeneficialOwnerNode } from '@/data/types';

export function OwnershipPage() {
  const { selectedCountry } = useCountry();
  const dataVersion = useDataStore((state) => state.version);
  const countryId = selectedCountry === 'ALL' ? undefined : selectedCountry;

  const operators = useMemo(() => getOperators(countryId), [countryId, dataVersion]);
  const pepExposure = useMemo(() => getPEPExposure(countryId), [countryId, dataVersion]);
  const ownerTrees = useMemo(() => {
    return operators.reduce((acc, op) => {
      acc[op.id] = getBeneficialOwnerTree(op.id);
      return acc;
    }, {} as Record<string, BeneficialOwnerNode[]>);
  }, [operators, dataVersion]);

  const totalOpaque = pepExposure.reduce((sum, exp) => sum + exp.opaqueEntities, 0);
  const totalPEPs = pepExposure.reduce((sum, exp) => sum + exp.pepCount, 0);

  const [selectedOperatorId, setSelectedOperatorId] = useState<string>(operators[0]?.id || '');

  const selectedTree = ownerTrees[selectedOperatorId] || [];
  
  // Basic tree structuring for rendering
  const rootNodes = selectedTree.filter(n => !n.parentId);
  
  const renderTree = (nodes: BeneficialOwnerNode[], depth = 0) => {
    return nodes.map(node => {
      const children = selectedTree.filter(n => n.parentId === node.id);
      return (
        <div key={node.id} className="mt-2">
          <div className={cn(
            "flex items-center justify-between p-3 rounded-lg border",
            node.isPEP ? "border-destructive bg-destructive/5" : "border-line bg-surface",
            depth > 0 ? "ml-8 relative" : ""
          )}>
            {depth > 0 && (
              <div className="absolute -left-8 top-1/2 w-8 h-px bg-line-strong" />
            )}
            
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[13px] text-ink">{node.name}</span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-2 text-ink-3 border border-line">
                  {node.entityType}
                </span>
                {node.isPEP && (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                    <ShieldAlert size={10} />
                    PEP
                  </span>
                )}
                {node.isOpaque && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-status-warning/10 text-status-warning border border-status-warning/20">
                    Opaque
                  </span>
                )}
              </div>
              <div className="text-[11px] text-ink-4">
                Jurisdiction: {node.jurisdiction}
                {node.isPEP && node.pepDetails && ` • ${node.pepDetails}`}
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-right">
              <div className="flex flex-col">
                <span className="text-[10px] text-ink-4 uppercase tracking-widest">Ownership</span>
                <span className="font-mono font-bold text-[14px] text-ink">{node.ownershipPercent}%</span>
              </div>
            </div>
          </div>
          
          {children.length > 0 && (
            <div className="relative border-l-2 border-line-strong ml-4 mt-2">
              {renderTree(children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Module 7 — Beneficial Ownership Tracker"
        subtitle="Hierarchical ownership structures, PEP exposure, and opaque entity detection."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="Monitored Operators" value={operators.length} icon={<Users size={16} />} accent="blue" />
        <MetricCard label="PEP Exposures" value={totalPEPs} icon={<ShieldAlert size={16} />} accent={totalPEPs > 0 ? "red" : "green"} />
        <MetricCard label="Opaque Entities" value={totalOpaque} icon={<AlertTriangle size={16} />} accent={totalOpaque > 0 ? "amber" : "green"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-surface rounded-xl border border-line shadow-card p-4">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-2 mb-4">Operator Selection</h2>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-4" size={14} />
              <input 
                type="text" 
                placeholder="Search operators..." 
                className="w-full bg-surface-2 border border-line rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
              {operators.map(op => {
                const exposure = pepExposure.find(e => e.operatorId === op.id);
                return (
                  <button
                    key={op.id}
                    onClick={() => setSelectedOperatorId(op.id)}
                    className={cn(
                      "w-full flex flex-col gap-1 p-3 rounded-lg text-left transition-colors border",
                      selectedOperatorId === op.id 
                        ? "bg-primary/5 border-primary/30" 
                        : "bg-surface-2 border-transparent hover:bg-surface hover:border-line"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[13px] text-ink">{op.name}</span>
                      <ChevronRight size={14} className={selectedOperatorId === op.id ? "text-primary" : "text-ink-4"} />
                    </div>
                    <div className="flex gap-2 text-[10px]">
                      {exposure?.pepCount ? (
                        <span className="text-destructive font-medium">{exposure.pepCount} PEP(s)</span>
                      ) : null}
                      {exposure?.opaqueEntities ? (
                        <span className="text-status-warning font-medium">{exposure.opaqueEntities} Opaque</span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-surface rounded-xl border border-line shadow-card p-5">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-2">Ownership Structure</h2>
                <p className="text-[13px] font-bold text-ink mt-1">
                  {operators.find(o => o.id === selectedOperatorId)?.name}
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-1.5 text-[11px] text-ink-3">
                  <span className="w-2 h-2 rounded-full bg-destructive" />
                  PEP Flag
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-ink-3">
                  <span className="w-2 h-2 rounded-full bg-status-warning" />
                  Opaque Entity
                </div>
              </div>
            </div>

            <div className="bg-canvas p-5 rounded-lg border border-line overflow-x-auto">
              {rootNodes.length > 0 ? (
                renderTree(rootNodes)
              ) : (
                <div className="text-center py-10 text-ink-4 text-sm">
                  No detailed beneficial ownership data available for this operator.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
