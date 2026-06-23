import React from 'react';
import { AI_TOOLS_LIST } from '../screenerConfig.js';

export default function StepContext({ formData, updateField, errors }) {
  function toggleTool(tool) {
    const next = formData.q5.includes(tool)
      ? formData.q5.filter(t => t !== tool)
      : [...formData.q5, tool];
    updateField('q5', next);
  }

  return (
    <div>
      <fieldset className="form-group">
        <legend>
          Q4. Where do you currently work?
          <span className="required-mark" aria-hidden="true">*</span>
        </legend>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <label htmlFor="q4_role" style={{ fontSize: '0.88rem', fontWeight: 500 }}>
              Role <span className="required-mark" aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              id="q4_role"
              value={formData.q4_role}
              onChange={e => updateField('q4_role', e.target.value)}
              placeholder="e.g. Senior UX Designer"
              aria-required="true"
            />
            {errors.q4_role && <p className="error-message" role="alert">{errors.q4_role}</p>}
          </div>
          <div>
            <label htmlFor="q4_industry" style={{ fontSize: '0.88rem', fontWeight: 500 }}>
              Industry <span className="required-mark" aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              id="q4_industry"
              value={formData.q4_industry}
              onChange={e => updateField('q4_industry', e.target.value)}
              placeholder="e.g. FinTech"
              aria-required="true"
            />
            {errors.q4_industry && <p className="error-message" role="alert">{errors.q4_industry}</p>}
          </div>
        </div>
      </fieldset>

      <fieldset className="form-group">
        <legend>
          Q5. Which generative AI tools have you used in the past three months?
          <span className="required-mark" aria-hidden="true">*</span>
        </legend>
        <div className="checkbox-group" role="group" aria-required="true">
          {AI_TOOLS_LIST.map(tool => (
            <label key={tool} className="checkbox-item">
              <input
                type="checkbox"
                checked={formData.q5.includes(tool)}
                onChange={() => toggleTool(tool)}
              />
              <span>{tool}</span>
            </label>
          ))}
          <div style={{ paddingTop: '4px' }}>
            <label htmlFor="q5_other" style={{ fontSize: '0.88rem', fontWeight: 500 }}>
              Other
            </label>
            <input
              type="text"
              id="q5_other"
              value={formData.q5_other}
              onChange={e => updateField('q5_other', e.target.value)}
              placeholder="Other tools, separated by commas"
            />
          </div>
        </div>
        {errors.q5 && <p className="error-message" role="alert">{errors.q5}</p>}
      </fieldset>


      <fieldset className="form-group">
        <legend>
          Q7. Are you willing to screen-share and bring a real artefact (screenshots, prompt history, Figma file) to walk through during the interview?
          <span className="required-mark" aria-hidden="true">*</span>
        </legend>
        <div className="radio-group" role="radiogroup" aria-required="true">
          {['Yes', 'No'].map(opt => (
            <label
              key={opt}
              className={`radio-item ${formData.q7 === opt ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="q7"
                value={opt}
                checked={formData.q7 === opt}
                onChange={() => updateField('q7', opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
        {errors.q7 && <p className="error-message" role="alert">{errors.q7}</p>}
      </fieldset>
    </div>
  );
}
