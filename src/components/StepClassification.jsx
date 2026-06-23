import React from 'react';
import RadioGroup from './RadioGroup.jsx';
import {
  Q1_OPTIONS,
  Q2_OPTIONS,
  Q3_OPTIONS,
  getDisplayOption,
  getStoredValue,
} from '../screenerConfig.js';

export default function StepClassification({ formData, updateField, errors }) {
  return (
    <div>
      <RadioGroup
        name="q1"
        legend="Q1. How many years have you been working in UX, product design, or a closely related design role (including internships)?"
        options={Q1_OPTIONS}
        value={formData.q1}
        onChange={val => updateField('q1', val)}
        getDisplay={getDisplayOption}
        getStored={(display) => getStoredValue(display, Q1_OPTIONS)}
        error={errors.q1}
        required
      />

      <RadioGroup
        name="q2"
        legend="Q2. In a typical working week, how often do you use any generative AI tool for design work (including ideation, research, writing, exploration, or production)?"
        options={Q2_OPTIONS}
        value={formData.q2}
        onChange={val => updateField('q2', val)}
        getDisplay={getDisplayOption}
        getStored={(display) => getStoredValue(display, Q2_OPTIONS)}
        error={errors.q2}
        required
      />

      <RadioGroup
        name="q3"
        legend="Q3. Which of the following best describes your generative AI practice for ideation specifically?"
        options={Q3_OPTIONS}
        value={formData.q3}
        onChange={val => updateField('q3', val)}
        getDisplay={getDisplayOption}
        getStored={(display) => getStoredValue(display, Q3_OPTIONS)}
        error={errors.q3}
        required
      />
    </div>
  );
}
