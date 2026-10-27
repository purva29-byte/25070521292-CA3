import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · UniMarket` : 'UniMarket — Smart Deals. Student to Student.';
  }, [title]);
}
