import { useEffect } from 'react';
import { App } from 'antd';
import { bindFeedback } from '@/shared/ui/feedback';

export function FeedbackBridge() {
  const app = App.useApp();
  useEffect(() => {
    bindFeedback(app);
  }, [app]);
  return null;
}
