import { useState, useCallback } from 'react';
import { useGeolocation } from './hooks/useGeolocation';
import { useSyncManager } from './hooks/useSyncManager';
import { useHazardManager } from './hooks/useHazardManager';
import { MapRadarCanvas } from './components/map/MapRadarCanvas';
import { TopHUD } from './components/hud/TopHUD';
import { ActionHUD } from './components/hud/ActionHUD';
import { ReportBottomSheet } from './components/modals/ReportBottomSheet';
import { HazardDetailBottomSheet } from './components/modals/HazardDetailBottomSheet';
import { FilterDrawer } from './components/modals/FilterDrawer';
import { SyncStatusModal } from './components/modals/SyncStatusModal';
import { AboutModal } from './components/modals/AboutModal';
import { ToastNotification } from './components/ui/ToastNotification';
import { ScreenReaderAnnouncer } from './components/ui/ScreenReaderAnnouncer';
import { HazardPayload, Coordinates } from './types/hazard';

export default function App() {
  // 1. Geolocation Tracking
  const {
    location: userLocation,
    isTracking,
    recenterCount,
    recenter,
  } = useGeolocation();

  // 2. Announcements & Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string | null>(null);

  const notifyUser = useCallback((msg: string) => {
    setToastMessage(msg);
    setAriaAnnouncement(msg);
  }, []);

  // 3. Offline Sync Engine
  const handleSyncComplete = useCallback((count: number) => {
    notifyUser(`Synced ${count} offline ${count === 1 ? 'trace' : 'traces'}.`);
  }, [notifyUser]);

  const {
    isOnline,
    pendingCount,
    isSyncing,
    refreshPendingCount,
    syncPendingItems,
  } = useSyncManager(handleSyncComplete);

  // 4. Hazard Manager & Spatial Queries
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

  // 5. Custom Click-to-Pin & Modal States
  const [customReportCoords, setCustomReportCoords] = useState<Coordinates | null>(null);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);

  // Handle clicking anywhere on the map to drop a pin
  const handleMapClick = useCallback((lat: number, lng: number) => {
    setSelectedHazardId(null);
    setCustomReportCoords({ lat, lng });
    setIsReportOpen(true);
    notifyUser('Pinned location on map.');
  }, [setSelectedHazardId, notifyUser]);

  // Handle closing report sheet
  const handleCloseReport = useCallback(() => {
    setIsReportOpen(false);
    setCustomReportCoords(null);
  }, []);

  // Handle Hazard Submission
  const handleReportSubmit = async (payload: HazardPayload) => {
    const result = await reportHazard(payload);
    setCustomReportCoords(null);
    if (result.isOffline) {
      notifyUser('Saved offline in IndexedDB.');
    } else {
      notifyUser('Hazard trace live on radar!');
    }
  };

  const activeTargetCoords: Coordinates = customReportCoords || {
    lat: userLocation.lat,
    lng: userLocation.lng,
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans select-none">
      {/* Screen Reader ARIA Live Region */}
      <ScreenReaderAnnouncer announcement={ariaAnnouncement} />

      {/* 1. Fullscreen Map Radar Canvas with Click-to-Pin */}
      <MapRadarCanvas
        userLocation={userLocation}
        hazards={filteredHazards}
        selectedHazardId={selectedHazardId}
        onSelectHazard={(id) => setSelectedHazardId(id)}
        recenterCount={recenterCount}
        radiusFilter={radiusFilter}
        activeFilter={activeFilter}
        tempPinLocation={customReportCoords}
        onMapClick={handleMapClick}
      />

      {/* 2. Single Unified Minimal Header Bar */}
      <TopHUD
        hazardCount={filteredHazards.length}
        radiusFilter={radiusFilter}
        activeFilter={activeFilter}
        onSelectFilter={(cat) => setActiveFilter(cat)}
        isOnline={isOnline}
        pendingCount={pendingCount}
        isSyncing={isSyncing}
        onOpenFilter={() => setIsFilterOpen(true)}
        onOpenSync={() => setIsSyncModalOpen(true)}
        onOpenAbout={() => setIsAboutModalOpen(true)}
      />

      {/* 3. Minimal Corner Recenter Control */}
      <ActionHUD
        onRecenter={() => {
          recenter();
          notifyUser('Recentering radar.');
        }}
        isTracking={isTracking}
      />

      {/* 4. Modals & Bottom Sheets */}
      {/* Report Modal */}
      <ReportBottomSheet
        isOpen={isReportOpen}
        onClose={handleCloseReport}
        targetCoords={activeTargetCoords}
        isCustomLocation={customReportCoords !== null}
        onSubmit={handleReportSubmit}
        checkNearbyDuplicate={checkNearbyDuplicate}
        onSelectExisting={(id) => {
          setSelectedHazardId(id);
          setIsReportOpen(false);
          setCustomReportCoords(null);
        }}
      />

      {/* Hazard Detail Sheet */}
      <HazardDetailBottomSheet
        hazard={selectedHazard}
        userLocation={userLocation}
        onClose={() => setSelectedHazardId(null)}
        onUpvote={upvoteHazard}
        onResolve={resolveHazard}
        onShowToast={notifyUser}
      />

      {/* Filter & Radius Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        radiusFilter={radiusFilter}
        onChangeRadius={(r) => setRadiusFilter(r)}
        activeFilter={activeFilter}
        onChangeCategory={(c) => setActiveFilter(c)}
      />

      {/* Offline Sync Status Modal */}
      <SyncStatusModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        isOnline={isOnline}
        isSyncing={isSyncing}
        onTriggerSync={syncPendingItems}
        onShowToast={notifyUser}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      {/* Toast Alert */}
      <ToastNotification
        message={toastMessage}
        onDismiss={() => setToastMessage(null)}
      />
    </main>
  );
}
