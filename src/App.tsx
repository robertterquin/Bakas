import { useState, useCallback } from 'react';
import { useGeolocation } from './hooks/useGeolocation';
import { useSyncManager } from './hooks/useSyncManager';
import { useHazardManager } from './hooks/useHazardManager';
import { MapRadarCanvas } from './components/map/MapRadarCanvas';
import { TopHUD } from './components/hud/TopHUD';
import { CategoryFilterBar } from './components/hud/CategoryFilterBar';
import { ActionHUD } from './components/hud/ActionHUD';
import { ReportBottomSheet } from './components/modals/ReportBottomSheet';
import { HazardDetailBottomSheet } from './components/modals/HazardDetailBottomSheet';
import { FilterDrawer } from './components/modals/FilterDrawer';
import { SyncStatusModal } from './components/modals/SyncStatusModal';
import { AboutModal } from './components/modals/AboutModal';
import { ToastNotification } from './components/ui/ToastNotification';
import { HazardPayload } from './types/hazard';

export default function App() {
  // 1. Geolocation Tracking
  const {
    location: userLocation,
    isTracking,
    recenterCount,
    recenter,
  } = useGeolocation();

  // 2. Offline Sync Engine
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSyncComplete = useCallback((count: number) => {
    setToastMessage(`Synced ${count} offline ${count === 1 ? 'trace' : 'traces'} to radar.`);
  }, []);

  const {
    isOnline,
    pendingCount,
    isSyncing,
    refreshPendingCount,
    syncPendingItems,
  } = useSyncManager(handleSyncComplete);

  // 3. Hazard Manager & Spatial Queries
  const {
    filteredHazards,
    activeFilter,
    setActiveFilter,
    radiusFilter,
    setRadiusFilter,
    selectedHazardId,
    setSelectedHazardId,
    selectedHazard,
    checkNearbyDuplicate,
    reportHazard,
    upvoteHazard,
    resolveHazard,
  } = useHazardManager(userLocation, isOnline, refreshPendingCount);

  // 4. Modal & Sheet UI States
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);

  // Handle Hazard Submission
  const handleReportSubmit = async (payload: HazardPayload) => {
    const result = await reportHazard(payload);
    if (result.isOffline) {
      setToastMessage('Hazard saved offline in IndexedDB! Will sync when online.');
    } else {
      setToastMessage('Hazard trace live on 5km radar!');
    }
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans select-none">
      {/* 1. Fullscreen Map Radar Canvas (Leaflet + CartoDB Dark Matter) */}
      <MapRadarCanvas
        userLocation={userLocation}
        hazards={filteredHazards}
        selectedHazardId={selectedHazardId}
        onSelectHazard={(id) => setSelectedHazardId(id)}
        recenterCount={recenterCount}
        radiusFilter={radiusFilter}
        activeFilter={activeFilter}
      />

      {/* 2. Top HUD Header */}
      <TopHUD
        hazardCount={filteredHazards.length}
        radiusFilter={radiusFilter}
        isOnline={isOnline}
        pendingCount={pendingCount}
        isSyncing={isSyncing}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onOpenFilter={() => setIsFilterOpen(true)}
        onOpenSync={() => setIsSyncModalOpen(true)}
        onManualSync={syncPendingItems}
      />

      {/* 3. Horizontal Category Filter Chips */}
      <CategoryFilterBar
        activeFilter={activeFilter}
        onSelectFilter={(cat) => setActiveFilter(cat)}
      />

      {/* 4. Bottom Action HUD Controls */}
      <ActionHUD
        onOpenReport={() => setIsReportOpen(true)}
        onRecenter={recenter}
        isTracking={isTracking}
      />

      {/* 5. Modals & Bottom Sheets */}
      {/* Report Modal */}
      <ReportBottomSheet
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        userLocation={userLocation}
        onSubmit={handleReportSubmit}
        checkNearbyDuplicate={checkNearbyDuplicate}
        onSelectExisting={(id) => {
          setSelectedHazardId(id);
          setIsReportOpen(false);
        }}
      />

      {/* Hazard Detail Sheet */}
      <HazardDetailBottomSheet
        hazard={selectedHazard}
        userLocation={userLocation}
        onClose={() => setSelectedHazardId(null)}
        onUpvote={upvoteHazard}
        onResolve={resolveHazard}
        onShowToast={(msg) => setToastMessage(msg)}
      />

      {/* Filter & Radius Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        radiusFilter={radiusFilter}
        onChangeRadius={(r) => {
          setRadiusFilter(r);
        }}
        activeFilter={activeFilter}
        onChangeCategory={(c) => {
          setActiveFilter(c);
        }}
      />

      {/* Offline Sync Status Modal */}
      <SyncStatusModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        isOnline={isOnline}
        isSyncing={isSyncing}
        onTriggerSync={syncPendingItems}
        onShowToast={(msg) => setToastMessage(msg)}
      />

      {/* About & Safety Guidance Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      {/* Toast Notification Alert */}
      <ToastNotification
        message={toastMessage}
        onDismiss={() => setToastMessage(null)}
      />
    </main>
  );
}
