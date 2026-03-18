"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";

type Client = {
  id: string | number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  days_available: number;
  sessions_available: number;
  created_at?: string;
  updated_at?: string;
};

function parsePositiveInt(value: string) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
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

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  return (await res.json()) as unknown;
}

function normalizeClients(payload: unknown): Client[] {
  if (Array.isArray(payload)) return payload as Client[];
  if (payload && typeof payload === "object") {
    const maybe = (payload as Record<string, unknown>).data;
    if (Array.isArray(maybe)) return maybe as Client[];
  }
  return [];
}

type CreateClientFormState = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  sessions_available: string;
  days_available: string;
};

function emptyCreateForm(): CreateClientFormState {
  return {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    sessions_available: "0",
    days_available: "0",
  };
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateClientFormState>(emptyCreateForm());

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editSessionsAvailable, setEditSessionsAvailable] = useState("0");
  const [editDaysAvailable, setEditDaysAvailable] = useState("0");

  async function refreshClients() {
    setError(null);
    setIsBusy(true);
    try {
      const data = await apiFetch("/customers/");
      setClients(normalizeClients(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setIsBusy(false);
    }
  }

  useEffect(() => {
    const t = window.setTimeout(() => {
      void refreshClients();
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => {
      const hay = `${c.first_name} ${c.last_name} ${c.email} ${c.phone}`.toLowerCase();
      return hay.includes(q);
    });
  }, [clients, search]);

  const selectedClient = useMemo(
    () =>
      selectedId
        ? clients.find((c) => String(c.id) === String(selectedId)) ?? null
        : null,
    [clients, selectedId],
  );

  function openCreate() {
    setCreateForm(emptyCreateForm());
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
      await apiFetch("/customers/", {
        method: "POST",
        body: JSON.stringify({
          first_name,
          last_name,
          email,
          phone,
          days_available: parsePositiveInt(createForm.days_available),
          sessions_available: parsePositiveInt(createForm.sessions_available),
        }),
      });
      setIsCreateOpen(false);
      await refreshClients();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setIsBusy(false);
    }
  }

  function openDetail(client: Client) {
    setSelectedId(String(client.id));
    setEditSessionsAvailable(String(client.sessions_available));
    setEditDaysAvailable(String(client.days_available));
    setIsDetailOpen(true);
  }

  async function saveDetail() {
    if (!selectedClient) return;
    setError(null);
    setIsBusy(true);
    try {
      await apiFetch(`/customers/${encodeURIComponent(String(selectedClient.id))}`, {
        method: "PATCH",
        body: JSON.stringify({
          sessions_available: parsePositiveInt(editSessionsAvailable),
          days_available: parsePositiveInt(editDaysAvailable),
        }),
      });
      setIsDetailOpen(false);
      await refreshClients();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setIsBusy(false);
    }
  }

  async function deleteSelected() {
    if (!selectedClient) return;
    const ok = window.confirm(
      `Supprimer le client ${selectedClient.first_name} ${selectedClient.last_name} ?`,
    );
    if (!ok) return;
    setError(null);
    setIsBusy(true);
    try {
      await apiFetch(`/customers/${encodeURIComponent(String(selectedClient.id))}`, {
        method: "DELETE",
      });
      setIsDetailOpen(false);
      setSelectedId(null);
      await refreshClients();
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
            <h2 className="text-xl font-semibold text-dark">Clients</h2>
            <p className="mt-1 text-sm text-dark/60">
              Consulte la liste, ajoute un client, puis clique sur une ligne pour modifier les
              autorisations ou supprimer.
            </p>
          </div>

          <div className="flex w-full md:w-auto">
            <Button variant="primary" type="button" onClick={openCreate} className="w-full md:w-auto">
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Ajouter un client
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
            Liste des clients{" "}
            <span className="text-dark/50">({filteredClients.length})</span>
          </div>
          <div className="w-full md:w-96">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher (nom, email, téléphone)"
              aria-label="Rechercher un client"
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
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-dark/60">
                  Sessions
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-dark/60">
                  Jours
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5e3]">
              {filteredClients.map((c) => (
                <tr
                  key={String(c.id)}
                  className="cursor-pointer transition-colors hover:bg-light/50"
                  onClick={() => openDetail(c)}
                >
                  <td className="px-6 py-4 text-sm font-medium text-dark">
                    {c.last_name} {c.first_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-dark/70">{c.email}</td>
                  <td className="px-6 py-4 text-sm text-dark/70">{c.phone || "—"}</td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-dark">
                    {c.sessions_available}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-dark">
                    {c.days_available}
                  </td>
                </tr>
              ))}

              {filteredClients.length === 0 ? (
                <tr>
                  <td className="px-6 py-10 text-center text-sm text-dark/60" colSpan={5}>
                    {isBusy ? "Chargement..." : "Aucun client ne correspond à ta recherche."}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={isCreateOpen}
        title="Ajouter un nouveau client"
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

          <div className="space-y-2">
            <Label htmlFor="sessions_available">sessions_available</Label>
            <Input
              id="sessions_available"
              inputMode="numeric"
              value={createForm.sessions_available}
              onChange={(e) =>
                setCreateForm((s) => ({ ...s, sessions_available: e.target.value }))
              }
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="days_available">days_available</Label>
            <Input
              id="days_available"
              inputMode="numeric"
              value={createForm.days_available}
              onChange={(e) => setCreateForm((s) => ({ ...s, days_available: e.target.value }))}
              placeholder="0"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={isDetailOpen && !!selectedClient}
        title={
          selectedClient
            ? `Client — ${selectedClient.first_name} ${selectedClient.last_name}`
            : "Client"
        }
        onClose={() => setIsDetailOpen(false)}
        maxWidthClassName="max-w-xl"
        footer={
          selectedClient ? (
            <>
              <Button variant="danger" type="button" onClick={deleteSelected}>
                Supprimer
              </Button>
              <div className="flex-1" />
              <Button type="button" onClick={() => setIsDetailOpen(false)}>
                Fermer
              </Button>
              <Button variant="primary" type="button" onClick={saveDetail}>
                Enregistrer
              </Button>
            </>
          ) : null
        }
      >
        {selectedClient ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input value={selectedClient.last_name} disabled />
              </div>
              <div className="space-y-2">
                <Label>Prénom</Label>
                <Input value={selectedClient.first_name} disabled />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Email</Label>
                <Input value={selectedClient.email} disabled />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Téléphone</Label>
                <Input value={selectedClient.phone || ""} disabled />
              </div>
            </div>

            <div className="rounded-custom border border-[#e5e5e3] bg-light/40 p-4">
              <h3 className="text-sm font-semibold text-dark">Autorisations</h3>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit_sessions_available">Nombre de sessions autorisées</Label>
                  <Input
                    id="edit_sessions_available"
                    inputMode="numeric"
                    value={editSessionsAvailable}
                    onChange={(e) => setEditSessionsAvailable(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_days_available">Nombre de jours autorisés</Label>
                  <Input
                    id="edit_days_available"
                    inputMode="numeric"
                    value={editDaysAvailable}
                    onChange={(e) => setEditDaysAvailable(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

