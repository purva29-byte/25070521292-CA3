import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Loader2, MessageSquare, Send, ShieldCheck } from 'lucide-react';
import Avatar from './Avatar.jsx';
import { PageSpinner } from './LoadingSkeleton.jsx';
import ErrorState from './ErrorState.jsx';
import EmptyState from './EmptyState.jsx';
import { formatChatTime, imageUrl } from '../utils/format.js';
import { cn } from '../lib/cn.js';

export default function ChatWindow({
  conversation,
  messages,
  loading,
  error,
  sending,
  onSend,
  onBack,
  onRetry,
}) {
  const [text, setText] = useState('');
  const scrollRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    if (!loading && messages.length) {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, loading]);

  async function submit(event) {
    event.preventDefault();
    const value = text.trim();
    if (!value || sending) return;
    setText('');
    const ok = await onSend(value);
    if (!ok) setText(value);
  }

  if (!conversation) {
    return (
      <div className="hidden min-h-[560px] flex-1 flex-col items-center justify-center bg-paper p-8 text-center lg:flex">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-forest-50 text-forest-700">
          <MessageSquare className="h-7 w-7" />
        </span>
        <h2 className="mt-5 text-lg font-semibold">Select a conversation</h2>
        <p className="mt-2 max-w-xs text-sm leading-6 text-muted">
          Choose a conversation from your inbox, or contact a seller from a listing to start one.
        </p>
      </div>
    );
  }

  const other = conversation.otherParticipant;

  return (
    <section className="flex min-h-[620px] flex-1 flex-col bg-paper">
      <header className="flex items-center gap-3 border-b border-line px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg p-1.5 text-muted transition hover:bg-ink/5 lg:hidden"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Avatar name={other?.name || 'Student'} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{other?.name || 'Student'}</p>
          <p className="truncate text-[10px] text-muted">{other?.college || 'Campus student'}</p>
        </div>
        {conversation.listing && (
          <Link
            to={`/listing/${conversation.listing.id}`}
            className="hidden items-center gap-2 rounded-lg border border-line bg-canvas p-1.5 pr-2.5 transition hover:border-forest-200 sm:flex"
          >
            {conversation.listing.images?.[0] && (
              <img src={imageUrl(conversation.listing.images[0])} alt="" className="h-8 w-8 rounded object-cover" />
            )}
            <span className="max-w-36 truncate text-[10px] font-medium">{conversation.listing.title}</span>
            <ExternalLink className="h-3 w-3 text-muted" />
          </Link>
        )}
      </header>

      <div className="border-b border-line bg-forest-50/60 px-4 py-2 text-center text-[10px] leading-4 text-forest-800">
        <ShieldCheck className="mr-1 inline h-3 w-3" />
        Keep coordination in UniMarket and never share OTPs, passwords, or advance payments.
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5" aria-live="polite">
        {loading ? (
          <PageSpinner label="Loading messages" />
        ) : error ? (
          <ErrorState title="Could not load messages" message={error} onRetry={onRetry} />
        ) : messages.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="Start the conversation"
            description={`Say hello to ${other?.name?.split(' ')[0] || 'the seller'} and ask about the item.`}
            className="border-0 bg-transparent py-10"
          />
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => {
              const previous = messages[index - 1];
              const showTimestamp =
                !previous ||
                new Date(message.createdAt).getTime() - new Date(previous.createdAt).getTime() > 10 * 60 * 1000;
              return (
                <div key={message.id}>
                  {showTimestamp && (
                    <p className="my-4 text-center text-[9px] uppercase tracking-wider text-muted">
                      {formatChatTime(message.createdAt)}
                    </p>
                  )}
                  <div className={cn('flex', message.isMine ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cn(
                        'max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-6',
                        message.isMine
                          ? 'rounded-br-md bg-forest-600 text-white'
                          : 'rounded-bl-md border border-line bg-canvas text-ink'
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.text}</p>
                      <p className={cn('mt-1 text-right text-[9px]', message.isMine ? 'text-forest-100/70' : 'text-muted')}>
                        {formatChatTime(message.createdAt)}
                        {message.isMine && message.readAt ? ' · Read' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <form onSubmit={submit} className="border-t border-line bg-paper p-3 safe-bottom">
        <div className="flex items-end gap-2 rounded-xl border border-line bg-white p-1.5 focus-within:border-forest-400 focus-within:ring-4 focus-within:ring-forest-600/10">
          <label htmlFor="chat-message" className="sr-only">Message</label>
          <textarea
            id="chat-message"
            rows={1}
            maxLength={2000}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Write a message…"
            className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted/70"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-forest-600 text-white transition hover:bg-forest-700 disabled:opacity-40"
            aria-label="Send message"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
        <div className="mt-1 flex justify-between px-1 text-[9px] text-muted">
          <span>Enter to send · Shift+Enter for a new line</span>
          <span>{text.length}/2000</span>
        </div>
      </form>
    </section>
  );
}
