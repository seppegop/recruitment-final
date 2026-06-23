import React from 'react';
import { ELIGIBILITY_STATEMENTS } from '../screenerConfig.js';

export default function StepEligibility({ eligibility, onChange, errors }) {
  return (
    <fieldset className="form-group">
      <legend>
        Eligibility — please confirm each statement
        <span className="required-mark" aria-hidden="true">*</span>
      </legend>
      <div className="checkbox-group" role="group" aria-required="true">
        {ELIGIBILITY_STATEMENTS.map((statement, i) => (
          <label key={i} className="checkbox-item">
            <input
              type="checkbox"
              checked={eligibility[i]}
              onChange={e => onChange(i, e.target.checked)}
              aria-label={statement}
            />
            <span>{statement}</span>
          </label>
        ))}
      </div>
      {errors.eligibility && (
        <p className="error-message" role="alert">{errors.eligibility}</p>
      )}
    </fieldset>
  );
}
