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
            <Bot className="h-4 w-4 text-[#A20903]" />
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
          <span className="text-[10px] font-semibold text-[#756B67] uppercase tracking-wider block">
            Suggested Analyst Inquiries:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {presetQA.map((qa, i) => (
              <button
                key={i}
                onClick={() => handleAskQuestion(qa.question)}
                className="text-xs text-left px-2.5 py-1 rounded bg-[#100E0D] hover:bg-[#1D1A19] text-[#A79B96] hover:text-[#F3EEEC] border border-[#302A28] hover:border-[#4D4440] transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="h-3 w-3 text-[#A2847B] shrink-0" />
                <span>{qa.question}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat History Container */}
        <div className="flex-1 min-h-[240px] max-h-[360px] overflow-y-auto space-y-3 bg-[#100E0D] p-3.5 rounded-lg border border-[#302A28]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 text-xs ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="h-6 w-6 rounded-md bg-[#1D1A19] border border-[#302A28] flex items-center justify-center shrink-0 text-[#A20903]">
                  <Bot className="h-3.5 w-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-lg p-3 space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-[#1D1A19] text-[#F3EEEC] border border-[#302A28]'
                    : 'bg-[#141211] text-[#D0C4C0] border border-[#302A28]'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>

                {/* Evidence References in assistant replies */}
                {msg.relatedEventIds && msg.relatedEventIds.length > 0 && (
                  <div className="pt-2 border-t border-[#302A28] flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-[#756B67] font-semibold">
                      Referenced Signals:
                    </span>
                    {msg.relatedEventIds.map((eid) => (
                      <button
                        key={eid}
                        onClick={() => onSelectEvent(eid)}
                        className="font-mono text-[10px] text-[#D0C4C0] bg-[#1D1A19] hover:bg-[#221E1D] px-1.5 py-0.5 rounded border border-[#302A28] flex items-center gap-1"
                      >
                        <span>{eid}</span>
                        <ExternalLink className="h-2 w-2 text-[#756B67]" />
                      </button>
                    ))}
                  </div>
                )}

                {msg.evidenceNote && (
                  <p className="text-[10px] text-[#756B67] italic">
                    Note: {msg.evidenceNote}
                  </p>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="h-6 w-6 rounded-md bg-[#1D1A19] border border-[#302A28] flex items-center justify-center shrink-0 text-[#D0C4C0] text-[10px] font-bold">
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
            className="flex-1 bg-[#100E0D] border border-[#302A28] rounded-md px-3 py-2 text-xs text-[#F3EEEC] placeholder-[#756B67] focus:outline-none focus:border-[#A20903]/60"
          />
          <button
            type="submit"
            className="px-3.5 py-2 bg-[#A20903] hover:bg-[#850702] text-[#F3EEEC] rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Send className="h-3 w-3" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>

        <p className="text-[10px] text-[#756B67] text-center">
          Investigator uses local deterministic security reasoning adapter. Does not transmit data outside local environment.
        </p>
      </CardContent>
    </Card>
  );
}
