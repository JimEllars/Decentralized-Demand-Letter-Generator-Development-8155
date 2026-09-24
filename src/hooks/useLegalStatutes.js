import { useQuery } from '@tanstack/react-query';
import { STATE_LEGAL_DETAILS, STATE_SPECIFIC_CLAUSES } from '../utils/constants';
import { fetchWithRetry } from '../utils/retryUtils';

const statuteCache = new Map();

const fetchLegalStatutes = async (jurisdiction = 'default') => {
  if (statuteCache.has(jurisdiction)) {
    return statuteCache.get(jurisdiction);
  }

  try {
    const paymentApiUrl = typeof import.meta !== 'undefined' && import.meta.env
      ? import.meta.env.VITE_PAYMENT_API_URL
      : process.env.VITE_PAYMENT_API_URL;

    // We expect the worker proxy to handle the API gateway logic
    const fetchUrl = paymentApiUrl ? `${paymentApiUrl}/v1/legal-statutes?state=${jurisdiction}` : `/api/v1/legal-statutes?state=${jurisdiction}`;

    const response = await fetchWithRetry(fetchUrl, {}, 2, 500);
    if (!response.ok) {
      throw new Error('Failed to fetch legal statutes');
    }
    const data = await response.json();

    // Check if it's the fallback metadata from worker
    let finalData = data;
    if (data && data.success && data.meta && data.meta.fallback) {
      finalData = data.data;
    }

    statuteCache.set(jurisdiction, finalData);
    return finalData;
  } catch (error) {
    console.warn('Failed to fetch legal statutes, falling back to static constants', error);
    // Return the static structure if API fails completely
    const fallback = {
      details: STATE_LEGAL_DETAILS,
      clauses: STATE_SPECIFIC_CLAUSES
    };
    statuteCache.set(jurisdiction, fallback);
    return fallback;
  }
};

export const useLegalStatutes = (jurisdiction = 'default') => {
  return useQuery({
    queryKey: ['legalStatutes', jurisdiction],
    queryFn: () => fetchLegalStatutes(jurisdiction),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    initialData: () => statuteCache.get(jurisdiction) || {
      details: STATE_LEGAL_DETAILS,
      clauses: STATE_SPECIFIC_CLAUSES
    }
  });
};
