import { useState, useCallback, useEffect, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import { useGeolocation } from './hooks/useGeolocation';
import { useSyncManager } from './hooks/useSyncManager';
import { useHazardManager } from './hooks/useHazardManager';
import { MapRadarCanvas } from './components/map/MapRadarCanvas';
import { TopHUD } from './components/hud/TopHUD';
import { ActionHUD } from './components/hud/ActionHUD';
import { SearchModal } from './components/modals/SearchModal';
import { ReportBottomSheet } from './components/modals/ReportBottomSheet';
import { HazardDetailBottomSheet } from './components/modals/HazardDetailBottomSheet';
import { FilterDrawer } from './components/modals/FilterDrawer';
import { SyncStatusModal } from './components/modals/SyncStatusModal';
import { AboutModal } from './components/modals/AboutModal';
import { ScreenReaderAnnouncer } from './components/ui/ScreenReaderAnnouncer';
import { HazardPayload, Coordinates } from './types/hazard';
import { GeocodedLocation } from './services/geocoding.service';

export default function App() {
  // 1. Geolocation Tracking
  const {
    location: userLocation,
    isTracking,
    recenterCount,
    recenter,
  } = useGeolocation();

  // 2. Announcements & Sonner Toast Bridge
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string | null>(null);

  const notifyUser = useCallback((msg: string, type: 'default' | 'success' | 'info' | 'warning' = 'default') => {
    setAriaAnnouncement(msg);
    if (type === 'success') {
      toast.success(msg);
    } else if (type === 'warning') {
      toast.warning(msg);
    } else {
      toast(msg);
    }
  }, []);

  // 3. Offline Sync Engine
  const refreshHazardsRef = useRef<() => void>(() => {});

  const handleSyncComplete = useCallback(
    (count: number) => {
      notifyUser(`Uploaded ${count} offline ${count === 1 ? 'trace' : 'traces'} to cloud!`, 'success');
      refreshHazardsRef.current();
    },
    [notifyUser]
  );

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
    refreshHazards,
  } = useHazardManager(userLocation, isOnline, refreshPendingCount);

  useEffect(() => {
    refreshHazardsRef.current = refreshHazards;
  }, [refreshHazards]);

  // 5. Dynamic Real-time Zoom Scope Tracking
  const [visibleScopeMeters, setVisibleScopeMeters] = useState<number>(5000);

  // 6. Search Target Fly-to State
  const [searchTarget, setSearchTarget] = useState<{ lat: number; lng: number; count: number } | null>(null);

  // 7. Custom Click-to-Pin & Modal States
  const [customReportCoords, setCustomReportCoords] = useState<Coordinates | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);

  // Global Keyboard Shortcut: Ctrl+K or Cmd+K to open Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle clicking anywhere on the map to drop a pin
  const handleMapClick = useCallback((lat: number, lng: number) => {
    setSelectedHazardId(null);
    setCustomReportCoords({ lat, lng });
    setIsReportOpen(true);
    notifyUser('Pinned location on radar.');
  }, [setSelectedHazardId, notifyUser]);

  // Handle selecting a searched Philippine location
  const handleSelectLocation = useCallback((loc: GeocodedLocation) => {
    setCustomReportCoords(null);
    setSelectedHazardId(null);
    setSearchTarget((prev) => ({
      lat: loc.lat,
      lng: loc.lng,
      count: (prev?.count || 0) + 1,
    }));
    notifyUser(`Radar focused on ${loc.name}`, 'success');
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
      notifyUser('Saved offline in IndexedDB.', 'info');
    } else {
      notifyUser('Hazard trace live on radar!', 'success');
    }
  };

  const activeTargetCoords: Coordinates = customReportCoords || {
    lat: userLocation.lat,
    lng: userLocation.lng,
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black text-white font-sans select-none">
      {/* Screen Reader ARIA Live Region */}
      <ScreenReaderAnnouncer announcement={ariaAnnouncement} />

      {/* 1. Fullscreen Map Radar Canvas with Dynamic Zoom-Scope Tracking */}
      <MapRadarCanvas
        userLocation={userLocation}
        hazards={filteredHazards}
        selectedHazardId={selectedHazardId}
        onSelectHazard={(id) => setSelectedHazardId(id)}
        recenterCount={recenterCount}
        radiusFilter={radiusFilter}
        activeFilter={activeFilter}
        tempPinLocation={customReportCoords}
        searchTarget={searchTarget}
        onMapClick={handleMapClick}
        onViewportScopeChange={setVisibleScopeMeters}
      />

      {/* 2. Dynamic Island TopHUD with Rolling Odometer Zoom Scope & Search */}
      <TopHUD
        hazardCount={filteredHazards.length}
        radiusFilter={radiusFilter}
        visibleScopeMeters={visibleScopeMeters}
        activeFilter={activeFilter}
        onSelectFilter={(cat) => setActiveFilter(cat)}
        isOnline={isOnline}
        pendingCount={pendingCount}
        isSyncing={isSyncing}
        onOpenFilter={() => setIsFilterOpen(true)}
        onOpenSync={() => setIsSyncModalOpen(true)}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* 3. Minimal Corner Recenter Control */}
      <ActionHUD
        onRecenter={() => {
          recenter();
          notifyUser('Recentering radar.');
        }}
        isTracking={isTracking}
      />

      {/* 4. Modals, Drawers & Command Palettes */}
      {/* Street & Landmark Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        userLocation={userLocation}
        onSelectLocation={handleSelectLocation}
      />

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

      {/* 5. Sonner 3D Stacking Glass Toast Engine */}
      <Toaster
        position="top-center"
        theme="dark"
        toastOptions={{
          className:
            '!bg-black/90 !text-white !border !border-white/15 !shadow-[0_16px_36px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.15)] !backdrop-blur-2xl !rounded-2xl !font-sans !text-xs !py-3 !px-4',
        }}
        offset={70}
        duration={3500}
      />
    </main>
  );
}
