import { getAdminApiUrl } from '@/app/utils/enum';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { useCallback, useMemo, useEffect, useRef, useState } from 'react';

const useSyncProgramSchedules = (
  companyId: string,
  schedules: any[],
  startDate: Date,
  endDate: Date,
  onSyncSuccess: (updatedSchedules: any[]) => void,
  onSyncError: (error: any) => void,
) => {
  const [syncState, setSyncState] = useState<any>({
    isSyncing: false,
    lastSyncTime: null,
    pendingChanges: new Set(),
    error: null,
  });

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncDataRef = useRef<any[]>([]);
  const pendingSyncRef = useRef<any[]>([]);

  // Function to check if schedules actually changed
  const hasSchedulesChanged = useCallback(
    (newSchedules: any[], lastSynced: any[]) => {
      if (newSchedules.length !== lastSynced.length) return true;

      return newSchedules.some((newSchedule, index) => {
        const lastSchedule = lastSynced[index];
        if (!lastSchedule) return true;

        return (
          newSchedule.id !== lastSchedule.id ||
          newSchedule.date !== lastSchedule.date ||
          newSchedule.time !== lastSchedule.time ||
          newSchedule.status !== lastSchedule.status ||
          newSchedule.programId !== lastSchedule.programId
        );
      });
    },
    [],
  );

  const performSync = useCallback(
    async (schedulesToUpdate: any[]) => {
      try {
        // Check if schedules actually changed
        if (!hasSchedulesChanged(schedulesToUpdate, lastSyncDataRef.current)) {
          console.log('No changes detected, skipping sync');
          return;
        }

        setSyncState((prev: any) => ({
          ...prev,
          isSyncing: true,
          error: null,
        }));

        console.log('Syncing schedules:', schedulesToUpdate);

        const response = await axios.put(
          getAdminApiUrl(companyId, '/water-program/schedule'),
          {
            updatedSchedules: schedulesToUpdate,
            startDate,
            endDate,
          },
        );

        if (response.data.error) {
          setSyncState((prev: any) => ({
            ...prev,
            isSyncing: false,
            error: response.data.error,
          }));
          onSyncError(response.data.error);
          return;
        }

        setSyncState((prev: any) => ({
          ...prev,
          isSyncing: false,
          lastSyncTime: new Date(),
          pendingChanges: new Set(),
          error: null,
        }));

        // Update the reference data
        lastSyncDataRef.current = [...schedulesToUpdate];

        onSyncSuccess(response.data.data);
      } catch (error: any) {
        console.log('Fail to sync program schedules: ', error);
        setSyncState((prev: any) => ({
          ...prev,
          isSyncing: false,
          error: error.message || 'Sync failed',
        }));
        onSyncError(error.message || 'Sync failed');
      }
    },
    [
      companyId,
      startDate,
      endDate,
      onSyncError,
      onSyncSuccess,
      hasSchedulesChanged,
    ],
  );

  // Create the debounced function ONCE and keep it stable
  const debouncedPerformSyncRef = useRef<ReturnType<typeof debounce>>();
  if (!debouncedPerformSyncRef.current) {
    debouncedPerformSyncRef.current = debounce((payload: any[]) => {
      console.log('debouncedPerformSync executing with:', payload);
      performSync(payload);
    }, 1000);
  }

  // On unmount: flush the last pending call so it actually runs
  useEffect(() => {
    return () => {
      debouncedPerformSyncRef.current?.flush();
    };
  }, []);

  // const debouncedPerformSync = useMemo(() => {
  //   const fn = debounce((payload: any[]) => {
  //     console.log('debouncedPerformSync executing with:', payload);
  //     performSync(payload);
  //   }, 1000);
  //   return fn;
  // }, [performSync]);

  // // Clean up the debounced fn on unmount
  // useEffect(() => {
  //   return () => {
  //     debouncedPerformSync.cancel();
  //   };
  // }, [debouncedPerformSync]);

  const triggerSync = useCallback(
    (schedulesToUpdate: any[]) => {
      console.log('triggerSync', schedulesToUpdate);
      // Store the latest schedules to sync
      pendingSyncRef.current = schedulesToUpdate;

      // Cancel the previous timeout
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      setSyncState((prev: any) => ({
        ...prev,
        pendingChanges: new Set([
          ...prev.pendingChanges,
          ...schedulesToUpdate.map((s) => s.id),
        ]),
      }));

      // Use the latest schedules from ref to avoid stale closure
      debouncedPerformSyncRef.current?.(schedulesToUpdate);
    },
    [],
  );

  // Function to get sync status
  const getSyncStatus = useCallback(() => {
    if (syncState.isSyncing) {
      return 'syncing';
    }
    if (syncState.pendingChanges.size > 0) {
      return 'pending';
    }
    if (syncState.error) {
      return 'error';
    }
    return 'synced';
  }, [syncState]);

  return { triggerSync, getSyncStatus };
};

export default useSyncProgramSchedules;
