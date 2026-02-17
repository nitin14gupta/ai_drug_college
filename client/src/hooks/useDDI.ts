import { useState, useCallback } from 'react';
import { apiService } from '@/src/api/apiService';

export interface Interaction {
    drug_a: string;
    drug_b: string;
    severity: 'Major' | 'Moderate' | 'Minor' | 'Unknown';
    drug_a_id: string;
    drug_b_id: string;
    explanation?: string;
}

export interface RiskSummary {
    score: number;
    summary: string;
    interaction_count: number;
}

export const useDDI = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchDrugs = useCallback(async (query: string) => {
        if (query.length < 2) return [];
        try {
            return await apiService.searchDrugs(query);
        } catch (err: any) {
            console.error(err);
            return [];
        }
    }, []);

    const checkInteractions = useCallback(async (drugIds: string[], userId?: string, patientContext?: any) => {
        setLoading(true);
        setError(null);
        try {
            return await apiService.checkInteractions(drugIds, userId, patientContext);
        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const getExplanation = useCallback(async (interaction: Interaction, mode: 'patient' | 'clinician' = 'patient') => {
        try {
            const data = await apiService.explainInteraction(
                interaction.drug_a,
                interaction.drug_b,
                interaction.severity,
                mode
            );
            return data.explanation;
        } catch (err: any) {
            console.error(err);
            return 'Failed to load explanation.';
        }
    }, []);

    const getStats = useCallback(async () => {
        try {
            return await apiService.getDDIStats();
        } catch (err: any) {
            console.error(err);
            return null;
        }
    }, []);

    const saveMedication = useCallback(async (userId: string, drugId: string, drugName: string) => {
        try {
            return await apiService.addUserMedication({ user_id: userId, drug_id: drugId, drug_name: drugName });
        } catch (err: any) {
            console.error(err);
            return null;
        }
    }, []);

    const fetchUserMedications = useCallback(async (userId: string) => {
        try {
            return await apiService.getUserMedications(userId);
        } catch (err: any) {
            console.error(err);
            return [];
        }
    }, []);

    return {
        loading,
        error,
        searchDrugs,
        checkInteractions,
        getExplanation,
        getStats,
        saveMedication,
        fetchUserMedications,
    };
};
