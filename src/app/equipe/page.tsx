"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";

type TeamMember = {
  id: string | number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at?: string;
  updated_at?: string;
};

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
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    let details = "";
    try {
      details = await res.text();
    } catch {
      // ignore
    }
    throw new Error(`HTTP ${res.status} ${res.statusText}${details ? ` — ${details}` : ""}`);
  }

  // DELETE peut répondre 204 (pas de body) → ne pas tenter res.json()
  if (res.status === 204) return null;

  const contentLength = res.headers.get("content-length");
  if (contentLength === "0") return null;

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  return (await res.json()) as unknown;
}

function normalizeMembers(payload: unknown): TeamMember[] {
  if (Array.isArray(payload)) return payload as TeamMember[];
  if (payload && typeof payload === "object") {
    const maybe = (payload as Record<string, unknown>).data;
    if (Array.isArray(maybe)) return maybe as TeamMember[];
  }
  return [];
}

type MemberFormState = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
};

function emptyForm(): MemberFormState {
  return {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  };
}

export default function EquipePage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [search, setSearch] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<MemberFormState>(emptyForm());

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editForm, setEditForm] = useState<MemberFormState>(emptyForm());

  async function refreshMembers() {
    setError(null);
    setIsBusy(true);
    try {
      const data = await apiFetch("/teams/");
      setMembers(normalizeMembers(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setIsBusy(false);
    }
  }

  useEffect(() => {
    const t = window.setTimeout(() => {
      void refreshMembers();
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => {
      const hay = `${m.first_name} ${m.last_name} ${m.email} ${m.phone}`.toLowerCase();
      return hay.includes(q);
    });
  }, [members, search]);

  const selectedMember = useMemo(
    () =>
      selectedId
        ? members.find((m) => String(m.id) === String(selectedId)) ?? null
        : null,
    [members, selectedId],
  );

  function openCreate() {
    setCreateForm(emptyForm());
    setIsCreateOpen(true);
  }

  async function submitCreate() {
    const first_name = createForm.first_name.trim();
    const last_name = createForm.last_name.trim();
    const email = createForm.email.trim();
    const phone = createForm.phone.trim();
    if (!first_name || !last_name || !email) return;

    setError(null);
    setIsBusy(true);
    try {
      const body: Record<string, unknown> = {
        first_name,
        last_name,
        email,
      };
      if (phone) body.phone = phone;

      await apiFetch("/teams/", { method: "POST", body: JSON.stringify(body) });
      setIsCreateOpen(false);
      await refreshMembers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setIsBusy(false);
    }
  }

  function openDetail(member: TeamMember) {
    setSelectedId(String(member.id));
    setEditForm({
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email,
      phone: member.phone,
    });
    setIsDetailOpen(true);
  }

  async function saveDetail() {
    if (!selectedMember) return;
    const nextFirst = editForm.first_name.trim();
    const nextLast = editForm.last_name.trim();
    const nextEmail = editForm.email.trim();
    const nextPhone = editForm.phone.trim();

    if (!nextFirst || !nextLast || !nextEmail) return;

    const patch: Record<string, unknown> = {};
    if (nextFirst !== selectedMember.first_name) patch.first_name = nextFirst;
    if (nextLast !== selectedMember.last_name) patch.last_name = nextLast;
    if (nextEmail !== selectedMember.email) patch.email = nextEmail;
    if (nextPhone !== (selectedMember.phone ?? "")) patch.phone = nextPhone || null;

    if (Object.keys(patch).length === 0) {
      setIsDetailOpen(false);
      return;
    }

    setError(null);
    setIsBusy(true);
    try {
      await apiFetch(`/teams/${encodeURIComponent(String(selectedMember.id))}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      setIsDetailOpen(false);
      await refreshMembers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setIsBusy(false);
    }
  }

  async function deleteSelected() {
    if (!selectedMember) return;
    const ok = window.confirm(
      `Supprimer le membre ${selectedMember.first_name} ${selectedMember.last_name} ?`,
    );
    if (!ok) return;

    setError(null);
    setIsBusy(true);
    try {
      await apiFetch(`/teams/${encodeURIComponent(String(selectedMember.id))}`, {
        method: "DELETE",
      });
      setIsDetailOpen(false);
      setSelectedId(null);
      await refreshMembers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-custom border border-[#e5e5e3] bg-card-bg p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-dark">Équipe</h2>
            <p className="mt-1 text-sm text-dark/60">
              Liste des membres. Ajoute-en un, ou clique sur une ligne pour modifier ou supprimer.
            </p>
          </div>

          <div className="flex w-full md:w-auto">
            <Button variant="primary" type="button" onClick={openCreate} className="w-full md:w-auto">
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Ajouter un membre
            </Button>
          </div>
        </div>
        {error ? (
          <div className="mt-4 rounded-custom border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-custom border border-[#e5e5e3] bg-card-bg shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#e5e5e3] bg-light/20 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm font-semibold text-dark">
            Liste des membres{" "}
            <span className="text-dark/50">({filteredMembers.length})</span>
          </div>
          <div className="w-full md:w-96">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher (nom, email, téléphone)"
              aria-label="Rechercher un membre"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#e5e5e3]">
            <thead className="bg-light/40">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dark/60">
                  Nom / Prénom
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dark/60">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dark/60">
                  Téléphone
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5e3]">
              {filteredMembers.map((m) => (
                <tr
                  key={String(m.id)}
                  className="cursor-pointer transition-colors hover:bg-light/50"
                  onClick={() => openDetail(m)}
                >
                  <td className="px-6 py-4 text-sm font-medium text-dark">
                    {m.last_name} {m.first_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-dark/70">{m.email}</td>
                  <td className="px-6 py-4 text-sm text-dark/70">{m.phone || "—"}</td>
                </tr>
              ))}

              {filteredMembers.length === 0 ? (
                <tr>
                  <td className="px-6 py-10 text-center text-sm text-dark/60" colSpan={3}>
                    {isBusy ? "Chargement..." : "Aucun membre ne correspond à ta recherche."}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={isCreateOpen}
        title="Ajouter un membre"
        onClose={() => setIsCreateOpen(false)}
        maxWidthClassName="max-w-xl"
        footer={
          <>
            <Button type="button" onClick={() => setIsCreateOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              type="button"
              onClick={submitCreate}
              disabled={
                isBusy ||
                !createForm.first_name.trim() ||
                !createForm.last_name.trim() ||
                !createForm.email.trim()
              }
            >
              Ajouter
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first_name">first_name</Label>
            <Input
              id="first_name"
              value={createForm.first_name}
              onChange={(e) => setCreateForm((s) => ({ ...s, first_name: e.target.value }))}
              placeholder="Prénom"
              autoComplete="given-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">last_name</Label>
            <Input
              id="last_name"
              value={createForm.last_name}
              onChange={(e) => setCreateForm((s) => ({ ...s, last_name: e.target.value }))}
              placeholder="Nom"
              autoComplete="family-name"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email">email</Label>
            <Input
              id="email"
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm((s) => ({ ...s, email: e.target.value }))}
              placeholder="email@exemple.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="phone">phone</Label>
            <Input
              id="phone"
              value={createForm.phone}
              onChange={(e) => setCreateForm((s) => ({ ...s, phone: e.target.value }))}
              placeholder="06 00 00 00 00"
              autoComplete="tel"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={isDetailOpen && !!selectedMember}
        title={
          selectedMember
            ? `Membre — ${selectedMember.first_name} ${selectedMember.last_name}`
            : "Membre"
        }
        onClose={() => setIsDetailOpen(false)}
        maxWidthClassName="max-w-xl"
        footer={
          selectedMember ? (
            <>
              <Button variant="danger" type="button" onClick={deleteSelected}>
                Supprimer
              </Button>
              <div className="flex-1" />
              <Button type="button" onClick={() => setIsDetailOpen(false)}>
                Fermer
              </Button>
              <Button
                variant="primary"
                type="button"
                onClick={saveDetail}
                disabled={
                  isBusy ||
                  !editForm.first_name.trim() ||
                  !editForm.last_name.trim() ||
                  !editForm.email.trim()
                }
              >
                Enregistrer
              </Button>
            </>
          ) : null
        }
      >
        {selectedMember ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit_first_name">first_name</Label>
              <Input
                id="edit_first_name"
                value={editForm.first_name}
                onChange={(e) => setEditForm((s) => ({ ...s, first_name: e.target.value }))}
                placeholder="Prénom"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_last_name">last_name</Label>
              <Input
                id="edit_last_name"
                value={editForm.last_name}
                onChange={(e) => setEditForm((s) => ({ ...s, last_name: e.target.value }))}
                placeholder="Nom"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit_email">email</Label>
              <Input
                id="edit_email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((s) => ({ ...s, email: e.target.value }))}
                placeholder="email@exemple.com"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit_phone">phone</Label>
              <Input
                id="edit_phone"
                value={editForm.phone}
                onChange={(e) => setEditForm((s) => ({ ...s, phone: e.target.value }))}
                placeholder="06 00 00 00 00"
              />
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

