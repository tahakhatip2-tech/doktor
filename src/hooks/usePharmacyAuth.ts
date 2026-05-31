import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function usePharmacyAuth(requireAuth = true) {
    const navigate = useNavigate();
    const [pharmacy, setPharmacy] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('pharmacy_token');

    useEffect(() => {
        const verifyAuth = async () => {
            if (!token) {
                if (requireAuth) {
                    navigate('/unified-auth', { replace: true });
                } else {
                    setLoading(false);
                }
                return;
            }

            try {
                // We can use a patient profile endpoint or create a specific pharmacy endpoint if needed
                // For now, since pharmacy is just a User, maybe we can fetch profile
                const res = await axios.get(`${API_URL}/pharmacy/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (res.data.role !== 'PHARMACY') {
                    throw new Error('Not a pharmacy');
                }
                
                setPharmacy(res.data);
                
                // Keep localStorage in sync
                localStorage.setItem('pharmacy_user', JSON.stringify(res.data));
            } catch (error) {
                console.error('Pharmacy auth failed:', error);
                if (requireAuth) {
                    signOut();
                }
            } finally {
                setLoading(false);
            }
        };

        verifyAuth();
    }, [navigate, requireAuth, token]);

    const signOut = () => {
        localStorage.removeItem('pharmacy_token');
        localStorage.removeItem('pharmacy_user');
        setPharmacy(null);
        navigate('/unified-auth', { replace: true });
    };

    return { pharmacy, loading, token, signOut };
}
