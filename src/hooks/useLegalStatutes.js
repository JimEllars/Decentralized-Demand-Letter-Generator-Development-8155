import { useQuery } from '@tanstack/react-query';
import { STATE_LEGAL_DETAILS, STATE_SPECIFIC_CLAUSES } from '../utils/constants';

const fetchLegalStatutes = async () => {
  try {
    const paymentApiUrl = typeof import.meta !== 'undefined' && import.meta.env
      ? import.meta.env.VITE_PAYMENT_API_URL
      : process.env.VITE_PAYMENT_API_URL;

    // We expect the worker proxy to handle the API gateway logic
    const fetchUrl = paymentApiUrl ? `${paymentApiUrl}/v1/legal-statutes` : '/api/v1/legal-statutes';

    const response = await fetch(fetchUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch legal statutes');
    }
    return await response.json();
  } catch (error) {
    console.warn('Failed to fetch legal statutes, falling back to static constants', error);
    // Return the static structure if API fails
    return {
      details: STATE_LEGAL_DETAILS,
      clauses: STATE_SPECIFIC_CLAUSES
    };
  }
};

export const useLegalStatutes = () => {
  return useQuery({
    queryKey: ['legalStatutes'],
    queryFn: fetchLegalStatutes,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    initialData: {
      details: STATE_LEGAL_DETAILS,
      clauses: STATE_SPECIFIC_CLAUSES
    }
  });
};
