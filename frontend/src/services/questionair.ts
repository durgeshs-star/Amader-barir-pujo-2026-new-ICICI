import { API_URL } from '../config/api';

export interface QuestionairPayload {
  name: string;
  workingAt: string;
  email: string;
  contactNo: string;
  pujaMember: string;
  committee: string;
  committeeOtherDetail: string;
  willingVolunteer: string;
}

export interface QuestionairResponse {
  success: boolean;
  message?: string;
  sheetSaved?: boolean;
}

export const submitQuestionair = async (payload: QuestionairPayload): Promise<QuestionairResponse> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

  try {
    const res = await fetch(`${API_URL.replace(/\/+$/,'')}/api/questionair/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText || 'Request failed');
      throw new Error(text || 'Submission failed');
    }

    const data = (await res.json()) as QuestionairResponse;
    return data;
  } finally {
    clearTimeout(timeout);
  }
};
