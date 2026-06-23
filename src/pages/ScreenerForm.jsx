import React, { useState, useRef } from 'react';
import StepEligibility from '../components/StepEligibility.jsx';
import StepClassification from '../components/StepClassification.jsx';
import StepContext from '../components/StepContext.jsx';
import {
  INTRO_TEXT,
  PRIVACY_TEXT,
  CONSENT_TEXT,
} from '../screenerConfig.js';

const TOTAL_STEPS = 3;

export default function ScreenerForm() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    eligibility: [false, false, false, false, false],
    q1: '',
    q2: '',
    q3: '',
    q4_role: '',
    q4_industry: '',
    q4_employer: '',
    q5: [],
    q5_other: '',
    q6: '',
    q7: '',
  });
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const errorRef = useRef(null);

  function updateField(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function validateStep(stepIndex) {
    const errs = {};

    if (stepIndex === 0) {
      const unchecked = formData.eligibility.some(v => !v);
      if (unchecked) {
        errs.eligibility = 'Please confirm all statements to proceed.';
      }
    }

    if (stepIndex === 1) {
      if (!formData.q1) errs.q1 = 'Please select your experience level.';
      if (!formData.q2) errs.q2 = 'Please select your AI usage frequency.';
      if (!formData.q3) errs.q3 = 'Please select your AI ideation practice.';
    }

    if (stepIndex === 2) {
      if (!formData.q4_role.trim()) errs.q4_role = 'Please enter your role.';
      if (!formData.q4_industry.trim()) errs.q4_industry = 'Please enter your industry.';
      if (formData.q5.length === 0 && !formData.q5_other.trim()) {
        errs.q5 = 'Please select at least one tool or enter one in "Other".';
      }
      if (!formData.q7) errs.q7 = 'Please answer whether you can screen-share.';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setTimeout(() => errorRef.current?.focus(), 50);
    }
    return Object.keys(errs).length === 0;
  }

  async function handleNext() {
    if (!validateStep(step)) return;

    if (step === 0) {
      const allChecked = formData.eligibility.every(Boolean);
      if (!allChecked) {
        await submitIneligible();
        return;
      }
    }

    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      await submitForm();
    }
  }

  async function submitIneligible() {
    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eligibility: formData.eligibility }),
      });
      const data = await res.json();
      setResult({ eligible: false, id: data.id });
    } catch {
      setResult({ eligible: false, id: null });
    }
    setSubmitting(false);
  }

  async function submitForm() {
    setSubmitting(true);
    const q5Combined = [...formData.q5];
    if (formData.q5_other.trim()) {
      q5Combined.push(formData.q5_other.trim());
    }

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eligibility: formData.eligibility,
          q1: formData.q1,
          q2: formData.q2,
          q3: formData.q3,
          q4_role: formData.q4_role,
          q4_industry: formData.q4_industry,
          q4_employer: formData.q4_employer,
          q5: q5Combined,
          q6: formData.q6,
          q7: formData.q7,
        }),
      });
      const data = await res.json();
      setResult({ eligible: true, id: data.id, segment: data.segment });
    } catch {
      setResult({ eligible: true, id: null, error: true });
    }
    setSubmitting(false);
  }

  if (result) {
    if (!result.eligible) {
      return (
        <div className="container">
          <div className="card screen-out">
            <h2>Thank you for your interest</h2>
            <p>Based on your answers, this particular study isn't a fit right now. We appreciate you taking the time.</p>
          </div>
        </div>
      );
    }

    if (result.error) {
      return (
        <div className="container">
          <div className="card screen-out">
            <h2>Something went wrong</h2>
            <p>We couldn't save your response. Please try again later or contact the researcher.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="container">
        <div className="card success-screen">
          <h2>Thank you!</h2>
          <p>Your response has been recorded. The researcher will review your submission and reach out if you're selected for the study.</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Response ID: {result.id}
          </p>
        </div>
      </div>
    );
  }

  const errorKeys = Object.keys(errors);

  return (
    <div className="container">
      <div className="card">
        <h1>Research Study Screener</h1>
        <p className="intro-text" style={{ whiteSpace: 'pre-line' }}>{INTRO_TEXT}</p>

        <div className="step-indicator" role="group" aria-label="Form progress">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`step-dot ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}
              role="presentation"
            />
          ))}
        </div>

        {errorKeys.length > 0 && (
          <div className="error-summary" role="alert" tabIndex={-1} ref={errorRef}>
            Please fix the following:
            <ul>
              {errorKeys.map(k => (
                <li key={k}>{errors[k]}</li>
              ))}
            </ul>
          </div>
        )}

        {step === 0 && (
          <StepEligibility
            eligibility={formData.eligibility}
            onChange={(idx, val) => {
              const next = [...formData.eligibility];
              next[idx] = val;
              updateField('eligibility', next);
            }}
            errors={errors}
          />
        )}

        {step === 1 && (
          <StepClassification
            formData={formData}
            updateField={updateField}
            errors={errors}
          />
        )}

        {step === 2 && (
          <StepContext
            formData={formData}
            updateField={updateField}
            errors={errors}
          />
        )}

        <div className="privacy-text">{PRIVACY_TEXT}</div>

        <div className="btn-row">
          {step > 0 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => { setStep(step - 1); window.scrollTo(0, 0); }}
            >
              Back
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleNext}
            disabled={submitting}
          >
            {submitting
              ? 'Submitting…'
              : step === TOTAL_STEPS - 1
                ? 'Submit'
                : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
