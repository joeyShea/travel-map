"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { CircleUser, MapPin, Search } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import FullScreenReview from "@/components/full-screen-review";
import SearchSidebarPanel from "@/components/search-sidebar-panel";
import SidebarPanel from "@/components/sidebar-panel";
import StudentAddMenu from "@/components/student-add-menu";
import UserProfileModal, { type UserProfile } from "@/components/user-profile-modal";
import { deleteTrip, getTrip, getTrips, getUserProfile } from "@/lib/api-client";
import type { UserProfileResponse } from "@/lib/api-types";
import type { MapActivity, MapTrip, ModalProfile } from "@/lib/trip-models";
import { toMapTrip, toModalProfile } from "@/lib/trip-models";

const MapView = dynamic(() => import("@/components/map-view"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-background">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  ),
});

interface ProfileState {
  profile: UserProfile;
  expandFrom: "top-right" | "left";
  canManageTrips: boolean;
}

const REVIEW_PANEL_WIDTH = "min(420px, 100vw)";

function toUserProfile(profile: ModalProfile): UserProfile {
  return {
    userId: profile.userId,
    name: profile.name,
    initials: profile.initials,
    email: profile.email,
    university: profile.university,
    bio: profile.bio,
    trips: profile.trips,
  };
}

function toUserProfileFromApi(profileResponse: UserProfileResponse): UserProfile {
  return toUserProfile(toModalProfile(profileResponse));
}

