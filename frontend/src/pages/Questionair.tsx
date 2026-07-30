import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLoader } from 'react-icons/fi';
import { TextField } from '../components/form/TextField';
import { RadioGroup } from '../components/form/RadioGroup';
import { SelectField } from '../components/form/SelectField';
import { Modal } from '../components/ui/Modal';
import { submitQuestionair } from '../services/questionair';
import { useWakeBackend } from '../hooks/useWakeBackend';
import { useQuestionairForm } from '../hooks/useQuestionairForm';

const committeeOptions = [
  { label: 'Logistics', value: 'Logistics' },
  { label: 'Pooja Operations', value: 'Pooja Operations' },
  { label: 'Bhog Distribution', value: 'Bhog Distribution' },
  { label: 'Decoration', value: 'Decoration' },
  { label: 'Cultural', value: 'Cultural' },
  { label: 'Other', value: 'Other' },
];

const yesNoOptions = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
];

const Questionair: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const { values, touched, errors, isValid, validateValues, setFieldValue, markFieldTouched, markAllTouched, reset } = useQuestionairForm();

  const showCommitteeDetail = values.committee === 'Other';

  const canSubmit = useMemo(() => isValid && !isSubmitting, [isValid, isSubmitting]);

  useEffect(() => {
    const siteLive = (import.meta.env.VITE_SITE_LIVE || import.meta.env.REACT_APP_SITE_LIVE || 'false').toLowerCase() === 'true';
    if (siteLive) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  // Wake backend on mount (fire-and-forget)
  useWakeBackend();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    markAllTouched();
    setSubmissionError(null);

    const formErrors = validateValues(values);
    if (Object.values(formErrors).some(Boolean)) {
      return;
    }

    setIsSubmitting(true);

    try {
      await submitQuestionair({
        name: values.name.trim(),
        workingAt: values.workingAt.trim(),
        email: values.email.trim(),
        contactNo: values.contactNo.trim(),
        pujaMember: values.pujaMember,
        committee: values.committee,
        committeeOtherDetail: values.committeeOtherDetail.trim(),
        willingVolunteer: values.willingVolunteer,
      });

      setIsModalOpen(true);
      reset();
    } catch (error) {
      console.error('Questionair submission failed', error);
      setSubmissionError('Submission failed. Please try again — it may take a moment while the server wakes up.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative h-full">
      <section className="w-full">
        <picture>
          <source media="(max-width: 767px)" srcSet="/assets/img/Mobile-Questionaire-Banner.svg" />
          <img
            src="/assets/img/questionair-banner.svg"
            alt="Questionair banner for Amader Barir Pujo"
            className="w-full h-auto object-cover rounded-3xl"
          />
        </picture>
      </section>

      <section className="content-layer mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col justify-center px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="text-3xl font-semibold leading-tight text-primary sm:text-4xl lg:text-5xl">
            Come as a devotee. <span className="block sm:inline">Stay as family.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg text-center">
            Tell us a little about yourself, so we can welcome you the way a family should.
          </p>
        </div>

        <div className="mx-auto w-full max-w-3xl rounded-[2rem] border border-border/70 bg-surface p-5 shadow-[0_20px_60px_rgba(120,40,80,0.12)] sm:p-8 lg:p-10">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <TextField
              id="questionair-name"
              label="Name"
              name="name"
              value={values.name}
              onChange={setFieldValue}
              onBlur={markFieldTouched}
              error={errors.name}
              touched={touched.name}
              placeholder="Your full name"
              autoComplete="name"
            />

            <TextField
              id="questionair-working-at"
              label="Working at"
              name="workingAt"
              value={values.workingAt}
              onChange={setFieldValue}
              onBlur={markFieldTouched}
              error={errors.workingAt}
              touched={touched.workingAt}
              placeholder="Where do you work?"
              autoComplete="organization"
            />

            <TextField
              id="questionair-email"
              label="Email"
              name="email"
              type="email"
              value={values.email}
              onChange={setFieldValue}
              onBlur={markFieldTouched}
              error={errors.email}
              touched={touched.email}
              placeholder="you@example.com"
              autoComplete="email"
              inputMode="email"
            />

            <TextField
              id="questionair-contact"
              label="Contact No."
              name="contactNo"
              type="tel"
              value={values.contactNo}
              onChange={setFieldValue}
              onBlur={markFieldTouched}
              error={errors.contactNo}
              touched={touched.contactNo}
              placeholder="10 digits"
              autoComplete="tel"
              inputMode="tel"
            />

            <RadioGroup
              id="questionair-puja-member"
              label="Are you currently / or in the past have been a member of any Puja?"
              name="pujaMember"
              value={values.pujaMember}
              options={yesNoOptions}
              onChange={setFieldValue}
              onBlur={markFieldTouched}
              error={errors.pujaMember}
              touched={touched.pujaMember}
            />

            <SelectField
              id="questionair-committee"
              label="Did you work in any of the committees?"
              name="committee"
              value={values.committee}
              options={committeeOptions}
              onChange={setFieldValue}
              onBlur={markFieldTouched}
              error={errors.committee}
              touched={touched.committee}
              placeholder="Choose a committee"
            />

            {showCommitteeDetail ? (
              <TextField
                id="questionair-committee-other"
                label="Please specify"
                name="committeeOtherDetail"
                value={values.committeeOtherDetail}
                onChange={setFieldValue}
                onBlur={markFieldTouched}
                error={errors.committeeOtherDetail}
                touched={touched.committeeOtherDetail}
                placeholder="Tell us more about your committee"
              />
            ) : null}

            <RadioGroup
              id="questionair-volunteer"
              label="Are you willing to volunteer with ABP?"
              name="willingVolunteer"
              value={values.willingVolunteer}
              options={yesNoOptions}
              onChange={setFieldValue}
              onBlur={markFieldTouched}
              error={errors.willingVolunteer}
              touched={touched.willingVolunteer}
            />

            <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-text-muted">All fields are required to continue.</p>
                {submissionError ? (
                  <p className="mt-2 text-sm text-red-500" role="alert">{submissionError}</p>
                ) : null}
              </div>
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-text-on-primary transition-all duration-200 hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/70"
              >
                {isSubmitting ? (
                  <>
                    <FiLoader className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="">
        <div className="flex flex-col items-center gap-6 text-center px-4 w-full">
          <h2 className="text-2xl md:text-2xl font-extrabold text-primary">
            Scan QR code to join <br />the ABP WhatsApp group
          </h2>
          <img
            src="/assets/img/wp-qr-code.webp"
            alt="QR code for joining the ABP WhatsApp group"
            className="mx-auto h-48 w-48 rounded-2xl border border-border object-cover sm:h-56 sm:w-56"
          />
          <h3 className="text-2xl md:text-2xl font-extrabold text-primary">Or</h3>

          <a
            href="https://chat.whatsapp.com/E3517cywkyO7c27De5eRG5?mlu=0&s=qs&p=i"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-3 text-lg font-bold text-text-on-accent transition-colors hover:bg-accent-light mx-auto "
          >
            Click Here
          </a>
        </div>
      </Modal>
    </div>
  );
};

export default Questionair;
