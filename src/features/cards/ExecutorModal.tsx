import { Form, Input, Modal } from 'antd';
import { notifyError } from '@/shared/api/errorHandler';
import { ImplicitSubmit } from '@/shared/ui/ImplicitSubmit';
import type { ExecutorResponse } from '@/shared/api/types';
import { useCreateExecutor } from './hooks/useCreateExecutor';

interface ExecutorModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (executor: ExecutorResponse) => void;
}

interface ExecutorFormValues {
  name: string;
  phone?: string;
  extension?: string;
}

export function ExecutorModal({ open, onClose, onCreated }: ExecutorModalProps) {
  const [form] = Form.useForm<ExecutorFormValues>();
  const createMutation = useCreateExecutor();

  const handleFinish = async (values: ExecutorFormValues) => {
    try {
      const created = await createMutation.mutateAsync(values);
      form.resetFields();
      onCreated(created);
    } catch (error) {
      notifyError(error, "Ijrochini saqlab bo'lmadi");
    }
  };

  return (
    <Modal
      title="Yangi ijrochi"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Saqlash"
      cancelText="Bekor qilish"
      confirmLoading={createMutation.isPending}
      afterClose={() => form.resetFields()}
      forceRender
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <ImplicitSubmit />
        <Form.Item
          label="F.I.Sh."
          name="name"
          rules={[{ required: true, whitespace: true, message: 'Majburiy maydon' }]}
        >
          <Input maxLength={150} placeholder="A.Karimov" autoFocus />
        </Form.Item>
        <Form.Item label="Telefon" name="phone">
          <Input maxLength={50} placeholder="71 212 60 99" />
        </Form.Item>
        <Form.Item label="Ichki raqam" name="extension">
          <Input maxLength={50} placeholder="2-65-66" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
