import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePharmacy } from '@/contexts/PharmacyContext';

export function usePharmacyAuth(requireAuth = true) {
    const navigate = useNavigate();
    const { pharmacy, loading, signOut, setPharmacy, refresh } = usePharmacy();
    const token = localStorage.getItem('pharmacy_token');

    useEffect(() => {
        if (requireAuth && !loading && !pharmacy) {
            navigate('/unified-auth', { replace: true });
        }
    }, [requireAuth, loading, pharmacy, navigate]);

    return { pharmacy, loading, token, signOut, setPharmacy, refresh };
}
