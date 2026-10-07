import { Form } from 'antd';
import type { FormItemProps } from 'antd';

interface FormFieldProps extends Omit<FormItemProps, 'validateStatus' | 'help' | 'name'> {
  /** id of the control inside, so clicking the label focuses it and screen readers link the two. */
  htmlFor: string;
  error?: string;
}

/** Form.Item for react-hook-form controlled fields: shows the RHF error under the control. */
export function FormField({ error, ...itemProps }: FormFieldProps) {
  return <Form.Item {...itemProps} validateStatus={error ? 'error' : undefined} help={error} />;
}
