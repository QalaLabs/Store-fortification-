'use client';

import React, { useState, useMemo } from 'react';
import { AgentPaymentTransaction, VerificationOutcome } from '@/types/agentPayment';
import { TransactionDetailDrawer } from './TransactionDetailDrawer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/formatters';
import {
  Bot,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Lock,
  UserCheck,
} from 'lucide-react';
import { useAgentPayments } from '@/lib/api';

interface AgentPaymentVerificationProps {
  initialTransactions?: AgentPaymentTransaction[];
}

export function AgentPaymentVerification({
  initialTransactions,
}: AgentPaymentVerificationProps) {
  const { transactions: apiTransactions, isLoading, error, mode } = useAgentPayments();
  const transactions = initialTransactions || apiTransactions;
  const [selectedTx, setSelectedTx] = useState<AgentPaymentTransaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<VerificationOutcome | 'ALL'>('ALL');

  // Stats
  const totalCount = transactions.length;
  const verifiedCount = transactions.filter((t) => t.outcome === 'VERIFIED').length;
  const failedCount = totalCount - verifiedCount;
  const verifiedVolume = transactions
    .filter((t) => t.outcome === 'VERIFIED')
    .reduce((acc, t) => acc + t.amountCents / 100, 0);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (outcomeFilter !== 'ALL' && tx.outcome !== outcomeFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = tx.id.toLowerCase().includes(q);
        const matchAgent = tx.agent.agentName.toLowerCase().includes(q);
        const matchPrincipal = tx.principal.customerName.toLowerCase().includes(q);
        const matchMerchant = tx.merchantName.toLowerCase().includes(q);
        if (!matchId && !matchAgent && !matchPrincipal && !matchMerchant) {
          return false;
        }
      }
      return true;
    });
  }, [transactions, outcomeFilter, searchQuery]);

  const getOutcomeBadge = (outcome: VerificationOutcome) => {
    switch (outcome) {
      case 'VERIFIED':
        return (
          <Badge variant="success" size="sm">
            VERIFIED
          </Badge>
        );
      case 'OWNERSHIP_MISMATCH':
        return (
          <Badge variant="critical" size="sm" pulse>
            OWNERSHIP MISMATCH
          </Badge>
        );
      case 'LIMIT_EXCEEDED':
        return (
          <Badge variant="warning" size="sm">
            LIMIT EXCEEDED
          </Badge>
        );
      case 'EXPIRED_MANDATE':
        return (
          <Badge variant="neutral" size="sm">
            EXPIRED MANDATE
          </Badge>
        );
      case 'UNAUTHORIZED_MERCHANT':
        return (
          <Badge variant="high" size="sm">
            UNAUTHORIZED MERCHANT
          </Badge>
        );
      case 'INSUFFICIENT_EVIDENCE':
        return (
          <Badge variant="critical" size="sm">
            NO ATTESTATION
          </Badge>
        );
      default:
        return <Badge size="sm">{outcome}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1b2a45]">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
              <Bot className="h-6 w-6 text-cyan-400" />
              <span>Agent Payment Verification (R8)</span>
            </h2>
            <Badge variant="info" size="sm">
              WHO PAYS?
            </Badge>
            <Badge
              variant={mode === 'LIVE' ? 'success' : mode === 'ERROR' ? 'error' : 'neutral'}
              size="sm"
            >
              {mode === 'LIVE' ? 'LIVE VERIFICATION' : mode === 'ERROR' ? 'API DISCONNECTED' : 'DEMO MODE'}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Verifies autonomous agent checkout requests against customer mandates, spending limits, and payment method ownership.
          </p>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="bg-[#0d1524] px-3 py-1.5 rounded-lg border border-[#1b2a45] text-xs">
            <span className="text-slate-400">Total Requests:</span>{' '}
            <strong className="text-slate-100 font-mono">{totalCount}</strong>
          </div>
          <div className="bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-500/40 text-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 inline mr-1" />
            <span className="text-emerald-300">Verified:</span>{' '}
            <strong className="text-emerald-200 font-mono">{verifiedCount} (${verifiedVolume.toFixed(2)})</strong>
          </div>
          <div className="bg-red-950/40 px-3 py-1.5 rounded-lg border border-red-500/40 text-xs">
            <AlertTriangle className="h-3.5 w-3.5 text-red-400 inline mr-1" />
            <span className="text-red-300">Blocked / Review:</span>{' '}
            <strong className="text-red-200 font-mono">{failedCount}</strong>
          </div>
        </div>
      </div>

      {/* The Central Concept Callout */}
      <div className="p-4 rounded-lg bg-[#0d1524] border border-[#1b2a45] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Lock className="h-4 w-4 text-cyan-400" />
            <span>The 3 Guarantees of CARTGUARD R8 Payment Verification</span>
          </span>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
            &quot;Verified: paid by [customer] through [agent]&quot;
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-400 pt-1">
          <div className="p-2.5 rounded bg-[#090e17] border border-[#1b2a45]">
            <strong className="text-slate-200 block mb-0.5">1. Who is acting?</strong>
            Cryptographic attestation connects agent runtime token to verified customer principal.
          </div>
          <div className="p-2.5 rounded bg-[#090e17] border border-[#1b2a45]">
            <strong className="text-slate-200 block mb-0.5">2. What authority?</strong>
            Active mandate check validates category whitelist, merchant scope, and spending caps.
          </div>
          <div className="p-2.5 rounded bg-[#090e17] border border-[#1b2a45]">
            <strong className="text-slate-200 block mb-0.5">3. Who owns the payment?</strong>
            Billing address &amp; cardholder name matching prevents cross-account token theft.
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0d1524] p-3.5 rounded-lg border border-[#1b2a45] space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Transaction ID, Agent name, Principal or Merchant..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#090e17] border border-[#1b2a45] rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value as VerificationOutcome | 'ALL')}
              className="text-xs bg-[#090e17] border border-[#1b2a45] rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 w-full sm:w-auto"
            >
              <option value="ALL">All Outcomes ({totalCount})</option>
              <option value="VERIFIED">Verified ({verifiedCount})</option>
              <option value="EXPIRED_MANDATE">Expired Mandate</option>
              <option value="LIMIT_EXCEEDED">Spending Limit Exceeded</option>
              <option value="UNAUTHORIZED_MERCHANT">Unauthorized Merchant</option>
              <option value="OWNERSHIP_MISMATCH">Ownership Mismatch (P0)</option>
              <option value="INSUFFICIENT_EVIDENCE">Insufficient Evidence</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#0d1524] rounded-lg border border-[#1b2a45] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1b2a45] bg-[#0a0f1a] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-3">Agent Identity</th>
                <th className="py-3 px-3">Principal (Customer)</th>
                <th className="py-3 px-3">Merchant</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3">Verification Outcome</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b2a45]/60 text-slate-300">
              {filteredTransactions.map((tx) => {
                const isVerified = tx.outcome === 'VERIFIED';
                const formattedAmount = (tx.amountCents / 100).toFixed(2);

                return (
                  <tr
                    key={tx.id}
                    className={`hover:bg-[#121d31]/60 transition-colors cursor-pointer group ${
                      !isVerified ? 'bg-red-950/10' : ''
                    }`}
                    onClick={() => setSelectedTx(tx)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400 whitespace-nowrap">
                      {tx.id}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200">{tx.agent.agentName}</span>
                        <span className="font-mono text-[10px] text-slate-400">{tx.agent.agentId}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex flex-col">
                        <span className="text-slate-200">{tx.principal.customerName}</span>
                        <span className="font-mono text-[10px] text-slate-400">{tx.principal.customerEmail}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="text-slate-200">{tx.merchantName}</span>
                      <span className="text-[10px] text-slate-400 block">{tx.merchantCategory}</span>
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-100 whitespace-nowrap">
                      ${formattedAmount} {tx.currency}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {getOutcomeBadge(tx.outcome)}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTx(tx);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
                      >
                        <span>Audit Authority</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Drawer */}
      <TransactionDetailDrawer
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </div>
  );
}
