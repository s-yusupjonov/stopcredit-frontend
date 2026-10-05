import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Input } from 'antd';
import type { InputProps } from 'antd';

const DEFAULT_DELAY_MS = 400;

interface SearchInputProps extends Omit<InputProps, 'value' | 'defaultValue' | 'onChange'> {
  value?: string;
  onSearch: (value: string | undefined) => void;
  delay?: number;
}

export function SearchInput({
  value,
  onSearch,
  delay = DEFAULT_DELAY_MS,
  onPressEnter,
  ...inputProps
}: SearchInputProps) {
  const [draft, setDraft] = useState(value ?? '');
  const emitted = useRef(value ?? '');
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    const external = value ?? '';
    if (external !== emitted.current) {
      emitted.current = external;
      setDraft(external);
    }
  }, [value]);

  useEffect(() => {
    const normalized = draft.trim();
    if (normalized === emitted.current) return;
    const timer = setTimeout(
      () => {
        if (normalized === emitted.current) return;
        emitted.current = normalized;
        onSearchRef.current(normalized || undefined);
      },
      normalized === '' ? 0 : delay,
    );
    return () => clearTimeout(timer);
  }, [draft, delay]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => setDraft(event.target.value);

  const handlePressEnter: InputProps['onPressEnter'] = (event) => {
    const normalized = draft.trim();
    if (normalized !== emitted.current) {
      emitted.current = normalized;
      onSearchRef.current(normalized || undefined);
    }
    onPressEnter?.(event);
  };

  return (
    <Input
      allowClear
      {...inputProps}
      value={draft}
      onChange={handleChange}
      onPressEnter={handlePressEnter}
    />
  );
}