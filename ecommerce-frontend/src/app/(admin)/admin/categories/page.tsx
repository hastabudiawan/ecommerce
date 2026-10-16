"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/lib/errors";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/services/category.service";
import type { Category } from "@/types/api";

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 0,
  });

  function handleDone() {
    setError(null);
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  }

  const create = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      setNewName("");
      handleDone();
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const rename = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      setEditingId(null);
      handleDone();
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: deleteCategory,
    onSuccess: handleDone,
    onError: (err) => setError(getErrorMessage(err)),
  });

  const busy = create.isPending || rename.isPending || remove.isPending;

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) {
      setError("Nama kategori wajib diisi");
      return;
    }
    setError(null);
    create.mutate(newName.trim());
  }

  function startEdit(category: Category) {
    setError(null);
    setEditingId(category.id);
    setEditName(category.name);
  }

  function saveEdit(category: Category) {
    if (!editName.trim()) {
      setError("Nama kategori wajib diisi");
      return;
    }
    setError(null);
    rename.mutate({ id: category.id, name: editName.trim() });
  }

  function handleDelete(category: Category) {
    if (!window.confirm(`Hapus kategori "${category.name}"?`)) return;
    setError(null);
    remove.mutate(category.id);
  }

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl">KATEGORI</h1>
      <p className="mt-2 text-sm text-black/60">
        Kategori yang masih dipakai produk (termasuk yang diarsipkan) tidak bisa
        dihapus. Mengganti nama tidak mengubah alamat URL-nya.
      </p>

      <form onSubmit={handleCreate} className="mt-6 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nama kategori baru..."
          className="flex-1 rounded-full bg-surface px-5 py-3 outline-none placeholder:text-black/40"
        />
        <Button type="submit" className="px-6 py-3" disabled={busy}>
          {create.isPending ? "Menambah..." : "Tambah"}
        </Button>
      </form>

      {error && <p className="mt-4 text-sm text-sale">{error}</p>}
      {isLoading && <p className="mt-6 text-sm text-black/50">Memuat kategori...</p>}

      {categories && categories.length === 0 && (
        <div className="mt-6 rounded-2xl border border-black/10 p-10 text-center">
          <p className="text-black/60">
            Belum ada kategori. Seller tidak bisa membuat produk sebelum ada kategori.
          </p>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {categories?.map((category) => (
          <div
            key={category.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/10 p-4"
          >
            {editingId === category.id ? (
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="min-w-0 flex-1 rounded-full bg-surface px-4 py-2 outline-none"
                autoFocus
              />
            ) : (
              <div className="min-w-0">
                <p className="font-medium">{category.name}</p>
                <p className="text-xs text-black/40">/{category.slug}</p>
              </div>
            )}

            <div className="flex gap-2">
              {editingId === category.id ? (
                <>
                  <Button
                    className="px-5 py-2"
                    disabled={busy}
                    onClick={() => saveEdit(category)}
                  >
                    Simpan
                  </Button>
                  <Button
                    variant="outline"
                    className="px-5 py-2"
                    onClick={() => setEditingId(null)}
                  >
                    Batal
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="px-5 py-2"
                    disabled={busy}
                    onClick={() => startEdit(category)}
                  >
                    Ubah nama
                  </Button>
                  <Button
                    variant="outline"
                    className="px-5 py-2 text-sale"
                    disabled={busy}
                    onClick={() => handleDelete(category)}
                  >
                    Hapus
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}