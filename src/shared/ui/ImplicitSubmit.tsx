/**
 * Forms inside a Modal keep their real submit button in the footer, outside the <form>.
 * Browsers only submit on Enter when the form owns a submit button, so this invisible one restores it.
 */
export function ImplicitSubmit() {
  return (
    <button
      type="submit"
      tabIndex={-1}
      aria-hidden
      style={{ position: 'absolute', width: 0, height: 0, padding: 0, border: 0, opacity: 0, overflow: 'hidden' }}
    />
  );
}
