import { forwardRef } from 'react';
import type { ComponentRef } from 'react';
import { InputNumber } from 'antd';
import type { InputNumberProps } from 'antd';

// JavaScript number 2 kasr xona bilan aniq saqlay oladigan eng katta qiymat (MAX_SAFE_INTEGER / 100).
// Backend 17 xonagacha qabul qiladi, lekin undan katta qiymatlar brauzerda aniqligini yo'qotadi.
export const MAX_AMOUNT = 90_071_992_547_409.91;
const DECIMAL_PLACES = 2;

interface MoneyInputProps {
  id?: string;
  value?: number | null;
  onChange?: (value: number | null) => void;
  onBlur?: () => void;
  min?: number;
  max?: number;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Same notation as formatMoney() on read-only screens: space between thousands, comma before tiyin
 * ("1 234 567,89"). Both "," and "." are accepted while typing.
 */
function toDisplay(raw: string): string {
  const cleaned = raw.replace(/\s/g, '').replace(',', '.');
  if (cleaned === '') return '';
  const negative = cleaned.startsWith('-');
  const [integer, decimal] = (negative ? cleaned.slice(1) : cleaned).split('.');
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${negative ? '-' : ''}${grouped}${decimal === undefined ? '' : `,${decimal}`}`;
}

// antd skips `precision` padding once a custom formatter is set, so settled values get it here
const formatter: NonNullable<InputNumberProps['formatter']> = (value, { userTyping, input }) => {
  if (userTyping) return toDisplay(input);
  const settled = value === undefined || value === null || value === '' ? NaN : Number(value);
  return Number.isFinite(settled) ? toDisplay(settled.toFixed(DECIMAL_PLACES)) : toDisplay(String(value ?? ''));
};

const parser: NonNullable<InputNumberProps['parser']> = (displayValue) =>
  (displayValue ?? '').replace(/\s/g, '').replace(',', '.');

export const MoneyInput = forwardRef<ComponentRef<typeof InputNumber>, MoneyInputProps>(function MoneyInput(
  { id, value, onChange, onBlur, min, max = MAX_AMOUNT, placeholder = '0,00', disabled },
  ref,
) {
  return (
    <InputNumber
      ref={ref}
      id={id}
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
      suffix="so'm"
      onChange={(next) => onChange?.(next === null ? null : Number(next))}
    />
  );
});
