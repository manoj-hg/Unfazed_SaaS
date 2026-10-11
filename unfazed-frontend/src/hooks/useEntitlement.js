import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';

export const useEntitlement = () => {
  const { user } = useContext(AuthContext);
  const [entitlements, setEntitlements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [blockedFeature, setBlockedFeature] = useState(null);

  const fetchEntitlements = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const res = await axiosInstance.get('/therapist/me/entitlements');
      setEntitlements(res.data.current);
    } catch (err) {
      console.error('Failed to fetch entitlements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntitlements();
  }, [user]);

  const canAccess = (featureKey) => {
    if (!entitlements) return true; // optimistic default while loading
    if (featureKey === 'max_active_clients') {
      const cap = entitlements.caps?.max_active_clients || 5;
      const current = entitlements.usage?.active_clients || 0;
      return current < cap;
    }
    return !!(entitlements.features && entitlements.features[featureKey]);
  };

  const gateAction = (featureKey, callback) => {
    if (canAccess(featureKey)) {
      if (callback) callback();
      return true;
    } else {
      setBlockedFeature(featureKey);
      setModalOpen(true);
      return false;
    }
  };

  const upgradeTier = async (newTier) => {
    try {
      const res = await axiosInstance.post('/therapist/upgrade-tier', { tier: newTier });
      setEntitlements(res.data.entitlements);
      setModalOpen(false);
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  return {
    entitlements,
    tier: entitlements?.tier || user?.subscription_tier || 'free',
    loading,
    canAccess,
    gateAction,
    modalOpen,
    setModalOpen,
    blockedFeature,
    setBlockedFeature,
    refreshEntitlements: fetchEntitlements,
    upgradeTier
  };
};

export default useEntitlement;
