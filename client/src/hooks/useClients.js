import { useState, useEffect } from 'react';
import api from '../services/api';

const useClients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/ca/clients');
            if (data.success) {
                setClients(data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch clients');
        } finally {
            setLoading(false);
        }
    };

    const addClient = async (clientData) => {
        try {
            const { data } = await api.post('/ca/clients', clientData);
            if (data.success) {
                // Refresh list logic or append
                setClients([...clients, data.data]);
                return { success: true, message: data.message };
            }
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Failed to add client' };
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    return { clients, loading, error, addClient, refreshClients: fetchClients };
};

export default useClients;
