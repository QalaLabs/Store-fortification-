'use client';

/**
 * CARTGUARD AI - API Context & Provider
 * Team: QALA LABS | E-Commerce Security Operations
 *
 * Provides application-wide visibility into:
 * - Active data mode (LIVE vs DEMO vs ERROR)
 * - Backend API health & URL configuration
 * - Dynamic mode switching for demo and QA testing
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { DataMode, ApiModePreference, DataSource, BackendHealthStatus } from './types';
import { apiClient } from './client';

interface ApiContextValue {
  dataMode: DataMode;
  dataSource: DataSource;
  modePreference: ApiModePreference;
  setModePreference: (mode: ApiModePreference) => void;
  backendStatus: BackendHealthStatus;
  isChecking: boolean;
  checkHealth: () => Promise<void>;
  baseUrl: string;
}

const defaultHealth: BackendHealthStatus = {
  online: false,
  mode: 'DEMO',
  endpoint: apiClient.getBaseUrl(),
  providerStatus: 'MOCK',
  checkedAt: new Date().toISOString(),
  message: 'Initializing API client...',
};

const ApiContext = createContext<ApiContextValue>({
  dataMode: 'DEMO',
  dataSource: 'fixtures',
  modePreference: 'auto',
  setModePreference: () => {},
  backendStatus: defaultHealth,
  isChecking: false,
  checkHealth: async () => {},
  baseUrl: apiClient.getBaseUrl(),
});

export function ApiProvider({ children }: { children: ReactNode }) {
  const [modePreference, setModePreferenceState] = useState<ApiModePreference>(apiClient.getModePreference());
  const [dataMode, setDataMode] = useState<DataMode>('DEMO');
  const [dataSource, setDataSource] = useState<DataSource>('fixtures');
  const [backendStatus, setBackendStatus] = useState<BackendHealthStatus>(defaultHealth);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const checkHealth = useCallback(async () => {
    setIsChecking(true);
    try {
      const status = await apiClient.checkHealth();
      setBackendStatus(status);

      if (modePreference === 'live') {
        if (status.online) {
          setDataMode('LIVE');
          setDataSource('backend');
        } else {
          setDataMode('ERROR');
          setDataSource('none');
        }
      } else if (modePreference === 'demo') {
        setDataMode('DEMO');
        setDataSource('fixtures');
      } else {
        // Auto mode
        if (status.online) {
          setDataMode('LIVE');
          setDataSource('backend');
        } else {
          setDataMode('DEMO');
          setDataSource('fixtures');
        }
      }
    } finally {
      setIsChecking(false);
    }
  }, [modePreference]);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  const handleSetModePreference = (mode: ApiModePreference) => {
    apiClient.setModePreference(mode);
    setModePreferenceState(mode);
  };

  return (
    <ApiContext.Provider
      value={{
        dataMode,
        dataSource,
        modePreference,
        setModePreference: handleSetModePreference,
        backendStatus,
        isChecking,
        checkHealth,
        baseUrl: apiClient.getBaseUrl(),
      }}
    >
      {children}
    </ApiContext.Provider>
  );
}

export function useApiContext() {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApiContext must be used within an ApiProvider');
  }
  return context;
}
