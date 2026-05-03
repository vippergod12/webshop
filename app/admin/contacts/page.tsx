"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import type { Contact, ContactStatus } from "@/lib/types";
import { formatDateTime } from "@/lib/utils/format";

type Filter = "all" | ContactStatus;

const STATUS_LABEL: Record<ContactStatus, string> = {
  new: "Mới",
  contacted: "Đã liên hệ",
  done: "Đã chốt",
  spam: "Spam",
};

const STATUS_CLASS: Record<ContactStatus, string> = {
  new: "status status--warn",
  contacted: "status status--info",
  done: "status status--ok",
  spam: "status status--mute",
};

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("new");
  const [savingNoteId, setSavingNoteId] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState<Record<number, string>>({});

  async function reload() {
    setLoading(true);
    try {
      const res = await apiFetch<{ contacts: Contact[] }>(
        "/api/contacts?limit=500",
        { auth: true }
      );
      setContacts(res.contacts || []);
      const drafts: Record<number, string> = {};
      for (const c of res.contacts || []) drafts[c.id] = c.note || "";
      setNoteDraft(drafts);
    } catch (err: any) {
      alert(err?.message || "Tải danh sách thất bại");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  async function patch(c: Contact, patch: Partial<Contact>) {
    try {
      const res = await apiFetch<{ contact: Contact }>(`/api/contacts/${c.id}`, {
        method: "PATCH",
        auth: true,
        body: JSON.stringify(patch),
      });
      setContacts((prev) =>
        prev.map((x) => (x.id === c.id ? res.contact : x))
      );
    } catch (err: any) {
      alert(err?.message || "Cập nhật thất bại");
    }
  }

  async function setStatus(c: Contact, status: ContactStatus) {
    if (c.status === status) return;
    await patch(c, { status });
  }

  async function saveNote(c: Contact) {
    setSavingNoteId(c.id);
    try {
      await patch(c, { note: noteDraft[c.id] ?? "" });
    } finally {
      setSavingNoteId(null);
    }
  }

  async function remove(c: Contact) {
    if (!confirm(`Xóa liên hệ của "${c.name}"?`)) return;
    try {
      await apiFetch(`/api/contacts/${c.id}`, {
        method: "DELETE",
        auth: true,
      });
      setContacts((prev) => prev.filter((x) => x.id !== c.id));
    } catch (err: any) {
      alert(err?.message || "Xóa thất bại");
    }
  }

  const counts = useMemo(() => {
    const c = { all: contacts.length, new: 0, contacted: 0, done: 0, spam: 0 };
    for (const x of contacts) c[x.status]++;
    return c;
  }, [contacts]);

  const filtered = useMemo(() => {
    if (filter === "all") return contacts;
    return contacts.filter((c) => c.status === filter);
  }, [contacts, filter]);

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <h1>Liên hệ khách hàng</h1>
          <p>
            {counts.all} yêu cầu — {counts.new} chờ xử lý, {counts.contacted} đang
            liên hệ, {counts.done} đã chốt.
          </p>
        </div>
      </header>

      <div className="admin-tabs">
        {(["new", "contacted", "done", "spam", "all"] as Filter[]).map((k) => (
          <button
            key={k}
            type="button"
            className={`admin-tab ${filter === k ? "is-active" : ""}`}
            onClick={() => setFilter(k)}
          >
            {k === "all" ? "Tất cả" : STATUS_LABEL[k]}
            <span className="admin-tab__count">
              {k === "all" ? counts.all : counts[k]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <p>Đang tải…</p>
      ) : filtered.length ? (
        <ul className="contact-list">
          {filtered.map((c) => (
            <li key={c.id} className={`contact-list__item is-${c.status}`}>
              <div className="contact-list__head">
                <strong>{c.name}</strong>
                <a href={`tel:${c.phone}`} className="link">
                  {c.phone}
                </a>
                {c.email ? (
                  <a href={`mailto:${c.email}`} className="link muted">
                    {c.email}
                  </a>
                ) : null}
                <span className={STATUS_CLASS[c.status]}>
                  {STATUS_LABEL[c.status]}
                </span>
                <span className="muted contact-list__time">
                  {formatDateTime(c.created_at)}
                </span>
              </div>

              {c.project_type ? (
                <div className="contact-list__type">
                  <span className="muted">Loại website:</span>{" "}
                  <strong>{c.project_type}</strong>
                </div>
              ) : null}

              {c.message ? <p className="contact-list__msg">{c.message}</p> : null}

              <details className="contact-list__note">
                <summary>
                  Ghi chú nội bộ {c.note ? "(đã có)" : ""}
                </summary>
                <textarea
                  rows={2}
                  value={noteDraft[c.id] ?? ""}
                  onChange={(e) =>
                    setNoteDraft({ ...noteDraft, [c.id]: e.target.value })
                  }
                  placeholder="VD: hẹn gọi lại 9h ngày mai, đã chốt deposit 50%, ..."
                />
                <button
                  type="button"
                  className="btn btn--sm btn--ghost"
                  onClick={() => saveNote(c)}
                  disabled={savingNoteId === c.id}
                >
                  {savingNoteId === c.id ? "Đang lưu…" : "Lưu ghi chú"}
                </button>
              </details>

              <footer className="contact-list__foot">
                <div className="contact-list__status-actions">
                  {(["new", "contacted", "done", "spam"] as ContactStatus[]).map(
                    (s) => (
                      <button
                        key={s}
                        type="button"
                        className={`btn btn--sm ${
                          c.status === s ? "btn--primary" : "btn--ghost"
                        }`}
                        onClick={() => setStatus(c, s)}
                        disabled={c.status === s}
                      >
                        {STATUS_LABEL[s]}
                      </button>
                    )
                  )}
                </div>
                <button
                  type="button"
                  className="btn btn--sm btn--danger"
                  onClick={() => remove(c)}
                >
                  Xóa
                </button>
              </footer>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">
          Chưa có liên hệ nào ở mục này. Khi khách điền form trang Liên hệ, yêu cầu
          sẽ xuất hiện ở đây.
        </p>
      )}
    </div>
  );
}
