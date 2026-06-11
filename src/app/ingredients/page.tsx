"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";

type Ingredient = {
  id: number;
  name: string;
  type: "top" | "heart" | "base";
  category: string | null;
  language: string;
  description: string | null;
  intensity: string | null;
  allergens: string[] | null;
  is_active: boolean;
};

const TYPE_LABELS: Record<string, string> = {
  top: "Tête",
  heart: "Cœur",
  base: "Fond",
};

const TYPE_COLORS: Record<string, string> = {
  top: "bg-blue-100 text-blue-700",
  heart: "bg-pink-100 text-pink-700",
  base: "bg-amber-100 text-amber-700",
};

function emptyForm() {
  return {
    name: "",
    type: "top" as "top" | "heart" | "base",
    category: "",
    language: "fr",
    description: "",
    intensity: "",
    allergens: "",
  };
}

function getBackendBaseUrl() {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  return base ? base.replace(/\/+$/, "") : "";
}

async function apiFetch(path: string, init?: RequestInit) {
  const base = getBackendBaseUrl();
  const url = `${base}${path.startsWith("/") ? "" : "/"}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const details = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} — ${details}`);
  }
  if (res.status === 204) return null;
  return (await res.json()) as unknown;
}

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState("fr");
  const [typeFilter, setTypeFilter] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm());

  const [selected, setSelected] = useState<Ingredient | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editForm, setEditForm] = useState(emptyForm());

  async function refresh() {
    setError(null);
    setIsBusy(true);
    try {
      const params = new URLSearchParams({ active_only: "false" });
      if (langFilter) params.set("language", langFilter);
      if (typeFilter) params.set("type", typeFilter);
      const data = await apiFetch(`/catalog/ingredients?${params}`);
      setIngredients(Array.isArray(data) ? (data as Ingredient[]) : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setIsBusy(false);
    }
  }

  useEffect(() => { void refresh(); }, [langFilter, typeFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ingredients;
    return ingredients.filter((i) =>
      `${i.name} ${i.category ?? ""} ${i.description ?? ""}`.toLowerCase().includes(q)
    );
  }, [ingredients, search]);

  function parseAllergens(raw: string): string[] | null {
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    return parts.length > 0 ? parts : null;
  }

  async function createIngredient() {
    if (!createForm.name.trim()) return;
    setIsBusy(true);
    try {
      await apiFetch("/catalog/ingredients", {
        method: "POST",
        body: JSON.stringify({
          name: createForm.name.trim(),
          type: createForm.type,
          category: createForm.category.trim() || null,
          language: createForm.language,
          description: createForm.description.trim() || null,
          intensity: createForm.intensity.trim() || null,
          allergens: parseAllergens(createForm.allergens),
        }),
      });
      setIsCreateOpen(false);
      setCreateForm(emptyForm());
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setIsBusy(false);
    }
  }

  function openDetail(ing: Ingredient) {
    setSelected(ing);
    setEditForm({
      name: ing.name,
      type: ing.type,
      category: ing.category ?? "",
      language: ing.language,
      description: ing.description ?? "",
      intensity: ing.intensity ?? "",
      allergens: ing.allergens ? ing.allergens.join(", ") : "",
    });
    setIsDetailOpen(true);
  }

  async function saveDetail() {
    if (!selected || !editForm.name.trim()) return;
    setIsBusy(true);
    try {
      await apiFetch(`/catalog/ingredients/${selected.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editForm.name.trim(),
          type: editForm.type,
          category: editForm.category.trim() || null,
          language: editForm.language,
          description: editForm.description.trim() || null,
          intensity: editForm.intensity.trim() || null,
          allergens: parseAllergens(editForm.allergens),
          is_active: selected.is_active,
        }),
      });
      setIsDetailOpen(false);
      setSelected(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setIsBusy(false);
    }
  }

  async function toggleActive(ing: Ingredient) {
    setIsBusy(true);
    try {
      await apiFetch(`/catalog/ingredients/${ing.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !ing.is_active }),
      });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setIsBusy(false);
    }
  }

  async function deleteIngredient() {
    if (!selected) return;
    if (!window.confirm(`Supprimer l'ingrédient "${selected.name}" ?`)) return;
    setIsBusy(true);
    try {
      await apiFetch(`/catalog/ingredients/${selected.id}`, { method: "DELETE" });
      setIsDetailOpen(false);
      setSelected(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setIsBusy(false);
    }
  }

  function FormFields({ form, setForm }: { form: ReturnType<typeof emptyForm>; setForm: (f: ReturnType<typeof emptyForm>) => void }) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="ing_name">Nom *</Label>
          <Input id="ing_name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex : Bergamote fraîche" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ing_type">Type *</Label>
          <select id="ing_type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "top" | "heart" | "base" })}
            className="w-full rounded-custom border border-[#e5e5e3] px-3 py-2 text-sm text-dark">
            <option value="top">Note de tête</option>
            <option value="heart">Note de cœur</option>
            <option value="base">Note de fond</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ing_lang">Langue *</Label>
          <select id="ing_lang" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}
            className="w-full rounded-custom border border-[#e5e5e3] px-3 py-2 text-sm text-dark">
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ing_category">Catégorie</Label>
          <Input id="ing_category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="adult, enfant…" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ing_intensity">Intensité</Label>
          <select id="ing_intensity" value={form.intensity} onChange={(e) => setForm({ ...form, intensity: e.target.value })}
            className="w-full rounded-custom border border-[#e5e5e3] px-3 py-2 text-sm text-dark">
            <option value="">— Non renseignée —</option>
            <option value="legere">Légère</option>
            <option value="moyenne">Moyenne</option>
            <option value="forte">Forte</option>
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="ing_desc">Description olfactive</Label>
          <Input id="ing_desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Note agrumée, fraîche et lumineuse…" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="ing_allergens">
            Allergènes <span className="text-dark/40 font-normal">(séparés par des virgules — laisser vide = IA raisonne seule)</span>
          </Label>
          <Input id="ing_allergens" value={form.allergens} onChange={(e) => setForm({ ...form, allergens: e.target.value })} placeholder="limonène, linalool, géraniol…" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-custom border border-[#e5e5e3] bg-card-bg p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-dark">Ingrédients</h2>
            <p className="mt-1 text-sm text-dark/60">
              Notes olfactives utilisées par l'IA pour générer les formules de parfum.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={langFilter} onChange={(e) => setLangFilter(e.target.value)}
              className="rounded-custom border border-[#e5e5e3] bg-white px-3 py-2 text-sm text-dark">
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="">Toutes langues</option>
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-custom border border-[#e5e5e3] bg-white px-3 py-2 text-sm text-dark">
              <option value="">Tous types</option>
              <option value="top">Tête</option>
              <option value="heart">Cœur</option>
              <option value="base">Fond</option>
            </select>
            <Button variant="primary" onClick={() => { setCreateForm(emptyForm()); setIsCreateOpen(true); }}>
              <span className="material-symbols-outlined text-[18px]">add</span>
              Ajouter
            </Button>
          </div>
        </div>
        {error && (
          <div className="mt-4 rounded-custom border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
        )}
      </div>

      {/* Liste */}
      <div className="overflow-hidden rounded-custom border border-[#e5e5e3] bg-card-bg shadow-sm">
        <div className="flex items-center justify-between border-b border-[#e5e5e3] bg-light/20 px-6 py-4">
          <div className="text-sm font-semibold text-dark">
            Ingrédients <span className="text-dark/50">({filtered.length})</span>
          </div>
          <div className="w-72">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher…" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#e5e5e3]">
            <thead className="bg-light/40">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dark/60">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dark/60">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dark/60">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dark/60">Intensité</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dark/60">Allergènes</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dark/60">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5e3]">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-dark/60">
                    {isBusy ? "Chargement..." : "Aucun ingrédient."}
                  </td>
                </tr>
              )}
              {filtered.map((ing) => (
                <tr key={ing.id} className="cursor-pointer transition-colors hover:bg-light/50" onClick={() => openDetail(ing)}>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-dark">{ing.name}</p>
                    {ing.description && <p className="text-xs text-dark/50 truncate max-w-xs">{ing.description}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[ing.type]}`}>
                      {TYPE_LABELS[ing.type]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark/70">{ing.category || "—"}</td>
                  <td className="px-6 py-4 text-sm text-dark/70 capitalize">{ing.intensity || "—"}</td>
                  <td className="px-6 py-4 text-sm text-dark/70">
                    {ing.allergens ? (
                      <span className="text-orange-600">{ing.allergens.length} renseigné{ing.allergens.length > 1 ? "s" : ""}</span>
                    ) : (
                      <span className="text-dark/40 italic">IA raisonne</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleActive(ing); }}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        ing.is_active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                      }`}
                    >
                      {ing.is_active ? "Actif" : "Inactif"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal création */}
      <Modal open={isCreateOpen} title="Nouvel ingrédient" onClose={() => setIsCreateOpen(false)} maxWidthClassName="max-w-2xl"
        footer={
          <>
            <Button onClick={() => setIsCreateOpen(false)}>Annuler</Button>
            <Button variant="primary" onClick={createIngredient} disabled={isBusy || !createForm.name.trim()}>Créer</Button>
          </>
        }
      >
        <FormFields form={createForm} setForm={setCreateForm} />
      </Modal>

      {/* Modal détail */}
      <Modal open={isDetailOpen && !!selected} title={selected ? `Ingrédient — ${selected.name}` : ""} onClose={() => { setIsDetailOpen(false); setSelected(null); }} maxWidthClassName="max-w-2xl"
        footer={
          selected ? (
            <>
              <Button variant="danger" onClick={deleteIngredient}>Supprimer</Button>
              <div className="flex-1" />
              <Button onClick={() => { setIsDetailOpen(false); setSelected(null); }}>Fermer</Button>
              <Button variant="primary" onClick={saveDetail} disabled={isBusy || !editForm.name.trim()}>Enregistrer</Button>
            </>
          ) : null
        }
      >
        {selected && <FormFields form={editForm} setForm={setEditForm} />}
      </Modal>
    </div>
  );
}
