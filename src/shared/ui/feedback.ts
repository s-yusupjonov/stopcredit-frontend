import { message as staticMessage, Modal, notification as staticNotification } from 'antd';
import type { ModalFuncProps } from 'antd';
import type { useAppProps } from 'antd/es/app/context';
import type { MessageInstance } from 'antd/es/message/interface';
import type { NotificationInstance } from 'antd/es/notification/interface';

/**
 * antd's static message/notification/Modal.confirm render outside the React tree, so they ignore the
 * ConfigProvider theme and Uzbek locale. FeedbackBridge (mounted inside <App>) hands over the
 * context-aware instances; the static ones are only a fallback before the bridge mounts.
 */
let app: useAppProps | null = null;

export function bindFeedback(instance: useAppProps) {
  app = instance;
}

export const feedback = {
  get message(): MessageInstance {
    return app?.message ?? staticMessage;
  },
  get notification(): NotificationInstance {
    return app?.notification ?? staticNotification;
  },
  confirm(props: ModalFuncProps) {
    return app ? app.modal.confirm(props) : Modal.confirm(props);
  },
};

/** Promise-based confirmation dialog; resolves true only when the user presses OK. */
export function confirmAction(options: {
  title: string;
  content?: string;
  okText?: string;
  danger?: boolean;
}): Promise<boolean> {
  return new Promise((resolve) => {
    feedback.confirm({
      title: options.title,
      content: options.content,
      okText: options.okText ?? 'Tasdiqlash',
      cancelText: 'Bekor qilish',
      okButtonProps: options.danger ? { danger: true } : undefined,
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
}
