import { useMemo, useState } from 'react';

export interface QuestionairFormValues {
  name: string;
  workingAt: string;
  email: string;
  contactNo: string;
  pujaMember: string;
  committee: string;
  committeeOtherDetail: string;
  willingVolunteer: string;
}

export type QuestionairFormField = keyof QuestionairFormValues;

const initialValues: QuestionairFormValues = {
  name: '',
  workingAt: '',
  email: '',
  contactNo: '',
  pujaMember: '',
  committee: '',
  committeeOtherDetail: '',
  willingVolunteer: '',
};

const validateField = (field: QuestionairFormField, value: string, committeeValues: QuestionairFormValues): string => {
  const trimmed = value.trim();

  switch (field) {
    case 'name':
      return trimmed.length >= 2 ? '' : 'Please enter your name.';
    case 'workingAt':
      return trimmed.length >= 2 ? '' : 'Please enter where you work.';
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
        ? ''
        : 'Please enter a valid email address.';
    case 'contactNo':
      return /^\d{10,15}$/.test(trimmed) ? '' : 'Please enter a valid phone number with digits only.';
    case 'pujaMember':
    case 'willingVolunteer':
      return trimmed === 'yes' || trimmed === 'no' ? '' : 'Please select an option.';
    case 'committee':
      return trimmed ? '' : 'Please select a committee.';
    case 'committeeOtherDetail':
      return committeeValues.committee === 'Other' && trimmed.length >= 2
        ? ''
        : committeeValues.committee === 'Other'
          ? 'Please tell us more about the committee.'
          : '';
    default:
      return '';
  }
};

export const useQuestionairForm = () => {
  const [values, setValues] = useState<QuestionairFormValues>(initialValues);
  const [touched, setTouched] = useState<Record<QuestionairFormField, boolean>>({
    name: false,
    workingAt: false,
    email: false,
    contactNo: false,
    pujaMember: false,
    committee: false,
    committeeOtherDetail: false,
    willingVolunteer: false,
  });

  const validateValues = (currentValues: QuestionairFormValues) => {
    const nextErrors = {} as Record<QuestionairFormField, string>;

    (Object.keys(initialValues) as QuestionairFormField[]).forEach((field) => {
      nextErrors[field] = validateField(field, currentValues[field], currentValues);
    });

    return nextErrors;
  };

  const errors = useMemo(() => validateValues(values), [values]);

  const isValid = useMemo(() => Object.values(errors).every((error) => !error), [errors]);

  const setFieldValue = (field: string, value: string) => {
    const fieldKey = field as QuestionairFormField;
    setValues((current) => ({ ...current, [fieldKey]: value }));
    if (fieldKey === 'committee' && value !== 'Other') {
      setValues((current) => ({ ...current, committeeOtherDetail: '' }));
    }
  };

  const markFieldTouched = (field: string) => {
    setTouched((current) => ({ ...current, [field as QuestionairFormField]: true }));
  };

  const markAllTouched = () => {
    setTouched({
      name: true,
      workingAt: true,
      email: true,
      contactNo: true,
      pujaMember: true,
      committee: true,
      committeeOtherDetail: true,
      willingVolunteer: true,
    });
  };

  return {
    values,
    touched,
    errors,
    isValid,
    validateValues,
    setFieldValue,
    markFieldTouched,
    markAllTouched,
    reset: () => {
      setValues(initialValues);
      setTouched({
        name: false,
        workingAt: false,
        email: false,
        contactNo: false,
        pujaMember: false,
        committee: false,
        committeeOtherDetail: false,
        willingVolunteer: false,
      });
    },
  };
};
