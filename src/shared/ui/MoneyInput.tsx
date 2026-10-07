import { forwardRef } from 'react';
import type { ComponentRef } from 'react';
import { InputNumber } from 'antd';
import type { InputNumberProps } from 'antd';

// JavaScript number 2 kasr xona bilan aniq saqlay oladigan eng katta qiymat (MAX_SAFE_INTEGER / 100).
// Backend 17 xonagacha qabul qiladi, lekin undan katta qiymatlar brauzerda aniqligini yo'qotadi.
const MAX_AMOUNT = 90_071_992_547_409.91;
const DECIMAL_PLACES = 2;

interface MoneyInputProps {
  value?: number | null;
  onChange?: (value: number | null) => void;
  onBlur?: () => void;
  min?: number;
  max?: number;
  placeholder?: string;
  disabled?: boolean;
}

function groupThousands(raw: string): string {
  const [integer, decimal] = raw.split('.');
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decimal === undefined ? grouped : `${grouped}.${decimal}`;
}

const formatter: NonNullable<InputNumberProps['formatter']> = (value, { userTyping, input }) => {
  const raw = userTyping ? input.replace(/,/g, '') : String(value ?? '');
  return raw === '' ? '' : groupThousands(raw);
};

const parser: NonNullable<InputNumberProps['parser']> = (displayValue) =>
  displayValue?.replace(/,/g, '') ?? '';

export const MoneyInput = forwardRef<ComponentRef<typeof InputNumber>, MoneyInputProps>(function MoneyInput(
  { value, onChange, onBlur, min, max = MAX_AMOUNT, placeholder = '0.00', disabled },
  ref,
) {
  return (
    <InputNumber
      ref={ref}
      style={{ width: '100%' }}
      value={value ?? null}
      min={min}
      max={max}
      precision={DECIMAL_PLACES}
      controls={false}
      inputMode="decimal"
      placeholder={placeholder}
      disabled={disabled}
      formatter={formatter}
      parser={parser}
      onBlur={onBlur}
      onChange={(next) => onChange?.(next === null ? null : Number(next))}
    />
  );
});