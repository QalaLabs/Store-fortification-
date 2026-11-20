'use client';

import React from 'react';
import Link from 'next/link';
import { AgentPaymentTransaction } from '@/types/agentPayment';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/formatters';
import {
  X,
  Bot,
  User,
  CreditCard,
  FileCheck2,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface TransactionDetailDrawerProps {
  transaction: AgentPaymentTransaction | null;
  onClose: () => void;
}

export function TransactionDetailDrawer({
  transaction,
  onClose,
}: TransactionDetailDrawerProps) {
  if (!transaction) return null;

  const isVerified = transaction.outcome === 'VERIFIED';
  const formattedAmount = (transaction.amountCents / 100).toFixed(2);
  const formattedLimit = (transaction.mandate.spendingLimitCents / 100).toFixed(2);
  const formattedSpent = (transaction.mandate.spentSoFarCents / 100).toFixed(2);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d1524] border border-[#1b2a45] rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#1b2a45] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-slate-200">
                {transaction.id}
              </span>
              <Badge
                variant={isVerified ? 'success' : 'critical'}
                size="sm"
                pulse={!isVerified}
              >
                {transaction.outcome.replace(/_/g, ' ')}
              </Badge>
            </div>
            <h3 className="text-base font-bold text-slate-100 mt-1">
              R8 Agent Payment Authority Assessment
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Central Verification Outcome Banner */}
        <div
          className={`p-3.5 rounded-lg border text-xs space-y-1 ${
            isVerified
              ? 'bg-emerald-950/25 border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/25 border-red-500/40 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            {isVerified ? (
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-400" />
            )}
            <span>{transaction.verificationMessage}</span>
          </div>

          {transaction.failureReason && (
            <p className="text-[11px] text-slate-300 pt-1 border-t border-red-500/20">
              <strong>Failure Cause:</strong> {transaction.failureReason}
            </p>
          )}

          {transaction.recommendedReviewAction && (
            <p className="text-[11px] text-amber-300 font-medium">
              <strong>Action:</strong> {transaction.recommendedReviewAction}
            </p>
          )}
        </div>

        {/* The 3 Core Questions from Whiteboard & PRD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* 1. Who is acting? */}
          <div className="p-3 bg-[#090e17] rounded-lg border border-[#1b2a45] space-y-2">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold border-b border-[#1b2a45]/60 pb-1.5">
              <Bot className="h-3.5 w-3.5 text-cyan-400" />
              <span>1. Who is Acting?</span>
            </div>
            <div className="space-y-1 text-slate-400">
              <div>
                Agent: <strong className="text-slate-200">{transaction.agent.agentName}</strong>
              </div>
              <div>ID: <span className="font-mono text-slate-300">{transaction.agent.agentId}</span></div>
              <div>Type: <span className="text-slate-300">{transaction.agent.agentType}</span></div>
              <div>
                Principal: <strong className="text-slate-200">{transaction.principal.customerName}</strong>
              </div>
              <div>Customer ID: <span className="font-mono text-slate-300">{transaction.principal.customerId}</span></div>
              <div>Runtime: <span className="text-[10px] text-slate-400">{transaction.agent.runtimeEnvironment}</span></div>
            </div>
          </div>

          {/* 2. What authority does the agent have? */}
          <div className="p-3 bg-[#090e17] rounded-lg border border-[#1b2a45] space-y-2">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold border-b border-[#1b2a45]/60 pb-1.5">
              <FileCheck2 className="h-3.5 w-3.5 text-blue-400" />
              <span>2. Agent Authority</span>
            </div>
            <div className="space-y-1 text-slate-400">
              <div>Mandate: <span className="font-mono text-slate-300">{transaction.mandate.mandateId}</span></div>
              <div>
                Limit: <strong className="text-slate-200">${formattedLimit}</strong>
              </div>
              <div>
                Spent so far: <span className="font-mono text-slate-300">${formattedSpent}</span>
              </div>
              <div>
                Expiry: <span className="font-mono text-slate-300">{transaction.mandate.expiresAt.split('T')[0]}</span>
              </div>
              <div className="text-[10px]">
                Allowed: {transaction.mandate.allowedMerchants.join(', ')}
              </div>
            </div>
          </div>

          {/* 3. Who owns the payment method? */}
          <div className="p-3 bg-[#090e17] rounded-lg border border-[#1b2a45] space-y-2">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold border-b border-[#1b2a45]/60 pb-1.5">
              <CreditCard className="h-3.5 w-3.5 text-amber-400" />
              <span>3. Payment Owner</span>
            </div>
            <div className="space-y-1 text-slate-400">
              <div>
                Cardholder: <strong className="text-slate-200">{transaction.paymentMethod.ownerName}</strong>
              </div>
              <div>
                Card: <span className="font-mono text-slate-300">{transaction.paymentMethod.cardBrand} •••• {transaction.paymentMethod.last4}</span>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px]">Name Match:</span>
                <Badge
                  variant={transaction.paymentMethod.nameMatchesPrincipal ? 'success' : 'critical'}
                  size="sm"
                >
                  {transaction.paymentMethod.nameMatchesPrincipal ? 'MATCH' : 'MISMATCH'}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px]">Billing Match:</span>
                <span className={transaction.paymentMethod.billingAddressMatch ? 'text-emerald-400' : 'text-red-400'}>
                  {transaction.paymentMethod.billingAddressMatch ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Request Payload Summary */}
        <div className="p-3 bg-[#090e17] rounded-lg border border-[#1b2a45] space-y-2 text-xs">
          <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px] block">
            Transaction Execution Intent
          </span>
          <div className="flex flex-wrap items-center justify-between gap-3 text-slate-400">
            <div>
              Merchant: <strong className="text-slate-100">{transaction.merchantName}</strong> ({transaction.merchantCategory})
            </div>
            <div>
              Amount: <strong className="text-xl font-mono text-slate-100">${formattedAmount} {transaction.currency}</strong>
            </div>
            <div>
              Timestamp: <span className="font-mono text-slate-300">{formatDateTime(transaction.timestamp)}</span>
            </div>
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1b2a45]">
          <div className="flex items-center gap-2">
            {!isVerified && (
              <Link
                href={transaction.id === 'tx-agent-2026-8804' ? '/incidents/INC-2026-0841' : '/incidents'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-500/40 text-xs font-semibold transition-colors"
              >
                <span>
                  {transaction.id === 'tx-agent-2026-8804'
                    ? 'Open Correlated Incident (INC-2026-0841)'
                    : 'Investigate in Incident Queue'}
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
