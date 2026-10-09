import { Modal, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ImportRowError } from '@/shared/api/types';

interface ImportErrorsModalProps {
  errors: ImportRowError[];
  onClose: () => void;
}

const columns: ColumnsType<ImportRowError> = [
  { title: 'Qator', dataIndex: 'row', key: 'row', width: 90 },
  { title: 'Ustun', dataIndex: 'column', key: 'column', width: 160 },
  { title: 'Xato', dataIndex: 'message', key: 'message' },
];

export function ImportErrorsModal({ errors, onClose }: ImportErrorsModalProps) {
  return (
    <Modal
      title={`Excel faylda ${errors.length} ta xato topildi`}
      open={errors.length > 0}
      onCancel={onClose}
      footer={null}
      width={760}
    >
      <p>Hech qanday karta saqlanmadi. Xatolarni to'g'rilab, faylni qayta yuklang.</p>
      <Table
        size="small"
        rowKey={(error) => `${error.row}-${error.column}-${error.message}`}
        columns={columns}
        dataSource={errors}
        pagination={{ pageSize: 10, hideOnSinglePage: true, showSizeChanger: false }}
      />
    </Modal>
  );
}
