"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Package, Pencil, Plus, Star, Trash2, User as UserIcon, X } from "lucide-react";
import { useAccount } from "@/components/account-context";
import { SignInPrompt } from "@/components/auth/sign-in-prompt";
import { AddressFields, type SavedAddressInput } from "@/components/address-fields";

type SavedAddr = { id: string; label: string; city: string; district: string; khoroo: string; detail: string; isDefault: boolean };

const BLANK_ADDR: SavedAddressInput = { label: "", city: "", district: "", khoroo: "", detail: "", otherRecipient: false };

function savedToAddr(a: SavedAddr): SavedAddressInput {
  return { label: a.label, city: a.city, district: a.district, khoroo: a.khoroo, detail: a.detail, otherRecipient: false };
}

function AddressForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: SavedAddr;
  onSave: (data: Omit<SavedAddr, "id">) => Promise<void>;
  onCancel: () => void;
}) {
  const [addr, setAddr] = useState<SavedAddressInput>(initial ? savedToAddr(initial) : BLANK_ADDR);
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false);
  const [saving, setSaving] = useState(false);

  const valid = addr.label.trim() && addr.city.trim() && addr.detail.trim();

  const handleSave = async () => {
    if (!valid || saving) return;
    setSaving(true);
    try {
      await onSave({ label: addr.label, city: addr.city, district: addr.district, khoroo: addr.khoroo, detail: addr.detail, isDefault });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-brand/30 bg-brand/5 p-4">
      <AddressFields value={addr} onChange={setAddr} labelSize="small" />
      <label className="mb-4 mt-3 flex items-center gap-2 text-sm">
        <input type="checkbox" className="size-4 accent-[var(--brand)]" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
        Үндсэн хаяг болгох
      </label>
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={!valid || saving} className="flex-1 rounded-lg bg-brand py-2 text-sm font-semibold text-brand-foreground hover:bg-brand-hover disabled:opacity-50">
          {saving ? "Хадгалж байна…" : "Хадгалах"}
        </button>
        <button onClick={onCancel} className="rounded-lg border border-border-subtle px-4 py-2 text-sm hover:bg-muted">
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, hydrated } = useAccount();
  const [addresses, setAddresses] = useState<SavedAddr[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch("/api/addresses").then((r) => r.json()).then(setAddresses).catch(() => {});
  }, [user]);

  if (!hydrated) return <div className="mx-auto max-w-[800px] px-4 py-16 text-center text-muted-foreground">Уншиж байна…</div>;
  if (!user) return <SignInPrompt redirect="/profile" />;

  const handleAdd = async (data: Omit<SavedAddr, "id">) => {
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const saved: SavedAddr = await res.json();
    setAddresses((prev) => {
      const list = data.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev;
      return [...list, saved];
    });
    setShowAddForm(false);
  };

  const handleEdit = async (id: string, data: Omit<SavedAddr, "id">) => {
    const res = await fetch(`/api/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const updated: SavedAddr = await res.json();
    setAddresses((prev) => {
      let list = prev;
      if (data.isDefault) list = list.map((a) => ({ ...a, isDefault: false }));
      return list.map((a) => (a.id === id ? updated : a));
    });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const setDefault = async (id: string) => {
    await fetch(`/api/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  const rows = [
    { label: "Нэр", value: user.firstName },
    { label: "Овог", value: user.lastName },
    { label: "Утасны дугаар", value: user.phone },
    { label: "И-Мэйл хаяг", value: user.email },
  ];

  return (
    <div className="mx-auto max-w-[800px] px-4 py-6 space-y-6">
      {/* Profile info */}
      <div>
        <h1 className="mb-4 flex items-center gap-2 text-2xl font-bold">
          <UserIcon className="size-6 text-brand" /> Хувийн мэдээлэл
        </h1>
        <div className="rounded-card border border-border-subtle p-6">
          <div className="mb-5 flex items-center gap-4">
            <span className="grid size-14 place-items-center rounded-lg border border-border-subtle text-brand">
              <UserIcon className="size-7" />
            </span>
            <div>
              <p className="text-lg font-semibold">{user.firstName} {user.lastName}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <dl className="divide-y divide-border-subtle">
            {rows.map((r) => (
              <div key={r.label} className="flex justify-between py-3 text-sm">
                <dt className="text-muted-foreground">{r.label}</dt>
                <dd className="font-medium">{r.value || "—"}</dd>
              </div>
            ))}
          </dl>
          <Link href="/orders" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground hover:bg-brand-hover">
            <Package className="size-4" /> Миний захиалгууд
          </Link>
        </div>
      </div>

      {/* Saved addresses */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <MapPin className="size-5 text-brand" /> Хадгалсан хаягууд
          </h2>
          {!showAddForm && (
            <button onClick={() => { setShowAddForm(true); setEditingId(null); }} className="flex items-center gap-1.5 rounded-lg border border-border-subtle px-3 py-1.5 text-sm hover:bg-muted">
              <Plus className="size-4" /> Хаяг нэмэх
            </button>
          )}
        </div>

        <div className="space-y-3">
          {showAddForm && (
            <AddressForm onSave={handleAdd} onCancel={() => setShowAddForm(false)} />
          )}

          {addresses.length === 0 && !showAddForm && (
            <p className="rounded-xl border border-dashed border-border-subtle py-8 text-center text-sm text-muted-foreground">
              Хадгалсан хаяг байхгүй байна.
            </p>
          )}

          {addresses.map((a) =>
            editingId === a.id ? (
              <AddressForm
                key={a.id}
                initial={a}
                onSave={(data) => handleEdit(a.id, data)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div key={a.id} className="rounded-xl border border-border-subtle p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm">
                    <p className="font-semibold">
                      {a.label}
                      {a.isDefault && <span className="ml-2 rounded-full bg-brand/10 px-2 py-0.5 text-xs text-brand">Үндсэн</span>}
                    </p>
                    <p className="mt-0.5 text-muted-foreground">{[a.city, a.district, a.khoroo].filter(Boolean).join(", ")}</p>
                    <p className="text-muted-foreground">{a.detail}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {!a.isDefault && (
                      <button onClick={() => setDefault(a.id)} title="Үндсэн болгох" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-brand">
                        <Star className="size-4" />
                      </button>
                    )}
                    <button onClick={() => { setEditingId(a.id); setShowAddForm(false); }} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-brand">
                      <Pencil className="size-4" />
                    </button>
                    <button onClick={() => handleDelete(a.id)} disabled={deletingId === a.id} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-sale disabled:opacity-40">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
