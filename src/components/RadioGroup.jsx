import React from 'react';

export default function RadioGroup({ name, legend, options, value, onChange, getDisplay, getStored, error, required }) {
  return (
    <fieldset className="form-group">
      <legend>
        {legend}
        {required && <span className="required-mark" aria-hidden="true">*</span>}
      </legend>
      <div className="radio-group" role="radiogroup" aria-required={required}>
        {options.map((option) => {
          const display = getDisplay(option);
          const isSelected = value === option;
          return (
            <label
              key={option}
              className={`radio-item ${isSelected ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name={name}
                value={option}
                checked={isSelected}
                onChange={() => onChange(option)}
              />
              <span>{display}</span>
            </label>
          );
        })}
      </div>
      {error && <p className="error-message" role="alert">{error}</p>}
    </fieldset>
  );
}
