'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  ShieldAlert,
} from 'lucide-react';
import { useAgentPayments } from '@/lib/api';

interface AgentPaymentVerificationProps {
  initialTransactions?: AgentPaymentTransaction[];
}

export function AgentPaymentVerification({
  initialTransactions,
}: AgentPaymentVerificationProps) {
  const searchParams = useSearchParams();
  const highlightTxId = searchParams.get('highlightTx');

  const { transactions: apiTransactions, isLoading, error, mode } = useAgentPayments();
  const transactions = initialTransactions || apiTransactions;
  const [selectedTx, setSelectedTx] = useState<AgentPaymentTransaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<VerificationOutcome | 'ALL'>('ALL');

  useEffect(() => {
    if (highlightTxId && transactions.length > 0) {
      const match = transactions.find((t) => t.id === highlightTxId);
      if (match) {
        setSelectedTx(match);
      }
    }
  }, [highlightTxId, transactions]);

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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#302A28]">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-[#F3EEEC] flex items-center gap-2.5">
              <Bot className="h-6 w-6 text-[#A20903]" />
              <span>Agent Payment Verification (R8)</span>
            </h2>
            <Badge variant="neutral" size="sm">
              WHO PAYS?
            </Badge>
            <Badge
              variant={mode === 'LIVE' ? 'success' : mode === 'ERROR' ? 'error' : 'neutral'}
              size="sm"
            >
              {mode === 'LIVE' ? 'LIVE VERIFICATION' : mode === 'ERROR' ? 'API DISCONNECTED' : 'DEMO MODE'}
            </Badge>
          </div>
          <p className="text-xs text-[#A79B96] mt-1 max-w-2xl">
            Verifies autonomous agent checkout requests against customer mandates, spending limits, and payment method ownership.
          </p>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="bg-[#141211] px-3 py-1.5 rounded-lg border border-[#302A28] text-xs">
            <span className="text-[#756B67]">Total Requests:</span>{' '}
            <strong className="text-[#F3EEEC] font-mono">{totalCount}</strong>
          </div>
          <div className="bg-[#26502B]/30 px-3 py-1.5 rounded-lg border border-[#26502B] text-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-[#4ADE80] inline mr-1" />
            <span className="text-[#86EFAC]">Verified:</span>{' '}
            <strong className="text-[#86EFAC] font-mono">{verifiedCount} (${verifiedVolume.toFixed(2)})</strong>
          </div>
          <div className="bg-[#5C1811]/30 px-3 py-1.5 rounded-lg border border-[#A20903]/40 text-xs">
            <AlertTriangle className="h-3.5 w-3.5 text-[#A20903] inline mr-1" />
            <span className="text-[#FCA5A5]">Blocked / Review:</span>{' '}
            <strong className="text-[#FCA5A5] font-mono">{failedCount}</strong>
          </div>
        </div>
      </div>

      {/* S1 Connected Demo Story Banner: Incident INC-2026-0841 Cross-Reference */}
      <div className="p-4 rounded-xl bg-[#141211] border border-[#A20903]/40 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-[#A20903]" />
            <span className="text-xs font-bold text-[#FCA5A5] uppercase tracking-wider">
              Step 5 in Connected Product Story: Correlated Agent Violation (R8 / Who Pays?)
            </span>
            <Badge variant="critical" size="sm">INC-2026-0841</Badge>
          </div>
          <Link
            href="/incidents/INC-2026-0841"
            className="text-xs text-[#D0C4C0] hover:text-[#F3EEEC] font-semibold flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Back to Incident Dossier</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#A20903]" />
          </Link>
        </div>
        <p className="text-xs text-[#A79B96] leading-relaxed">
          Under compromised session <code>sess-tok-84729a1b</code> (Victim: <strong>Victoria Sterling</strong>, <code>usr-vip-9902</code>), an unauthorized checkout agent attempted an $850.00 luxury purchase using an unlinked credit card registered to <strong>Elena Rostova</strong> (<code>pm-visa-8802</code>). CARTGUARD R8 blocked the checkout due to <strong>OWNERSHIP_MISMATCH</strong>.
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <button
            onClick={() => {
              const tx = transactions.find((t) => t.id === 'tx-agent-2026-8804');
              if (tx) setSelectedTx(tx);
            }}
            className="px-3 py-1.5 rounded bg-[#5C1811]/40 hover:bg-[#5C1811]/60 text-[#FCA5A5] border border-[#A20903]/50 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-[#A20903]" />
            <span>Demonstrate Ownership Mismatch (tx-agent-2026-8804)</span>
          </button>
          <button
            onClick={() => {
              const tx = transactions.find((t) => t.id === 'tx-agent-2026-8801');
              if (tx) setSelectedTx(tx);
            }}
            className="px-3 py-1.5 rounded bg-[#26502B]/40 hover:bg-[#26502B]/60 text-[#86EFAC] border border-[#26502B] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-[#4ADE80]" />
            <span>Demonstrate Verified Case (&quot;Verified: paid by Sarah Miller through ShopBot&quot;)</span>
          </button>
          <Link
            href="/operations/response#audit-trail"
            className="px-3 py-1.5 rounded bg-[#1D1A19] hover:bg-[#221E1D] text-[#D0C4C0] border border-[#302A28] font-semibold flex items-center gap-1 transition-colors"
          >
            <span>Step 6: Inspect Audit Journal &rarr;</span>
          </Link>
        </div>
      </div>

      {/* The Central Concept Callout */}
      <div className="p-4 rounded-lg bg-[#141211] border border-[#302A28] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#D0C4C0] uppercase tracking-wider flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#A2847B]" />
            <span>The 3 Guarantees of CARTGUARD R8 Payment Verification</span>
          </span>
          <span className="text-[11px] font-mono text-[#D0C4C0] bg-[#1D1A19] px-2 py-0.5 rounded border border-[#302A28]">
            &quot;Verified: paid by [customer] through [agent]&quot;
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-[#756B67] pt-1">
          <div className="p-2.5 rounded bg-[#100E0D] border border-[#302A28]">
            <strong className="text-[#F3EEEC] block mb-0.5">1. Who is acting?</strong>
            Cryptographic attestation connects agent runtime token to verified customer principal.
          </div>
          <div className="p-2.5 rounded bg-[#100E0D] border border-[#302A28]">
            <strong className="text-[#F3EEEC] block mb-0.5">2. What authority?</strong>
            Active mandate check validates category whitelist, merchant scope, and spending caps.
          </div>
          <div className="p-2.5 rounded bg-[#100E0D] border border-[#302A28]">
            <strong className="text-[#F3EEEC] block mb-0.5">3. Who owns the payment?</strong>
            Billing address &amp; cardholder name matching prevents cross-account token theft.
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#141211] p-3.5 rounded-lg border border-[#302A28] space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#756B67]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Transaction ID, Agent name, Principal or Merchant..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#100E0D] border border-[#302A28] rounded-md text-[#F3EEEC] placeholder-[#756B67] focus:outline-none focus:border-[#A20903]/60"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-3.5 w-3.5 text-[#756B67] shrink-0" />
            <select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value as VerificationOutcome | 'ALL')}
              className="text-xs bg-[#100E0D] border border-[#302A28] rounded-md px-2.5 py-1.5 text-[#F3EEEC] focus:outline-none focus:border-[#A20903]/60 w-full sm:w-auto"
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

        {/* Outcome Filter Quick Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[#302A28] text-xs">
          <span className="text-[11px] text-[#756B67] font-semibold mr-1">Quick Outcome Filters:</span>
          <button
            onClick={() => setOutcomeFilter('ALL')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              outcomeFilter === 'ALL'
                ? 'bg-[#1D1A19] text-[#F3EEEC] border border-[#A20903]'
                : 'bg-[#100E0D] text-[#756B67] hover:text-[#F3EEEC] border border-[#302A28]'
            }`}
          >
            All (6)
          </button>
          <button
            onClick={() => setOutcomeFilter('VERIFIED')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              outcomeFilter === 'VERIFIED'
                ? 'bg-[#26502B]/40 text-[#86EFAC] border border-[#26502B]'
                : 'bg-[#100E0D] text-[#86EFAC] hover:text-white border border-[#302A28]'
            }`}
          >
            Verified (1)
          </button>
          <button
            onClick={() => setOutcomeFilter('OWNERSHIP_MISMATCH')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              outcomeFilter === 'OWNERSHIP_MISMATCH'
                ? 'bg-[#5C1811]/60 text-[#FCA5A5] border border-[#A20903]'
                : 'bg-[#100E0D] text-[#FCA5A5] hover:text-white border border-[#A20903]/40'
            }`}
          >
            Ownership Mismatch (1 - INC-0841)
          </button>
          <button
            onClick={() => setOutcomeFilter('LIMIT_EXCEEDED')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              outcomeFilter === 'LIMIT_EXCEEDED'
                ? 'bg-[#78350F]/50 text-[#FDE047] border border-[#D97706]'
                : 'bg-[#100E0D] text-[#FDE047] hover:text-white border border-[#302A28]'
            }`}
          >
            Limit Exceeded (1)
          </button>
          <button
            onClick={() => setOutcomeFilter('EXPIRED_MANDATE')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              outcomeFilter === 'EXPIRED_MANDATE'
                ? 'bg-[#1D1A19] text-[#F3EEEC] border border-[#302A28]'
                : 'bg-[#100E0D] text-[#756B67] hover:text-[#F3EEEC] border border-[#302A28]'
            }`}
          >
            Expired Mandate (1)
          </button>
          <button
            onClick={() => setOutcomeFilter('UNAUTHORIZED_MERCHANT')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              outcomeFilter === 'UNAUTHORIZED_MERCHANT'
                ? 'bg-[#1D1A19] text-[#F3EEEC] border border-[#302A28]'
                : 'bg-[#100E0D] text-[#756B67] hover:text-[#F3EEEC] border border-[#302A28]'
            }`}
          >
            Unauthorized Merchant (1)
          </button>
          <button
            onClick={() => setOutcomeFilter('INSUFFICIENT_EVIDENCE')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              outcomeFilter === 'INSUFFICIENT_EVIDENCE'
                ? 'bg-[#1D1A19] text-[#F3EEEC] border border-[#302A28]'
                : 'bg-[#100E0D] text-[#756B67] hover:text-[#F3EEEC] border border-[#302A28]'
            }`}
          >
            Insufficient Evidence (1)
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#141211] rounded-lg border border-[#302A28] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#302A28] bg-[#100E0D] text-[11px] font-semibold text-[#756B67] uppercase tracking-wider">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-3">Agent Identity</th>
                <th className="py-3 px-3">Principal (Customer)</th>
                <th className="py-3 px-3">Merchant</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3">Verification Outcome</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#302A28] text-[#D0C4C0]">
              {filteredTransactions.map((tx) => {
                const isVerified = tx.outcome === 'VERIFIED';
                const formattedAmount = (tx.amountCents / 100).toFixed(2);

                return (
                  <tr
                    key={tx.id}
                    className={`hover:bg-[#1D1A19] transition-colors cursor-pointer group ${
                      !isVerified ? 'bg-[#5C1811]/15' : ''
                    }`}
                    onClick={() => setSelectedTx(tx)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#F3EEEC] whitespace-nowrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>{tx.id}</span>
                        {tx.id === 'tx-agent-2026-8804' && (
                          <Badge variant="critical" size="sm">
                            INC-0841 P0
                          </Badge>
                        )}
                        {tx.id === 'tx-agent-2026-8801' && (
                          <Badge variant="success" size="sm">
                            VERIFIED
                          </Badge>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#F3EEEC]">{tx.agent.agentName}</span>
                        <span className="font-mono text-[10px] text-[#756B67]">{tx.agent.agentId}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex flex-col">
                        <span className="text-[#F3EEEC]">{tx.principal.customerName}</span>
                        <span className="font-mono text-[10px] text-[#756B67]">{tx.principal.customerEmail}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="text-[#F3EEEC]">{tx.merchantName}</span>
                      <span className="text-[10px] text-[#756B67] block">{tx.merchantCategory}</span>
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono font-bold text-[#F3EEEC] whitespace-nowrap">
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
                        className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-[#1D1A19] hover:bg-[#221E1D] text-[#D0C4C0] font-medium border border-[#302A28] transition-colors"
                      >
                        <span>Audit Authority</span>
                        <ArrowRight className="h-3 w-3 text-[#A20903]" />
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
