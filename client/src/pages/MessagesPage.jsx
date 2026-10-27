import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ConversationList, { ConversationListHeader } from '../components/ConversationList.jsx';
import ChatWindow from '../components/ChatWindow.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { useToast } from '../context/ToastProvider.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { conversationService } from '../services/conversationService.js';
import { getApiError } from '../services/api.js';

export default function MessagesPage() {
  useDocumentTitle('Messages');
  const { notify } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeId = searchParams.get('conversation');
  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [conversationsError, setConversationsError] = useState('');
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState('');
  const [sending, setSending] = useState(false);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId) || null,
    [conversations, activeId]
  );

  const loadConversations = useCallback(async () => {
    setConversationsLoading(true);
    setConversationsError('');
    try {
      const data = await conversationService.list();
      setConversations(data);
    } catch (error) {
      setConversationsError(getApiError(error, 'Could not load your conversations.'));
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const markRead = useCallback(async (conversationId) => {
    try {
      await conversationService.markRead(conversationId);
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation
        )
      );
    } catch {
      // Read receipts are non-critical; the next poll can retry.
    }
  }, []);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return undefined;
    }

    let cancelled = false;

    async function fetchMessages(silent = false) {
      if (!silent) {
        setMessagesLoading(true);
        setMessagesError('');
      }
      try {
        const data = await conversationService.messages(activeId);
        if (cancelled) return;
        setMessages(data.messages);
        setMessagesLoading(false);
        if (data.messages.some((message) => !message.isMine && !message.readAt)) {
          markRead(activeId);
        }
      } catch (error) {
        if (cancelled) return;
        if (!silent) setMessagesError(getApiError(error, 'Could not load this conversation.'));
        setMessagesLoading(false);
      }
    }

    fetchMessages();
    const interval = window.setInterval(() => fetchMessages(true), 5000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [activeId, markRead]);

  function selectConversation(id) {
    setSearchParams({ conversation: id });
  }

  function backToList() {
    setSearchParams({});
  }

  async function sendMessage(text) {
    if (!activeId) return false;
    setSending(true);
    try {
      const message = await conversationService.send(activeId, text);
      setMessages((current) => [...current, message]);
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === activeId
            ? {
                ...conversation,
                lastMessage: text,
                lastMessageAt: message.createdAt,
                unreadCount: 0,
              }
            : conversation
        )
      );
      return true;
    } catch (error) {
      notify.error(getApiError(error, 'Message could not be sent.'));
      return false;
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="container-page pb-20 pt-8">
      <div>
        <p className="section-kicker">Buyer and seller chat</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Messages.</h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
          Conversations are stored in UniMarket and linked to the listing you are discussing.
          Messages refresh automatically while the chat is open.
        </p>
      </div>

      {conversationsError ? (
        <div className="mt-7">
          <ErrorState message={conversationsError} onRetry={loadConversations} />
        </div>
      ) : (
        <div className="mt-7 overflow-hidden card grid lg:grid-cols-[320px_1fr]">
          <aside className={`border-line lg:border-r lg:block ${activeId ? 'hidden' : 'block'}`}>
            <ConversationListHeader conversations={conversations} />
            {conversationsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-5 w-5 animate-spin text-forest-700" />
              </div>
            ) : (
              <ConversationList
                conversations={conversations}
                activeId={activeId}
                onSelect={selectConversation}
              />
            )}
          </aside>

          <div className={`${activeId ? 'flex' : 'hidden lg:flex'} min-w-0`}>
            <ChatWindow
              conversation={activeConversation}
              messages={messages}
              loading={messagesLoading}
              error={messagesError}
              sending={sending}
              onSend={sendMessage}
              onBack={backToList}
              onRetry={() => {
                if (!activeId) return;
                setMessagesLoading(true);
                conversationService
                  .messages(activeId)
                  .then((data) => {
                    setMessages(data.messages);
                    setMessagesError('');
                  })
                  .catch((error) => setMessagesError(getApiError(error, 'Could not load this conversation.')))
                  .finally(() => setMessagesLoading(false));
              }}
            />
          </div>
        </div>
      )}

      <p className="mt-4 text-center text-[11px] leading-5 text-muted">
        Do not send advance payments or share OTPs, passwords, or banking details. Report suspicious
        behaviour from the listing page.
      </p>
    </div>
  );
}
