import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Workspace } from '../types/database';
import { StorageAdapter, localDb, DEFAULT_WORKSPACE_ID } from '../services/storageAdapter';

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace;
  currentWorkspaceId: string;
  setCurrentWorkspaceId: (id: string) => void;
  createWorkspace: (name: string, timezone?: string, phone?: string) => Promise<Workspace>;
  refreshWorkspaces: () => Promise<void>;
  loading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => localDb.clinics);
  const [currentWorkspaceId, setCurrentWorkspaceIdState] = useState<string>(() => localDb.activeWorkspaceId || DEFAULT_WORKSPACE_ID);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshWorkspaces = useCallback(async () => {
    try {
      const wsList = await StorageAdapter.getWorkspaces();
      setWorkspaces(wsList);
      const activeId = StorageAdapter.getActiveWorkspaceId();
      if (wsList.some((w) => w.id === activeId)) {
        setCurrentWorkspaceIdState(activeId);
      } else if (wsList.length > 0) {
        setCurrentWorkspaceIdState(wsList[0].id);
        StorageAdapter.setActiveWorkspaceId(wsList[0].id);
      }
    } catch (err) {
      console.error('Failed to load workspaces', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshWorkspaces();
    const unsub = localDb.subscribe(() => {
      setWorkspaces([...localDb.clinics]);
      setCurrentWorkspaceIdState(localDb.activeWorkspaceId);
    });
    return () => unsub();
  }, [refreshWorkspaces]);

  const setCurrentWorkspaceId = (id: string) => {
    StorageAdapter.setActiveWorkspaceId(id);
    setCurrentWorkspaceIdState(id);
  };

  const createWorkspace = async (name: string, timezone?: string, phone?: string): Promise<Workspace> => {
    const ws = await StorageAdapter.createWorkspace(name, timezone, phone);
    await refreshWorkspaces();
    setCurrentWorkspaceId(ws.id);
    return ws;
  };

  const currentWorkspace =
    workspaces.find((w) => w.id === currentWorkspaceId) ||
    workspaces[0] || {
      id: DEFAULT_WORKSPACE_ID,
      name: 'Demo Clinic',
      timezone: 'Asia/Kolkata',
      phone: '+91 9876543210',
      created_at: new Date().toISOString(),
    };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        currentWorkspaceId,
        setCurrentWorkspaceId,
        createWorkspace,
        refreshWorkspaces,
        loading,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
