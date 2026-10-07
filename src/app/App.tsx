import { App as AntApp, ConfigProvider } from 'antd';
import uzUZ from 'antd/locale/uz_UZ';
import dayjs from 'dayjs';
import 'dayjs/locale/uz-latn';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { antdTheme } from '@/shared/theme';
import { FeedbackBridge } from './FeedbackBridge';
import { queryClient } from './queryClient';
import { router } from './router';

// Calendar month/day names follow the same Uzbek (Latin) locale as the rest of the UI
dayjs.locale('uz-latn');

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={antdTheme} locale={uzUZ}>
        <AntApp>
          <FeedbackBridge />
          <RouterProvider router={router} />
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
