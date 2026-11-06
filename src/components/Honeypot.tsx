import React from 'react';

interface HoneypotProps {
  value: string;
  onChange: (val: string) => void;
  fieldName?: string;
}

/**
 * Invisible Honeypot field for bot trapping.
 * Real users never see or fill this field; scraper bots automatically fill all input fields.
 */
export const Honeypot: React.FC<HoneypotProps> = ({
  value,
  onChange,
  fieldName = 'hp_website_trap',
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
        opacity: 0,
        height: 0,
        width: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <label htmlFor={fieldName}>Leave this field blank to verify human</label>
      <input
        type="text"
        id={fieldName}
        name={fieldName}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
};
