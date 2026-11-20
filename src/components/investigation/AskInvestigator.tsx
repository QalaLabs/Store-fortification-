'use client';

import React, { useState } from 'react';
import { PresetQA } from '@/types/investigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  MessageSquare,
  Sparkles,
  Send,
  ExternalLink,
  Bot,
  User,
  ShieldCheck,
  Info,
} from 'lucide-react';

interface AskInvestigatorProps {
  presetQA: PresetQA[];
  onSelectEvent: (eventId: string) => void;
  incidentId: string;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  relatedEventIds?: string[];
  evidenceNote?: string;
  isSimulatedNotice?: boolean;
}

export function AskInvestigator({
  presetQA,
  onSelectEvent,
  incidentId,
}: AskInvestigatorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Hello Analyst. I have synthesized the correlated telemetry for incident ${incidentId}. Ask me any question regarding root-cause attribution, affected e-commerce records, or immediate containment recommendations.`,
      isSimulatedNotice: true,
    },
  ]);
  const [inputText, setInputText] = useState('');

  const handleAskQuestion = (question: string) => {
    // 1. Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: question,
    };

    // 2. Look for matching answer in presetQA
    const normalizedQ = question.toLowerCase();
    const match = presetQA.find(
      (qa) =>
        qa.question.toLowerCase().includes(normalizedQ) ||
        normalizedQ.includes(qa.question.toLowerCase().slice(0, 15))
    );

    const assistantMsg: Message = match
      ? {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: match.answer,
          relatedEventIds: match.relatedEventIds,
          evidenceNote: match.evidenceNote,
        }
      : {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: `[Deterministic Mock Provider Response]: Based on correlated incident telemetry for ${incidentId}, this query evaluates against active event timeline rules. Verified signals confirm high-confidence anomaly correlation. (Full generative Bedrock inference will activate once API credentials are wired in Phase 3).`,
          relatedEventIds: presetQA[0]?.relatedEventIds || [],
        };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInputText('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    handleAskQuestion(inputText);
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardTitle>
            <Bot className="h-4 w-4 text-cyan-400" />
            <span>Ask AI Investigator</span>
          </CardTitle>
          <Badge variant="warning" size="sm">
            Local Mock Demo
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between space-y-4">
        {/* Preset Question Pills */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Suggested Analyst Inquiries:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {presetQA.map((qa, i) => (
              <button
                key={i}
                onClick={() => handleAskQuestion(qa.question)}
                className="text-xs text-left px-2.5 py-1 rounded bg-[#090e17] hover:bg-[#121d31] text-slate-300 hover:text-white border border-[#1b2a45] hover:border-blue-500/40 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="h-3 w-3 text-cyan-400 shrink-0" />
                <span>{qa.question}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat History Container */}
        <div className="flex-1 min-h-[240px] max-h-[360px] overflow-y-auto space-y-3 bg-[#090e17] p-3.5 rounded-lg border border-[#1b2a45]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 text-xs ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="h-6 w-6 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center shrink-0 text-cyan-400">
                  <Bot className="h-3.5 w-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-lg p-3 space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#121d31] text-slate-200 border border-[#1b2a45]'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>

                {/* Evidence References in assistant replies */}
                {msg.relatedEventIds && msg.relatedEventIds.length > 0 && (
                  <div className="pt-2 border-t border-[#1b2a45]/60 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Referenced Signals:
                    </span>
                    {msg.relatedEventIds.map((eid) => (
                      <button
                        key={eid}
                        onClick={() => onSelectEvent(eid)}
                        className="font-mono text-[10px] text-cyan-300 bg-cyan-950/60 hover:bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/40 flex items-center gap-1"
                      >
                        <span>{eid}</span>
                        <ExternalLink className="h-2 w-2" />
                      </button>
                    ))}
                  </div>
                )}

                {msg.evidenceNote && (
                  <p className="text-[10px] text-slate-400 italic">
                    Note: {msg.evidenceNote}
                  </p>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center shrink-0 text-slate-200 text-[10px] font-bold">
                  AY
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about evidence, customer PII exposure, or containment..."
            className="flex-1 bg-[#090e17] border border-[#1b2a45] rounded-md px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Send className="h-3 w-3" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>

        <p className="text-[10px] text-slate-500 text-center">
          Investigator uses local deterministic security reasoning adapter. Does not transmit data outside local environment.
        </p>
      </CardContent>
    </Card>
  );
}
