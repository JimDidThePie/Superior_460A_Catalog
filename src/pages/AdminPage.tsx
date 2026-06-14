import { ArrowDown, ArrowUp, Download, Edit, Eye, EyeOff, LogOut, Monitor, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DisplayNodeManager } from "../components/DisplayNodeManager";
import { DisplaySettings } from "../components/DisplaySettings";
import { ProductForm } from "../components/ProductForm";
import { useDisplayNodes } from "../hooks/useDisplayNodes";
import { useDisplaySettings } from "../hooks/useDisplaySettings";
import { useProducts } from "../hooks/useProducts";
import { getAdminAuthState, logoutAdmin, subscribeAdminAuth } from "../lib/authService";
import type { Product, ProductInput } from "../types/product";
import { downloadCsv } from "../utils/csv";

function AdminDashboard() {
  const { products, loading, error, upsertProduct, removeProduct, moveProduct } = useProducts();
  const {
    nodes,
    loading: nodesLoading,
    error: nodesError,
    upsertNode,
    removeNode,
    duplicateNode,
    moveNode,
  } = useDisplayNodes();
  const { settings, updateSettings, error: settingsError } = useDisplaySettings();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaveStatus, setSettingsSaveStatus] = useState("Settings save automatically.");
  const settingsSaveVersionRef = useRef(0);

  const safeProducts = Array.isArray(products) ? products : [];
  const sortedProducts = useMemo(
    () => [...safeProducts].sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0)),
    [safeProducts],
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return sortedProducts;
    }

    return sortedProducts.filter((product) =>
      [product.name, product.category, product.description, product.price].some((value) =>
        String(value || "").toLowerCase().includes(query),
      ),
    );
  }, [search, sortedProducts]);

  const handleSaveProduct = async (product: Product | ProductInput) => {
    await upsertProduct(product);
    setEditingProduct(null);
  };

  const handleToggleHidden = async (product: Product) => {
    try {
      await upsertProduct({ ...product, hidden: !product.hidden });
    } catch {
      // useProducts surfaces the message in the product panel.
    }
  };

  const handleSettingsChange = async (partialSettings: Parameters<typeof updateSettings>[0]) => {
    const saveVersion = settingsSaveVersionRef.current + 1;

    settingsSaveVersionRef.current = saveVersion;
    setSavingSettings(true);
    setSettingsSaveStatus("Saving...");
    console.log("[showroom-settings] admin settings save requested", {
      changedKeys: Object.keys(partialSettings),
      saveVersion,
    });

    try {
      await updateSettings(partialSettings);
      if (saveVersion === settingsSaveVersionRef.current) {
        setSettingsSaveStatus("Settings saved");
        console.log("[showroom-settings] admin settings save succeeded", { saveVersion });
      }
    } catch (settingsSaveError) {
      if (saveVersion === settingsSaveVersionRef.current) {
        const message = (settingsSaveError as Error).message || settingsError || "Settings action failed.";
        setSettingsSaveStatus(`Save failed: ${message}`);
        console.log("[showroom-settings] admin settings save failed", { saveVersion, message });
      }
    } finally {
      if (saveVersion === settingsSaveVersionRef.current) {
        setSavingSettings(false);
      }
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    window.location.href = "/login";
  };

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p>Showroom catalog</p>
          <h1>Admin Dashboard</h1>
        </div>
        <nav>
          <a href="/display">
            <Monitor aria-hidden="true" />
            Display
          </a>
          <button type="button" onClick={handleLogout}>
            <LogOut aria-hidden="true" />
            Log out
          </button>
        </nav>
      </header>

      <section className="admin-layout">
        <div className="admin-left">
          <ProductForm product={editingProduct} onSave={handleSaveProduct} onCancel={() => setEditingProduct(null)} />
          <DisplaySettings
            settings={settings}
            onChange={(partialSettings) => void handleSettingsChange(partialSettings)}
            saving={savingSettings}
            saveStatus={settingsSaveStatus}
            error={settingsError}
          />
        </div>

        <div className="admin-right">
          <DisplayNodeManager
            nodes={nodes}
            loading={nodesLoading}
            error={nodesError}
            onSave={upsertNode}
            onDelete={removeNode}
            onDuplicate={duplicateNode}
            onMove={moveNode}
          />

          <section className="admin-panel product-manager">
            <div className="panel-heading">
              <div>
                <p>{safeProducts.length} products</p>
                <h2>Legacy Products</h2>
              </div>
              <button type="button" onClick={() => downloadCsv(safeProducts)}>
                <Download aria-hidden="true" />
                CSV
              </button>
            </div>

            <input
              className="search-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products"
            />

            {loading ? <p className="save-status">Loading products...</p> : null}
            {error ? <p className="form-error">{error}</p> : null}

            <div className="product-table">
              {filteredProducts.map((product) => {
                const globalIndex = sortedProducts.findIndex((item) => item.id === product.id);

                return (
                  <article key={product.id} className={product.hidden ? "is-hidden" : ""}>
                    <div>
                      <strong>{product.name}</strong>
                      <span>
                        {product.category || "Uncategorized"} · {product.price || "No price"}
                      </span>
                    </div>

                    <div className="row-actions">
                      <button
                        type="button"
                        title="Move product up"
                        aria-label={`Move ${product.name || "product"} up`}
                        onClick={() => void moveProduct(product.id, "up").catch(() => undefined)}
                        disabled={globalIndex <= 0}
                      >
                        <ArrowUp aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        title="Move product down"
                        aria-label={`Move ${product.name || "product"} down`}
                        onClick={() => void moveProduct(product.id, "down").catch(() => undefined)}
                        disabled={globalIndex < 0 || globalIndex >= sortedProducts.length - 1}
                      >
                        <ArrowDown aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        title={product.hidden ? "Show product" : "Hide product"}
                        aria-label={`${product.hidden ? "Show" : "Hide"} ${product.name || "product"}`}
                        onClick={() => void handleToggleHidden(product)}
                      >
                        {product.hidden ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
                      </button>
                      <button
                        type="button"
                        title="Edit product"
                        aria-label={`Edit ${product.name || "product"}`}
                        onClick={() => setEditingProduct(product)}
                      >
                        <Edit aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="danger"
                        title="Delete product"
                        aria-label={`Delete ${product.name || "product"}`}
                        onClick={() => {
                          if (window.confirm(`Delete ${product.name || "this product"}?`)) {
                            void removeProduct(product.id).catch(() => undefined);
                          }
                        }}
                      >
                        <Trash2 aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export function AdminPage() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let mounted = true;

    getAdminAuthState()
      .then((authState) => {
        if (!mounted) {
          return;
        }

        if (!authState.configured) {
          setAuthError("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
          setAuthenticated(false);
          return;
        }

        setAuthenticated(Boolean(authState.session && authState.user));
      })
      .catch((error) => {
        if (mounted) {
          setAuthError((error as Error).message || "Unable to verify admin login.");
          setAuthenticated(false);
        }
      })
      .finally(() => {
        if (mounted) {
          setCheckingAuth(false);
        }
      });

    const unsubscribe = subscribeAdminAuth((authState) => {
      if (!mounted) {
        return;
      }

      setAuthenticated(Boolean(authState.session && authState.user));
      setCheckingAuth(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!checkingAuth && !authenticated && !authError) {
      window.location.href = "/login";
    }
  }, [authError, authenticated, checkingAuth]);

  if (checkingAuth) {
    return (
      <main className="login-shell">
        <section className="login-panel">
          <h1>Checking Admin Login</h1>
          <p className="save-status">Verifying your Supabase session...</p>
        </section>
      </main>
    );
  }

  if (authError) {
    return (
      <main className="login-shell">
        <section className="login-panel">
          <h1>Admin Login Unavailable</h1>
          <p className="form-error">{authError}</p>
          <a href="/display">Back to display</a>
        </section>
      </main>
    );
  }

  if (!authenticated) {
    return null;
  }

  return <AdminDashboard />;
}
