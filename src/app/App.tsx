import { ConfigProvider } from 'antd';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { antdTheme } from '@/shared/theme';
import { queryClient } from './queryClient';
import { router } from './router';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={antdTheme}>
        <RouterProvider router={router} />
      </ConfigProvider>
    </QueryClientProvider>
  );
}
