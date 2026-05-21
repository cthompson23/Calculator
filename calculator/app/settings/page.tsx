"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Contact {
  id: string;
  name: string;
  phone: string;
}

interface UserProfile {
  id: string;
  name: string;
}

const STORAGE_KEY_PROFILE = "alert_user_profile";
const STORAGE_KEY_CONTACTS = "alert_contacts";

const generateId = () =>
  Math.random().toString(36).slice(2, 9).toUpperCase();

// ─── Component ────────────────────────────────────────────────────────────────
export default function Settings() {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile>({ id: "", name: "" });
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [saved, setSaved] = useState(false);

  // New contact form state
  const [newContact, setNewContact] = useState<Omit<Contact, "id">>({
    name: "",
    phone: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContact, setEditContact] = useState<Contact | null>(null);

  // ── Load from localStorage ─────────────────────────────────────────────────
  useEffect(() => {
    const savedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
    const savedContacts = localStorage.getItem(STORAGE_KEY_CONTACTS);

    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedContacts) setContacts(JSON.parse(savedContacts));
  }, []);

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    localStorage.setItem(STORAGE_KEY_CONTACTS, JSON.stringify(contacts));

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // ── Contacts CRUD ──────────────────────────────────────────────────────────
  const addContact = () => {
    if (!newContact.name.trim() || !newContact.phone.trim()) return;

    setContacts(prev => [
      ...prev,
      { id: generateId(), ...newContact },
    ]);

    setNewContact({ name: "", phone: "" });
  };

  const removeContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const startEdit = (contact: Contact) => {
    setEditingId(contact.id);
    setEditContact({ ...contact });
  };

  const saveEdit = () => {
    if (!editContact) return;

    setContacts(prev =>
      prev.map(c => (c.id === editingId ? editContact : c))
    );

    setEditingId(null);
    setEditContact(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContact(null);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'DM Sans', sans-serif;
          background: #0a0a0f;
          min-height: 100vh;
        }

        .bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          background:
            radial-gradient(
              ellipse 60% 50% at 20% 30%,
              rgba(255,60,80,.10) 0%,
              transparent 70%
            ),
            radial-gradient(
              ellipse 50% 60% at 80% 70%,
              rgba(60,80,255,.08) 0%,
              transparent 70%
            ),
            #0a0a0f;
        }

        .page {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          padding: 32px 16px 64px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        /* ── Header ── */
        .header {
          width: 100%;
          max-width: 420px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 4px;
        }

        .back-btn {
          all: unset;
          cursor: pointer;
          width: 38px;
          height: 38px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 12px;
          background: rgba(255,255,255,.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,.75);
          font-size: 18px;
          transition: background .15s, transform .1s;
          flex-shrink: 0;
        }

        .back-btn:hover { background: rgba(255,255,255,.1); }
        .back-btn:active { transform: scale(.92); }

        .header-text {
          flex: 1;
        }

        .page-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: rgba(255,255,255,.3);
          margin-bottom: 2px;
        }

        .page-title {
          font-size: 22px;
          font-weight: 500;
          color: #fff;
          letter-spacing: -.02em;
        }

        /* ── Cards ── */
        .card {
          width: 100%;
          max-width: 420px;
          background: rgba(20,20,28,.85);
          backdrop-filter: blur(24px);
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,.07);
          box-shadow:
            0 0 0 1px rgba(0,0,0,.4),
            0 16px 48px rgba(0,0,0,.5),
            inset 0 1px 0 rgba(255,255,255,.06);
          overflow: hidden;
        }

        .card-header {
          padding: 18px 20px 14px;
          border-bottom: 1px solid rgba(255,255,255,.05);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .card-icon {
          font-size: 15px;
        }

        .card-title {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: rgba(255,255,255,.4);
        }

        .card-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        /* ── Fields ── */
        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: .15em;
          text-transform: uppercase;
          color: rgba(255,255,255,.35);
        }

        .field-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .input {
          all: unset;
          flex: 1;
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 10px;
          padding: 11px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          color: #fff;
          transition: border .15s, background .15s;
        }

        .input::placeholder {
          color: rgba(255,255,255,.2);
        }

        .input:focus {
          border-color: rgba(255,60,80,.4);
          background: rgba(255,255,255,.07);
        }

        .input-mono {
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          letter-spacing: .05em;
        }

        /* ── ID badge ── */
        .id-badge {
          background: rgba(255,60,80,.1);
          border: 1px solid rgba(255,60,80,.2);
          border-radius: 8px;
          padding: 6px 10px;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          letter-spacing: .1em;
          color: #ff6a56;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .gen-btn {
          all: unset;
          cursor: pointer;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 8px;
          padding: 8px 12px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: .1em;
          color: rgba(255,255,255,.5);
          white-space: nowrap;
          flex-shrink: 0;
          transition: background .15s, color .15s;
        }

        .gen-btn:hover {
          background: rgba(255,255,255,.1);
          color: rgba(255,255,255,.8);
        }

        /* ── Contacts list ── */
        .contacts-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .contact-item {
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .contact-info {
          flex: 1;
          min-width: 0;
        }

        .contact-name {
          font-size: 14px;
          font-weight: 500;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .contact-meta {
          display: flex;
          gap: 10px;
          margin-top: 3px;
          flex-wrap: wrap;
        }

        .contact-id {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: #ff6a56;
          letter-spacing: .06em;
        }

        .contact-phone {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: rgba(255,255,255,.35);
        }

        .contact-actions {
          display: flex;
          gap: 6px;
          flex-shrink: 0;
        }

        .icon-btn {
          all: unset;
          cursor: pointer;
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          transition: background .12s, transform .1s;
        }

        .icon-btn:active { transform: scale(.88); }

        .icon-btn-edit {
          background: rgba(255,255,255,.06);
          color: rgba(255,255,255,.5);
          border: 1px solid rgba(255,255,255,.08);
        }

        .icon-btn-edit:hover {
          background: rgba(255,255,255,.12);
          color: rgba(255,255,255,.85);
        }

        .icon-btn-del {
          background: rgba(255,60,80,.08);
          color: rgba(255,106,86,.6);
          border: 1px solid rgba(255,60,80,.12);
        }

        .icon-btn-del:hover {
          background: rgba(255,60,80,.18);
          color: #ff6a56;
        }

        /* ── Edit inline ── */
        .edit-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .edit-actions {
          display: flex;
          gap: 6px;
        }

        /* ── Add contact form ── */
        .add-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-top: 4px;
          border-top: 1px solid rgba(255,255,255,.05);
          margin-top: 4px;
        }

        .add-form-title {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: .15em;
          text-transform: uppercase;
          color: rgba(255,255,255,.25);
          padding-top: 8px;
        }

        .add-form-fields {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* ── Buttons ── */
        .btn-primary {
          all: unset;
          cursor: pointer;
          width: 100%;
          padding: 13px;
          border-radius: 10px;
          background: linear-gradient(135deg, #ff3c50, #ff7e30);
          color: #fff;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          letter-spacing: .1em;
          text-transform: uppercase;
          text-align: center;
          transition: filter .15s, transform .1s;
          box-shadow: 0 2px 16px rgba(255,60,80,.25);
        }

        .btn-primary:hover { filter: brightness(1.1); }
        .btn-primary:active { transform: scale(.98); }

        .btn-secondary {
          all: unset;
          cursor: pointer;
          flex: 1;
          padding: 10px;
          border-radius: 8px;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.1);
          color: rgba(255,255,255,.6);
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          letter-spacing: .08em;
          text-transform: uppercase;
          text-align: center;
          transition: background .15s;
        }

        .btn-secondary:hover { background: rgba(255,255,255,.1); }

        .btn-confirm {
          all: unset;
          cursor: pointer;
          flex: 1;
          padding: 10px;
          border-radius: 8px;
          background: rgba(255,60,80,.15);
          border: 1px solid rgba(255,60,80,.3);
          color: #ff6a56;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          letter-spacing: .08em;
          text-transform: uppercase;
          text-align: center;
          transition: background .15s;
        }

        .btn-confirm:hover { background: rgba(255,60,80,.25); }

        .btn-add {
          all: unset;
          cursor: pointer;
          width: 100%;
          padding: 11px;
          border-radius: 10px;
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.1);
          color: rgba(255,255,255,.55);
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          letter-spacing: .1em;
          text-transform: uppercase;
          text-align: center;
          transition: background .15s, color .15s, border .15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-add:hover {
          background: rgba(255,255,255,.09);
          color: rgba(255,255,255,.8);
          border-color: rgba(255,255,255,.18);
        }

        /* ── Save toast ── */
        .toast {
          position: fixed;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%) translateY(0);
          background: rgba(52,211,153,.15);
          border: 1px solid rgba(52,211,153,.3);
          border-radius: 10px;
          padding: 11px 22px;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: #34d399;
          z-index: 100;
          animation: toastIn .25s cubic-bezier(.34,1.56,.64,1);
        }

        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        .empty-state {
          text-align: center;
          padding: 20px 0 8px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: .1em;
          color: rgba(255,255,255,.2);
        }
      `}</style>

      <div className="bg" />

      <div className="page">

        {/* Header */}
        <div className="header">
          <button className="back-btn" onClick={() => router.push("/")}>
            ←
          </button>
          <div className="header-text">
            <div className="page-label">Configuración</div>
            <div className="page-title">Mi perfil</div>
          </div>
        </div>

        {/* ── Profile card ── */}
        <div className="card">
          <div className="card-header">
            <span className="card-icon">👤</span>
            <span className="card-title">Datos personales</span>
          </div>

          <div className="card-body">
            <div className="field">
              <div className="field-label">Cédula de usuario</div>
              <div className="field-row">
                <input
                  className="input input-mono"
                  placeholder="Ej: A3F9B2C"
                  value={profile.id}
                  onChange={e =>
                    setProfile(p => ({ ...p, id: e.target.value.toUpperCase() }))
                  }
                  maxLength={12}
                />
                <button
                  className="gen-btn"
                  onClick={() =>
                    setProfile(p => ({ ...p, id: generateId() }))
                  }
                >
                  Generar
                </button>
              </div>
              {profile.id && (
                <div className="id-badge">#{profile.id}</div>
              )}
            </div>

            <div className="field">
              <div className="field-label">Nombre completo</div>
              <input
                className="input"
                placeholder="Ej: María García"
                value={profile.name}
                onChange={e =>
                  setProfile(p => ({ ...p, name: e.target.value }))
                }
              />
            </div>
          </div>
        </div>

        {/* ── Contacts card ── */}
        <div className="card">
          <div className="card-header">
            <span className="card-icon">📋</span>
            <span className="card-title">Contactos de emergencia</span>
          </div>

          <div className="card-body">
            {/* List */}
            {contacts.length === 0 ? (
              <div className="empty-state">Sin contactos agregados</div>
            ) : (
              <div className="contacts-list">
                {contacts.map(c => (
                  <div key={c.id} className="contact-item">
                    {editingId === c.id && editContact ? (
                      <div className="edit-row" style={{ flex: 1 }}>
                        <input
                          className="input"
                          placeholder="Nombre"
                          value={editContact.name}
                          onChange={e =>
                            setEditContact(ec =>
                              ec ? { ...ec, name: e.target.value } : ec
                            )
                          }
                        />
                        <input
                          className="input input-mono"
                          placeholder="Teléfono"
                          value={editContact.phone}
                          onChange={e =>
                            setEditContact(ec =>
                              ec ? { ...ec, phone: e.target.value } : ec
                            )
                          }
                        />
                        <div className="edit-actions">
                          <button className="btn-secondary" onClick={cancelEdit}>
                            Cancelar
                          </button>
                          <button className="btn-confirm" onClick={saveEdit}>
                            Guardar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="contact-info">
                          <div className="contact-name">{c.name}</div>
                          <div className="contact-meta">
                            <span className="contact-id">#{c.id}</span>
                            <span className="contact-phone">{c.phone}</span>
                          </div>
                        </div>
                        <div className="contact-actions">
                          <button
                            className="icon-btn icon-btn-edit"
                            onClick={() => startEdit(c)}
                            title="Editar"
                          >
                            ✎
                          </button>
                          <button
                            className="icon-btn icon-btn-del"
                            onClick={() => removeContact(c.id)}
                            title="Eliminar"
                          >
                            ✕
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add new contact form */}
            <div className="add-form">
              <div className="add-form-title">Agregar contacto</div>
              <div className="add-form-fields">
                <input
                  className="input"
                  placeholder="Nombre completo"
                  value={newContact.name}
                  onChange={e =>
                    setNewContact(n => ({ ...n, name: e.target.value }))
                  }
                />
                <input
                  className="input input-mono"
                  placeholder="Teléfono (+54 9 11 ...)"
                  value={newContact.phone}
                  onChange={e =>
                    setNewContact(n => ({ ...n, phone: e.target.value }))
                  }
                  type="tel"
                />
              </div>
              <button
                style={{ width: "94.3%", maxWidth: 420 }}
                className="btn-add"
                onClick={addContact}
              >
                <span>+</span>
                <span>Agregar contacto</span>
              </button>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div style={{ width: 150, maxWidth: 420 }}>
          <button className="btn-primary" onClick={handleSave}>
            Guardar cambios
          </button>
        </div>
      </div>

      {/* Toast */}
      {saved && (
        <div className="toast">✓ Guardado correctamente</div>
      )}
    </>
  );
}