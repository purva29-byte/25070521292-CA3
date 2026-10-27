import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import Avatar from './Avatar.jsx';
import EmptyState from './EmptyState.jsx';
import { imageUrl, formatChatTime } from '../utils/format.js';
import { cn } from '../lib/cn.js';

export default function ConversationList({ conversations = [], activeId, onSelect }) {
  if (!conversations.length) {
    return (
      <div className="p-4">
        <EmptyState
          icon={MessageSquare}
          title="No conversations"
          description="Contact a seller from a listing to start a persisted conversation."
          className="border-0 bg-transparent px-2 py-8"
        />
      </div>
    );
  }

  return (
    <div className="divide-y divide-line">
      {conversations.map((conversation) => {
        const active = conversation.id === activeId;
        return (
          <button
            key={conversation.id}
            type="button"
            onClick={() => onSelect(conversation.id)}
            className={cn(
              'flex w-full items-start gap-3 p-3.5 text-left transition',
              active ? 'bg-forest-50' : 'hover:bg-canvas'
            )}
            aria-current={active ? 'true' : undefined}
          >
            <Avatar name={conversation.otherParticipant?.name || 'Student'} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold">
                  {conversation.otherParticipant?.name || 'Student'}
                </p>
                <span className="ml-auto shrink-0 text-[9px] text-muted">
                  {formatChatTime(conversation.lastMessageAt)}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-2">
                {conversation.listing?.images?.[0] && (
                  <img
                    src={imageUrl(conversation.listing.images[0])}
                    alt=""
                    className="h-4 w-4 shrink-0 rounded object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <p className="truncate text-[10px] text-muted">{conversation.listing?.title}</p>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <p className={cn('truncate text-xs', conversation.unreadCount ? 'font-medium text-ink' : 'text-muted')}>
                  {conversation.lastMessage || 'Conversation started'}
                </p>
                {conversation.unreadCount > 0 && (
                  <span className="ml-auto grid h-4 min-w-4 shrink-0 place-items-center rounded-full bg-forest-600 px-1 text-[9px] font-semibold text-white">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function ConversationListHeader({ conversations = [] }) {
  return (
    <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
      <h2 className="text-sm font-semibold">Inbox</h2>
      <span className="text-[10px] text-muted">{conversations.length} conversation{conversations.length === 1 ? '' : 's'}</span>
    </div>
  );
}

export { Link };
