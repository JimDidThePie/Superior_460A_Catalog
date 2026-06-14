import { Gauge, LayoutGrid, Menu, Pause, Play, Settings, X } from "lucide-react";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { DisplayMusicPlayer } from "../components/DisplayMusicPlayer";
import { DisplayNodeRenderer } from "../components/DisplayNodeRenderer";
import { useDisplayNodes } from "../hooks/useDisplayNodes";
import { useDisplaySettings } from "../hooks/useDisplaySettings";
import { useProducts } from "../hooks/useProducts";
import { businessCardToDisplayNode, productToDisplayNode } from "../lib/displayNodeService";

const ALL_CATEGORIES = "__all__";

export function DisplayPage() {
  const { nodes, loading: nodesLoading, error: nodesError } = useDisplayNodes();
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const { settings, updateSettings } = useDisplaySettings();
  const [paused, setPaused] = useState(false);
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [controlsOpen, setControlsOpen] = useState(false);

  const safeNodes = Array.isArray(nodes) ? nodes : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeBusinessCards = Array.isArray(settings.businessCards) ? settings.businessCards : [];

  const legacyNodes = useMemo(
    () => [
      ...safeBusinessCards.map((card, index) => businessCardToDisplayNode(card, index)),
      ...safeProducts.map((product, index) => productToDisplayNode(product, index)),
    ],
    [safeBusinessCards, safeProducts],
  );

  const displayNodes = useMemo(() => {
    const sourceNodes = safeNodes.length ? safeNodes : legacyNodes;

    return [...sourceNodes]
      .filter((node) => node && !node.hidden)
      .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));
  }, [legacyNodes, safeNodes]);

  const categories = useMemo(() => {
    const names = Array.from(new Set(displayNodes.map((node) => String(node.category || "").trim()).filter(Boolean)));
    return names;
  }, [displayNodes]);

  const filteredNodes = useMemo(() => {
    if (category === ALL_CATEGORIES) {
      return displayNodes;
    }

    return displayNodes.filter((node) => node.category === category);
  }, [category, displayNodes]);

  const scrollKey = useMemo(
    () => filteredNodes.map((node) => `${node.id}:${node.sortOrder}:${node.hidden}`).join("|"),
    [filteredNodes],
  );
  const showDrawerMusicPlayer = settings.musicEnabled;

  useEffect(() => {
    document.title = settings.pageTitle || "Showroom Products";
  }, [settings.pageTitle]);

  useEffect(() => {
    if (category !== ALL_CATEGORIES && !categories.includes(category)) {
      setCategory(ALL_CATEGORIES);
    }
  }, [categories, category]);

  useEffect(() => {
    if (!controlsOpen) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setControlsOpen(false), 20000);
    return () => window.clearTimeout(timeout);
  }, [
    category,
    controlsOpen,
    paused,
    settings.autoScrollEnabled,
    settings.autoScrollSpeed,
    settings.musicEnabled,
    settings.musicMode,
    settings.musicVolume,
  ]);

  useEffect(() => {
    if (paused || !settings.autoScrollEnabled || nodesLoading || filteredNodes.length === 0) {
      return undefined;
    }

    const scrollElement = document.scrollingElement as HTMLElement | null;

    if (!scrollElement) {
      return undefined;
    }

    let tickTimer = 0;
    let resetTimer = 0;
    let resumeTimer = 0;
    let resetting = false;
    let lastTime = performance.now();

    const resetDelay = Number.isFinite(Number(settings.autoScrollResetDelay))
      ? Math.max(Number(settings.autoScrollResetDelay), 0)
      : 1400;

    const tick = () => {
      const maxScroll = Math.max(scrollElement.scrollHeight - scrollElement.clientHeight, 0);

      if (maxScroll <= 4 || resetting) {
        return;
      }

      const time = performance.now();
      const elapsed = time - lastTime;
      lastTime = time;
      const autoScrollSpeed = Number.isFinite(Number(settings.autoScrollSpeed)) ? Number(settings.autoScrollSpeed) : 1;
      const pixelsPerSecond = 18 * Math.max(autoScrollSpeed, 0.1);

      scrollElement.scrollTop += (pixelsPerSecond * elapsed) / 1000;

      if (scrollElement.scrollTop >= maxScroll - 4) {
        resetting = true;
        resetTimer = window.setTimeout(() => {
          scrollElement.scrollTo({ top: 0, behavior: "smooth" });
          resumeTimer = window.setTimeout(() => {
            lastTime = performance.now();
            resetting = false;
          }, 700);
        }, resetDelay);
      }
    };

    tickTimer = window.setInterval(tick, 50);

    return () => {
      window.clearInterval(tickTimer);
      window.clearTimeout(resetTimer);
      window.clearTimeout(resumeTimer);
    };
  }, [
    filteredNodes.length,
    nodesLoading,
    paused,
    scrollKey,
    settings.autoScrollEnabled,
    settings.autoScrollResetDelay,
    settings.autoScrollSpeed,
  ]);

  const shellStyle = {
    "--display-page-bg": settings.pageBackgroundColor,
    "--display-header-bg": settings.headerBackgroundColor,
    "--display-card-bg": settings.cardBackgroundColor,
    "--display-page-bg-image": settings.pageBackgroundImageUrl ? `url("${settings.pageBackgroundImageUrl}")` : "none",
    "--display-header-bg-image": settings.headerBackgroundImageUrl ? `url("${settings.headerBackgroundImageUrl}")` : "none",
    "--display-card-bg-image": settings.cardBackgroundImageUrl ? `url("${settings.cardBackgroundImageUrl}")` : "none",
    "--display-text": settings.textColor,
    "--display-muted": settings.mutedTextColor,
    "--display-accent": settings.accentColor,
    "--display-border": settings.borderColor,
  } as CSSProperties;

  const loading = nodesLoading || (!safeNodes.length && productsLoading);
  const error = nodesError || productsError;
  const controlsPanelId = "display-controls-panel";

  return (
    <main className={`display-shell ${settings.displayTheme === "light" ? "display-light" : "display-dark"}`} style={shellStyle}>
      <button
        type="button"
        className="display-controls-trigger"
        aria-label={controlsOpen ? "Close display controls" : "Open display controls"}
        aria-expanded={controlsOpen}
        aria-controls={controlsPanelId}
        onClick={() => setControlsOpen((current) => !current)}
      >
        {controlsOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>

      {controlsOpen ? <button type="button" className="display-controls-backdrop" aria-label="Close display controls" onClick={() => setControlsOpen(false)} /> : null}

      <aside id={controlsPanelId} className={`display-control-drawer ${controlsOpen ? "is-open" : ""}`} aria-hidden={!controlsOpen}>
        <div className="display-control-drawer-heading">
          <div>
            <p>Showroom controls</p>
            <h2>Display Feed</h2>
          </div>
          <button type="button" aria-label="Close display controls" onClick={() => setControlsOpen(false)}>
            <X aria-hidden="true" />
          </button>
        </div>

        <div className="display-controls">
          <label>
            <LayoutGrid aria-hidden="true" />
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value={ALL_CATEGORIES}>{settings.labels.allCategories}</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            <Gauge aria-hidden="true" />
            <input
              className="display-speed-slider"
              type="range"
              min="0.25"
              max="6"
              step="0.25"
              value={settings.autoScrollSpeed}
              onChange={(event) => void updateSettings({ autoScrollSpeed: Number(event.target.value) })}
              aria-label="Auto-scroll speed"
            />
            <span>{Number(settings.autoScrollSpeed || 1).toFixed(2)}x</span>
          </label>

          <button type="button" onClick={() => setPaused((current) => !current)}>
            {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
            {paused ? settings.labels.resumeButton : settings.labels.pauseButton}
          </button>

          <a href="/admin">
            <Settings aria-hidden="true" />
            {settings.labels.adminLink}
          </a>
        </div>

        {showDrawerMusicPlayer ? <DisplayMusicPlayer settings={settings} placement="header" /> : null}
      </aside>

      <header className="display-header">
        <div className="brand-lockup">
          {settings.logoUrl ? (
            <img className="brand-logo" src={settings.logoUrl} alt={settings.pageTitle || settings.labels.headerLabel} />
          ) : (
            <span className="brand-mark">{settings.labels.brandMark}</span>
          )}
          <div>
            <p>{settings.labels.headerLabel}</p>
            <h1>{settings.pageTitle}</h1>
          </div>
        </div>

        <div className={`header-banner ${settings.bannerUrl ? "" : "header-banner-fallback"}`}>
          {settings.bannerUrl ? (
            <img src={settings.bannerUrl} alt="" />
          ) : (
            <div>
              <span>{settings.labels.brandMark}</span>
              <strong>Ask the Showroom Team</strong>
              <small>Equipment guidance, water-ready upgrades, and today&apos;s featured picks.</small>
            </div>
          )}
        </div>
      </header>

      {loading ? <div className="status-message">{settings.labels.loadingNodes}</div> : null}
      {error ? <div className="status-message error">{error}</div> : null}
      {!loading && filteredNodes.length === 0 ? <div className="status-message">{settings.labels.emptyNodes}</div> : null}

      <section className="display-list">
        {filteredNodes.map((node) => (
          <DisplayNodeRenderer key={node.id} node={node} settings={settings} />
        ))}
      </section>
    </main>
  );
}
