"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Label } from "@/components/ui/Label";

type Note = {
  name: string;
  family?: string;
  ml?: number;
};

type SizeDetail = {
  target_ml: number;
  formula_type: string;
  top_notes: Note[];
  heart_notes: Note[];
  base_notes: Note[];
};

type Formula = {
  id: number;
  reference: string;
  session_id: string;
  profile: string;
  formula_type: string;
  top_notes: string[];
  heart_notes: string[];
  base_notes: string[];
  sizes: Record<string, SizeDetail>;
  customer_name: string | null;
  customer_email: string | null;
  language: string | null;
  created_at: string | null;
};

function getBackendBaseUrl() {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  return base ? base.replace(/\/+$/, "") : "";
}

async function apiFetch(path: string, init?: RequestInit, timeoutMs = 20000) {
  const base = getBackendBaseUrl();
  const url = `${base}${path.startsWith("/") ? "" : "/"}${path}`;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) {
      let details = "";
      try { details = await res.text(); } catch { /* ignore */ }
      throw new Error(`HTTP ${res.status} ${res.statusText}${details ? ` — ${details}` : ""}`);
    }
    return (await res.json()) as unknown;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("La requete a expire. Le serveur mail ne repond pas a temps.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

const FORMULA_TYPE_LABELS: Record<string, string> = {
  frais: "Frais",
  mix: "Mix",
  puissant: "Puissant",
};

const FORMULA_TYPE_COLORS: Record<string, string> = {
  frais: "bg-blue-50 text-blue-700 border-blue-200",
  mix: "bg-purple-50 text-purple-700 border-purple-200",
  puissant: "bg-amber-50 text-amber-700 border-amber-200",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function Badge({ type }: { type: string }) {
  const color = FORMULA_TYPE_COLORS[type] ?? "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold ${color}`}>
      {FORMULA_TYPE_LABELS[type] ?? type}
    </span>
  );
}

function NoteGroup({ label, notes }: { label: string; notes: Note[] }) {
  if (!notes?.length) return null;
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-dark/50">{label}</p>
      <div className="flex flex-wrap gap-2">
        {notes.map((n, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-custom border border-[#e5e5e3] bg-light/60 px-2.5 py-1 text-sm text-dark"
          >
            {n.name}
            {n.ml != null && (
              <span className="text-xs text-dark/40">{n.ml} ml</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function FormulesPage() {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Formula | null>(null);
  const [selectedSize, setSelectedSize] = useState("30ml");
  const [emailInput, setEmailInput] = useState("");
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchFormulas = useCallback(async (q: string) => {
    setError(null);
    setIsBusy(true);
    try {
      const params = new URLSearchParams({ search: q, limit: "50" });
      const data = await apiFetch(`/api/formulas?${params.toString()}`);
      const payload = data as { results: Formula[]; total: number };
      setFormulas(payload.results ?? []);
      setTotal(payload.total ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setIsBusy(false);
    }
  }, []);

  useEffect(() => {
    void fetchFormulas("");
  }, [fetchFormulas]);

  function handleSearch(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void fetchFormulas(value.trim());
    }, 300);
  }

  function openDetail(f: Formula) {
    setSelected(f);
    const sizes = Object.keys(f.sizes ?? {});
    setSelectedSize(sizes.includes("30ml") ? "30ml" : sizes[0] ?? "30ml");
  }

  useEffect(() => {
    setEmailInput(selected?.customer_email ?? "");
    setEmailStatus(null);
    setEmailError(null);
    setIsSendingEmail(false);
  }, [selected]);

  async function sendSelectedFormulaEmail() {
    if (!selected) return;

    const trimmedEmail = emailInput.trim();
    const payload = trimmedEmail ? { email: trimmedEmail } : {};

    setEmailStatus(null);
    setEmailError(null);
    setIsSendingEmail(true);
    try {
      const data = await apiFetch(
        `/api/formulas/${encodeURIComponent(selected.reference)}/send-mail`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        20000,
      );
      const response = data as { email?: string };
      const effectiveEmail = response.email ?? trimmedEmail ?? selected.customer_email ?? "";

      setSelected((current) =>
        current
          ? {
              ...current,
              customer_email: effectiveEmail || current.customer_email,
            }
          : current,
      );
      setFormulas((current) =>
        current.map((formula) =>
          formula.reference === selected.reference
            ? { ...formula, customer_email: effectiveEmail || formula.customer_email }
            : formula,
        ),
      );
      setEmailInput(effectiveEmail);
      setEmailStatus(`Email envoye a ${effectiveEmail}.`);
    } catch (e) {
      setEmailError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setIsSendingEmail(false);
    }
  }

  const sizeDetail = useMemo(() => {
    if (!selected?.sizes) return null;
    return selected.sizes[selectedSize] ?? null;
  }, [selected, selectedSize]);

  const resolvedEmail = emailInput.trim() || selected?.customer_email?.trim() || "";
  const needsEmail = !resolvedEmail;

  return (
    <div className="space-y-6">
      <div className="rounded-custom border border-[#e5e5e3] bg-card-bg p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-dark">Formules générées</h2>
          <p className="mt-1 text-sm text-dark/60">
            Recherche par référence (ex : lylo-27042026-001) ou par email client.
          </p>
        </div>
        {error && (
          <div className="mt-4 rounded-custom border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-custom border border-[#e5e5e3] bg-card-bg shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#e5e5e3] bg-light/20 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm font-semibold text-dark">
            {isBusy ? "Chargement…" : (
              <>Liste des formules <span className="text-dark/50">({total})</span></>
            )}
          </div>
          <div className="w-full md:w-96">
            <Input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Référence ou email…"
              aria-label="Rechercher une formule"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#e5e5e3]">
            <thead className="bg-light/40">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dark/60">Référence</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dark/60">Client</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dark/60">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dark/60">Profil</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dark/60">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dark/60">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5e3]">
              {formulas.map((f) => (
                <tr
                  key={f.id}
                  className="cursor-pointer transition-colors hover:bg-light/50"
                  onClick={() => openDetail(f)}
                >
                  <td className="px-6 py-4 font-mono text-sm font-semibold text-dark">
                    {f.reference}
                  </td>
                  <td className="px-6 py-4 text-sm text-dark/80">
                    {f.customer_name ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-dark/60">
                    {f.customer_email ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-dark/80">{f.profile ?? "—"}</td>
                  <td className="px-6 py-4">
                    {f.formula_type ? <Badge type={f.formula_type} /> : "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-dark/60">{formatDate(f.created_at)}</td>
                </tr>
              ))}
              {!isBusy && formulas.length === 0 && (
                <tr>
                  <td className="px-6 py-10 text-center text-sm text-dark/60" colSpan={6}>
                    Aucune formule ne correspond à ta recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={!!selected}
        title={selected ? `Formule ${selected.reference}` : ""}
        onClose={() => setSelected(null)}
        maxWidthClassName="max-w-2xl"
        footer={
          <>
            <Button type="button" onClick={() => setSelected(null)}>
              Fermer
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => void sendSelectedFormulaEmail()}
              disabled={isSendingEmail || (needsEmail && !emailInput.trim())}
            >
              {isSendingEmail ? "Envoi..." : "Envoyer par email"}
            </Button>
          </>
        }
      >
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
              <div>
                <p className="text-xs text-dark/50">Client</p>
                <p className="font-medium text-dark">{selected.customer_name ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-dark/50">Email</p>
                <p className="font-medium text-dark">{selected.customer_email ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-dark/50">Profil</p>
                <p className="font-medium text-dark">{selected.profile ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-dark/50">Type</p>
                <div className="mt-0.5">{selected.formula_type ? <Badge type={selected.formula_type} /> : "—"}</div>
              </div>
              <div>
                <p className="text-xs text-dark/50">Langue</p>
                <p className="font-medium text-dark uppercase">{selected.language ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-dark/50">Date</p>
                <p className="font-medium text-dark">{formatDate(selected.created_at)}</p>
              </div>
            </div>

            <div className="rounded-custom border border-[#e5e5e3] bg-light/30 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-end">
                <div className="flex-1">
                  <Label htmlFor="formula-email">Email d&apos;envoi</Label>
                  <Input
                    id="formula-email"
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="client@example.com"
                  />
                </div>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => void sendSelectedFormulaEmail()}
                  disabled={isSendingEmail || (needsEmail && !emailInput.trim())}
                  className="md:min-w-44"
                >
                  {isSendingEmail ? "Envoi..." : "Envoyer par email"}
                </Button>
              </div>
              <p className="mt-2 text-xs text-dark/55">
                {selected.customer_email
                  ? "L'adresse enregistree est preremplie. Tu peux la modifier avant l'envoi."
                  : "Aucune adresse enregistree pour cette formule. Renseigne un email pour envoyer la formule."}
              </p>
              {emailStatus && (
                <div className="mt-3 rounded-custom border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                  {emailStatus}
                </div>
              )}
              {emailError && (
                <div className="mt-3 rounded-custom border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  {emailError}
                </div>
              )}
            </div>

            {selected.sizes && Object.keys(selected.sizes).length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-dark/50">Taille</p>
                <div className="flex gap-2">
                  {Object.keys(selected.sizes).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-custom border px-3 py-1.5 text-sm font-semibold transition-colors ${
                        selectedSize === size
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-[#e5e5e3] bg-light text-dark/70 hover:bg-light/60"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sizeDetail && (
              <div className="space-y-4 rounded-custom border border-[#e5e5e3] bg-light/40 p-4">
                <NoteGroup label="Notes de tête" notes={sizeDetail.top_notes} />
                <NoteGroup label="Notes de cœur" notes={sizeDetail.heart_notes} />
                <NoteGroup label="Notes de fond" notes={sizeDetail.base_notes} />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
