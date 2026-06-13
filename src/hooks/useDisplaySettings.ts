import { useCallback, useEffect, useRef, useState } from "react";
import { getShowroomSettings, normalizeSettings, saveShowroomSettings, subscribeShowroomSettings } from "../lib/settingsService";
import { DEFAULT_SHOWROOM_SETTINGS, type ShowroomSettings } from "../types/settings";

const getSettingsActionError = (error: unknown) => {
  const message = (error as Error).message || "Settings action failed.";

  if (message.toLowerCase().includes("row-level security")) {
    return "Supabase blocked this settings change with row-level security. Run supabase/fix_admin_writes.sql in the Supabase SQL Editor, then try again.";
  }

  return message;
};

export function useDisplaySettings() {
  const [settings, setSettings] = useState<ShowroomSettings>(DEFAULT_SHOWROOM_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const settingsRef = useRef<ShowroomSettings>(DEFAULT_SHOWROOM_SETTINGS);
  const saveQueueRef = useRef<Promise<unknown>>(Promise.resolve());
  const latestSaveVersionRef = useRef(0);
  const pendingSaveCountRef = useRef(0);
  const localChangeVersionRef = useRef(0);

  const commitSettings = useCallback((nextSettings: ShowroomSettings) => {
    settingsRef.current = nextSettings;
    setSettings(nextSettings);
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadStartedAtChangeVersion = localChangeVersionRef.current;

    getShowroomSettings()
      .then((loadedSettings) => {
        if (localChangeVersionRef.current !== loadStartedAtChangeVersion) {
          console.log("[showroom-settings] settings load ignored because local edits happened after load started", {
            loadStartedAtChangeVersion,
            currentChangeVersion: localChangeVersionRef.current,
          });
          return;
        }

        if (mounted) {
          console.log("[showroom-settings] settings load applied to React state", loadedSettings);
          commitSettings(loadedSettings);
          setError("");
        }
      })
      .catch((settingsError: Error) => {
        if (mounted) {
          setError(getSettingsActionError(settingsError));
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    const unsubscribe = subscribeShowroomSettings((nextSettings) => {
      if (pendingSaveCountRef.current > 0) {
        console.log("[showroom-settings] realtime update ignored while local settings save is pending", {
          pendingSaves: pendingSaveCountRef.current,
        });
        return;
      }

      console.log("[showroom-settings] realtime settings applied to React state", nextSettings);
      commitSettings(nextSettings);
      setError("");
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [commitSettings]);

  const updateSettings = useCallback(async (partialSettings: Partial<ShowroomSettings>) => {
    const nextSettings = normalizeSettings({
      ...settingsRef.current,
      ...partialSettings,
      labels: partialSettings.labels
        ? {
            ...settingsRef.current.labels,
            ...partialSettings.labels,
          }
        : settingsRef.current.labels,
    });
    const saveVersion = latestSaveVersionRef.current + 1;

    latestSaveVersionRef.current = saveVersion;
    localChangeVersionRef.current += 1;
    pendingSaveCountRef.current += 1;
    console.log("[showroom-settings] setting changed", {
      changedKeys: Object.keys(partialSettings),
      saveVersion,
      nextSettings,
    });
    commitSettings(nextSettings);

    const saveTask = saveQueueRef.current
      .catch(() => undefined)
      .then(async () => {
        console.log("[showroom-settings] queued settings save starts", { saveVersion });
        const savedSettings = await saveShowroomSettings(nextSettings);

        if (saveVersion === latestSaveVersionRef.current) {
          console.log("[showroom-settings] latest settings save applied to React state", { saveVersion });
          commitSettings(savedSettings);
        } else {
          console.log("[showroom-settings] older settings save finished without overwriting newer state", {
            saveVersion,
            latestSaveVersion: latestSaveVersionRef.current,
          });
        }

        return savedSettings;
      });

    saveQueueRef.current = saveTask.then(
      () => undefined,
      () => undefined,
    );

    try {
      const savedSettings = await saveTask;
      setError("");
      return savedSettings;
    } catch (settingsError) {
      console.log("[showroom-settings] settings save failed in React hook", settingsError);
      setError(getSettingsActionError(settingsError));
      throw settingsError;
    } finally {
      pendingSaveCountRef.current = Math.max(pendingSaveCountRef.current - 1, 0);
    }
  }, [commitSettings]);

  return {
    settings,
    loading,
    error,
    updateSettings,
  };
}
