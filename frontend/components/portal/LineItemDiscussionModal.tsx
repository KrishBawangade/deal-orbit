"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Send,
  X,
  User,
  ShieldCheck,
  Clock,
  CheckCircle2,
  HelpCircle,
  Truck,
  Sparkles,
  Layers,
} from "lucide-react";
import type { ICustomerNegotiationMessage } from "@/types";
import type { QuotationLineItem } from "@/context/QuotationsContext";

interface LineItemDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lineItem: QuotationLineItem | null;
  messages: ICustomerNegotiationMessage[];
  onSendMessage: (lineItemId: string, message: string) => void;
  customerName?: string;
  repName?: string;
}

const QUICK_INQUIRIES = [
  "Can delivery timeline be accelerated to 48 hours?",
  "Can we substitute with the higher memory/RAM configuration?",
  "Requesting bundled 24/7 priority enterprise support SLA.",
  "Need consolidated single-invoice billing schedule.",
];

export default function LineItemDiscussionModal({
  isOpen,
  onClose,
  lineItem,
  messages,
  onSendMessage,
  customerName = "Acme Corp Procurement",
  repName = "Sam Seller (DealOrbit Rep)",
}: LineItemDiscussionModalProps) {
  const [commentText, setCommentText] = useState("");
  const [requestType, setRequestType] = useState<"QUESTION" | "TIMELINE" | "SPECS" | "QUANTITY">("QUESTION");

  if (!isOpen || !lineItem) return null;

  // Filter messages for this specific line item (or quote-level general messages)
  const lineMessages = messages.filter(
    (m) => m.lineItemId === lineItem.id || !m.lineItemId
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    let prefix = "";
    if (requestType === "TIMELINE") prefix = "[Timeline Request] ";
    else if (requestType === "SPECS") prefix = "[Specification Inquiry] ";
    else if (requestType === "QUANTITY") prefix = "[Quantity/Scope Request] ";

    onSendMessage(lineItem.id, `${prefix}${commentText.trim()}`);
    setCommentText("");
  };

  const handleApplyPreset = (preset: string) => {
    setCommentText(preset);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[var(--card)] border border-[var(--border)] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-[var(--border)] bg-gradient-to-r from-[var(--card)] via-[var(--card-hover)] to-[var(--card)] flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0 mt-0.5">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--primary)] font-semibold bg-[var(--primary)]/10 px-2 py-0.5 rounded">
                  {lineItem.sku}
                </span>
                <span className="text-xs text-[var(--text-muted)]">• {lineItem.category}</span>
              </div>
              <h3 className="text-base font-bold text-[var(--text-main)] font-heading mt-0.5 line-clamp-1">
                {lineItem.name}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Qty: {lineItem.quantity} units | List: ₹{lineItem.unitPrice.toLocaleString("en-IN")} | Quoted Discount: {lineItem.discountPercent}%
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-hover)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread History */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-[var(--background)]/50">
          {lineMessages.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-muted)] space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto opacity-30 text-[var(--primary)]" />
              <p className="text-xs font-medium">No previous comments or requests on this line item.</p>
              <p className="text-[11px]">
                Post a change request, delivery question, or specification inquiry below.
              </p>
            </div>
          ) : (
            lineMessages.map((msg) => {
              const isCustomer = msg.authorRole === "CUSTOMER";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isCustomer ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] mb-1 px-1">
                    <span className="font-semibold text-[var(--text-main)]">
                      {isCustomer ? msg.authorName || customerName : msg.authorName || repName}
                    </span>
                    <span>•</span>
                    <span>{msg.createdAt}</span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-2xs leading-relaxed ${
                      isCustomer
                        ? "bg-[var(--primary)] text-white rounded-tr-none"
                        : "bg-[var(--card)] border border-[var(--border)] text-[var(--text-body)] rounded-tl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                    {msg.proposedDiscount && (
                      <div className="mt-1.5 pt-1.5 border-t border-white/20 text-[11px] font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Proposed Counter: {msg.proposedDiscount}% discount</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-5 py-2.5 bg-[var(--card)] border-t border-[var(--border)] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[var(--primary)]" />
            Quick Inquiries:
          </span>
          {QUICK_INQUIRIES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-[11px] px-2.5 py-1 rounded-full border border-[var(--border)] bg-[var(--card-hover)] text-[var(--text-body)] hover:text-[var(--primary)] hover:border-[var(--primary-subtle-border)] transition-colors shrink-0 cursor-pointer whitespace-nowrap"
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Comment Composer */}
        <form
          onSubmit={handleSubmit}
          className="p-4 bg-[var(--card)] border-t border-[var(--border)] space-y-3"
        >
          {/* Change Request Category Pills */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[var(--text-muted)] font-medium">Request Type:</span>
            <div className="flex items-center gap-1.5">
              {[
                { id: "QUESTION", label: "General Query", icon: HelpCircle },
                { id: "TIMELINE", label: "Delivery SLA", icon: Truck },
                { id: "SPECS", label: "Specs / Scope", icon: Layers },
                { id: "QUANTITY", label: "Quantity", icon: CheckCircle2 },
              ].map((cat) => {
                const Icon = cat.icon;
                const isSelected = requestType === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setRequestType(cat.id as any)}
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30 font-semibold"
                        : "bg-[var(--card-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={`Type line-item inquiry or change request for ${lineItem.name}...`}
                rows={2}
                className="w-full text-xs p-3 rounded-xl border border-[var(--input-border)] bg-[var(--card)] text-[var(--text-main)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={!commentText.trim()}
              className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Inquiry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