export default function TravelMap() {
  const router = useRouter();
  const pathname = usePathname();
  const { userId, isStudent, myProfile, refreshMyProfile } = useAuth();

  const [trips, setTrips] = useState<MapTrip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<MapTrip | null>(null);
  const [fullScreenTrip, setFullScreenTrip] = useState<MapTrip | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<MapActivity | null>(null);
  const [profileState, setProfileState] = useState<ProfileState | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);

  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const [isLoadingTripById, setIsLoadingTripById] = useState(false);
  const [deletingTripId, setDeletingTripId] = useState<number | null>(null);
  const [profileCacheByUser, setProfileCacheByUser] = useState<Record<number, UserProfile>>({});

  const tripLookup = useMemo(() => {
    return new Map(trips.map((trip) => [trip.id, trip]));
  }, [trips]);

  const upsertTrip = useCallback((trip: MapTrip) => {
    setTrips((current) => {
      const index = current.findIndex((item) => item.id === trip.id);
      if (index === -1) {
        return [trip, ...current];
      }

      const next = [...current];
      next[index] = trip;
      return next;
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadTrips() {
      try {
        const apiTrips = await getTrips();
        if (!isMounted) {
          return;
        }

        setTrips(apiTrips.map(toMapTrip).filter((trip): trip is MapTrip => Boolean(trip)));
      } catch {
        if (isMounted) {
          setTrips([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingTrips(false);
        }
      }
    }

    void loadTrips();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!myProfile?.user?.user_id) {
      return;
    }

    const cached = toUserProfileFromApi(myProfile);
    setProfileCacheByUser((current) => ({ ...current, [cached.userId]: cached }));
  }, [myProfile]);

  const openTripById = useCallback(
    async (tripId: number | null) => {
      if (tripId === null) {
        setSelectedTrip(null);
        setFullScreenTrip(null);
        setSelectedActivity(null);
        return;
      }

      const cached = tripLookup.get(tripId);
      if (cached) {
        setSelectedTrip(cached);
      }

      setIsLoadingTripById(true);
      try {
        const apiTrip = await getTrip(tripId);
        const mappedTrip = toMapTrip(apiTrip);
        if (!mappedTrip) {
          return;
        }

        upsertTrip(mappedTrip);
        setSelectedTrip(mappedTrip);
        setFullScreenTrip(null);
        setSelectedActivity(null);
        setSearchPanelOpen(false);
        setSearchQuery("");
      } catch {
        // If trip fetch fails, keep any cached view state.
      } finally {
        setIsLoadingTripById(false);
      }
    },
    [tripLookup, upsertTrip],
  );

  const handleViewFull = useCallback((trip: MapTrip) => {
    setFullScreenTrip(trip);
    setSelectedTrip(null);
    setSelectedActivity(null);
    setSearchPanelOpen(false);
    setSearchQuery("");
  }, []);

  const handleBack = useCallback(() => {
    setSelectedTrip(fullScreenTrip);
    setFullScreenTrip(null);
    setSelectedActivity(null);
  }, [fullScreenTrip]);

  const handleSelectActivity = useCallback((activity: MapActivity | null) => {
    setSelectedActivity(activity);
  }, []);

  const openProfile = useCallback(
    async (targetUserId: number, expandFrom: "top-right" | "left") => {
      const canManageTrips = userId !== null && targetUserId === userId;

      if (userId !== null && targetUserId === userId && myProfile) {
        setProfileState({
          profile: toUserProfileFromApi(myProfile),
          expandFrom,
          canManageTrips,
        });
      }

      const cachedProfile = profileCacheByUser[targetUserId];
      if (cachedProfile) {
        setProfileState({
          profile: cachedProfile,
          expandFrom,
          canManageTrips,
        });
      }

      try {
        if (userId !== null && targetUserId === userId) {
          const refreshedOwnProfile = await refreshMyProfile(targetUserId);
          if (!refreshedOwnProfile) {
            return;
          }

          const mappedOwnProfile = toUserProfileFromApi(refreshedOwnProfile);
          setProfileCacheByUser((current) => ({ ...current, [mappedOwnProfile.userId]: mappedOwnProfile }));
          setProfileState({
            profile: mappedOwnProfile,
            expandFrom,
            canManageTrips,
          });
          return;
        }

        const profileResponse = await getUserProfile(targetUserId);
        const mappedProfile = toUserProfileFromApi(profileResponse);

        setProfileCacheByUser((current) => ({ ...current, [mappedProfile.userId]: mappedProfile }));
        setProfileState({
          profile: mappedProfile,
          expandFrom,
          canManageTrips,
        });
      } catch {
        // Ignore profile lookup failures for now.
      }
    },
    [myProfile, profileCacheByUser, refreshMyProfile, userId],
  );

  const handleDeleteTrip = useCallback(
    async (tripId: number) => {
      if (userId === null) {
        return;
      }

      setDeletingTripId(tripId);
      try {
        await deleteTrip(tripId);

        setTrips((current) => current.filter((trip) => trip.id !== tripId));
        setSelectedTrip((current) => (current?.id === tripId ? null : current));
        setFullScreenTrip((current) => (current?.id === tripId ? null : current));
        setSelectedActivity(null);

        setProfileState((current) => {
          if (!current || current.profile.userId !== userId) {
            return current;
          }

          return {
            ...current,
            profile: {
              ...current.profile,
              trips: current.profile.trips.filter((trip) => trip.id !== tripId),
            },
          };
        });

        const refreshedOwnProfile = await refreshMyProfile(userId);
        if (refreshedOwnProfile) {
          const mappedOwnProfile = toUserProfileFromApi(refreshedOwnProfile);
          setProfileCacheByUser((current) => ({ ...current, [mappedOwnProfile.userId]: mappedOwnProfile }));
          setProfileState((current) => {
            if (!current || current.profile.userId !== mappedOwnProfile.userId) {
              return current;
            }

            return {
              ...current,
              profile: mappedOwnProfile,
            };
          });
        }
      } catch {
        // Ignore delete failures for now.
      } finally {
        setDeletingTripId(null);
      }
    },
    [refreshMyProfile, userId],
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);

    if (value.trim()) {
      setSearchPanelOpen(true);
      setSelectedTrip(null);
      setFullScreenTrip(null);
      setSelectedActivity(null);
    } else {
      setSearchPanelOpen(false);
    }
  }, []);

  const showSidebar = !!selectedTrip && !fullScreenTrip;
  const showFullScreen = !!fullScreenTrip;
  const showSearchPanel = searchPanelOpen && !showSidebar && !showFullScreen;
  const showSearchBar = showSearchPanel || (!showSidebar && !showFullScreen);
  const showAnyLeftSidebar = showSidebar || showFullScreen || showSearchPanel;

  const searchBarWidthClass = showSearchPanel
    ? "w-[min(320px,calc(100vw-7.5rem))]"
    : "w-[min(360px,calc(100vw-2rem))]";

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {showSearchBar && (
        <div className={`absolute left-4 top-3 z-[1000] ${searchBarWidthClass}`}>
          <div className="flex h-10 items-center gap-2 rounded-full border border-border bg-card/95 px-4 shadow-sm backdrop-blur-sm">
            <Search className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search trips, places, or keywords"
              className="h-full w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              aria-label="Search trips"
            />
          </div>
        </div>
      )}

      <div className="absolute right-4 top-4 z-[1000] flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-full border border-border bg-card/90 px-4 py-2 shadow-sm backdrop-blur-sm">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold tracking-tight text-foreground">Travel Map</span>
        </div>
        <button
          onClick={() => {
            if (userId !== null) {
              void openProfile(userId, "top-right");
            }
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-card"
          aria-label="Open profile"
        >
          <CircleUser className="h-5 w-5 text-foreground" />
        </button>
      </div>

      <div className="flex h-full w-full">
        <div
          className="h-full flex-shrink-0 overflow-hidden transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ width: showSidebar || showFullScreen || showSearchPanel ? REVIEW_PANEL_WIDTH : 0 }}
        >
          {showSidebar && selectedTrip && (
            <SidebarPanel
              review={selectedTrip}
              onClose={() => void openTripById(null)}
              onViewFull={handleViewFull}
              onOpenAuthorProfile={(profileUserId) => {
                void openProfile(profileUserId, "left");
              }}
            />
          )}
          {showFullScreen && fullScreenTrip && (
            <FullScreenReview
              review={fullScreenTrip}
              selectedActivity={selectedActivity}
              onBack={handleBack}
              onSelectActivity={handleSelectActivity}
              onOpenAuthorProfile={(profileUserId) => {
                void openProfile(profileUserId, "left");
              }}
            />
          )}
          {showSearchPanel && (
            <SearchSidebarPanel
              query={searchQuery}
              onClose={() => {
                setSearchPanelOpen(false);
                setSearchQuery("");
              }}
            />
          )}
        </div>

        <div className="h-full min-w-0 flex-1">
          <MapView
            trips={trips}
            selectedTrip={selectedTrip}
            fullScreenTrip={fullScreenTrip}
            selectedActivity={selectedActivity}
            onSelectTripById={(tripId) => {
              void openTripById(tripId);
            }}
            onSelectActivity={handleSelectActivity}
          />
        </div>
      </div>

      {profileState && (
        <UserProfileModal
          key={`${profileState.profile.userId}-${profileState.expandFrom}`}
          profile={profileState.profile}
          expandFrom={profileState.expandFrom}
          canManageTrips={profileState.canManageTrips}
          deletingTripId={deletingTripId}
          onDeleteTrip={(tripId) => {
            void handleDeleteTrip(tripId);
          }}
          onSelectTrip={(tripId) => {
            void openTripById(tripId);
          }}
          onClose={() => setProfileState(null)}
        />
      )}

      <StudentAddMenu
        visible={isStudent && !showAnyLeftSidebar}
        onAddTrip={() => {
          const returnTo = pathname || "/";
          router.push(`/trips?returnTo=${encodeURIComponent(returnTo)}`);
        }}
        onAddPopUp={() => {
          // Placeholder until pop-up feature is implemented.
        }}
      />

      {(isLoadingTrips || isLoadingTripById) && (
        <div className="pointer-events-none absolute bottom-4 right-4 z-[1000] rounded-full border border-border bg-card/95 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur-sm">
          Loading data...
        </div>
      )}
    </div>
  );
}
