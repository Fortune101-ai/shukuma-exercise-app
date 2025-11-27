import "./Input.css";

export default function Input({
  label,
  error,
  helperText,
  type = "text",
  fullWidth = false,
  disabled = false,
  required = false,
  className = "",
  id,
  ...props
}) {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  const hasError = !!error;

  const classNames = [
    "input-wrapper",
    fullWidth && "input-full-width",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inputClassNames = [
    "input",
    hasError && "input-error",
    disabled && "input-disabled",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={inputClassNames}
        disabled={disabled}
        aria-invalid={hasError}
        {...props}
      />
      {error && <span className="input-error-text">{error}</span>}
      {!error && helperText && (
        <span className="input-helper-text">{helperText}</span>
      )}
    </div>
  );
}
