import { useState } from 'react'
import { useSessions, useCreateSession, useUpdateSession, useDeleteSession } from '../hooks/useSessions'
import { useArtworks } from '../hooks/useArtworks'
import { useTags } from '../hooks/useTags'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const PALETTE = {
    bg: '#0A0A0A',
    bark: '#33312F',
    charcoal: '#726E68',
    ashes: '#B7B4AE',
    cream: '#E8E4DC',
}

const emptyForm = { duration: '', date: new Date().toISOString().split('T')[0], notes: '', artworkId: '', tagIds: [] }

function formatDuration(minutes) {
    if (minutes < 60) return `${minutes}m`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export default function Sessions() {
    const { logout, user } = useAuth()
    const navigate = useNavigate()
    const [showModal, setShowModal] = useState(false)
    const [editingSession, setEditingSession] = useState(null)
    const [form, setForm] = useState(emptyForm)
    const [formError, setFormError] = useState('')
    const [menuOpen, setMenuOpen] = useState(false)

    const { data: sessions = [], isLoading } = useSessions()
    const { data: artworks = [] } = useArtworks()
    const { data: tags = [] } = useTags()
    const createMutation = useCreateSession()
    const updateMutation = useUpdateSession()
    const deleteMutation = useDeleteSession()

    const openCreate = () => {
        setEditingSession(null)
        setForm(emptyForm)
        setFormError('')
        setShowModal(true)
    }

    const openEdit = (session) => {
        setEditingSession(session)
        setForm({
            duration: session.duration,
            date: session.date,
            notes: session.notes || '',
            artworkId: session.artworkId || '',
            tagIds: session.tags ? session.tags.map(t => t.id) : [],
        })
        setFormError('')
        setShowModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setFormError('')
        const payload = {
            ...form,
            duration: parseInt(form.duration),
            artworkId: form.artworkId ? parseInt(form.artworkId) : null,
        }
        try {
            if (editingSession) {
                await updateMutation.mutateAsync({ id: editingSession.id, data: payload })
            } else {
                await createMutation.mutateAsync(payload)
            }
            setShowModal(false)
        } catch (err) {
            setFormError(err.response?.data?.error || 'Something went wrong')
        }
    }

    const toggleTag = (tagId) => {
        setForm(prev => ({
            ...prev,
            tagIds: prev.tagIds.includes(tagId)
                ? prev.tagIds.filter(id => id !== tagId)
                : [...prev.tagIds, tagId]
        }))
    }

    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0)
    const isPending = createMutation.isPending || updateMutation.isPending

    const inputStyle = {
        width: '100%', background: 'transparent', border: 'none',
        borderBottom: '1px solid rgba(183,180,174,0.25)',
        color: PALETTE.cream, fontFamily: "'Jost', sans-serif",
        fontSize: '0.9rem', fontWeight: 300,
        padding: '0.5rem 0', outline: 'none', boxSizing: 'border-box',
    }

    const labelStyle = {
        display: 'block', fontSize: '0.6rem', letterSpacing: '0.18em',
        textTransform: 'uppercase', color: PALETTE.charcoal,
        marginBottom: '0.6rem', fontFamily: "'Jost', sans-serif",
    }

    return (
        <div style={{ backgroundColor: PALETTE.bg, minHeight: '100vh', fontFamily: "'Jost', sans-serif", color: PALETTE.ashes }}>

            {/* ── Navbar ── */}
            <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0 3rem', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(183,180,174,0.08)' }}>
                <span onClick={() => navigate('/')} style={{ fontFamily: "'Cormorant SC', serif", fontSize: '1.1rem', letterSpacing: '0.2em', color: PALETTE.cream, fontWeight: 300, cursor: 'pointer' }}>
                    ATELIER
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <span style={{ fontSize: '0.6rem', letterSpacing: '0.18em', color: PALETTE.charcoal, textTransform: 'uppercase' }}>{user?.username}</span>
                    <button onClick={openCreate} style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: PALETTE.ashes, background: 'none', border: '1px solid rgba(183,180,174,0.3)', padding: '0.4rem 1rem', cursor: 'pointer', fontFamily: "'Jost', sans-serif" }}
                        onMouseEnter={e => { e.target.style.borderColor = PALETTE.ashes; e.target.style.color = PALETTE.cream }}
                        onMouseLeave={e => { e.target.style.borderColor = 'rgba(183,180,174,0.3)'; e.target.style.color = PALETTE.ashes }}>
                        Log Session
                    </button>
                    <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <span style={{ display: 'block', width: '22px', height: '1px', backgroundColor: PALETTE.ashes, transition: 'all 0.3s ease', transform: menuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
                        <span style={{ display: 'block', width: '22px', height: '1px', backgroundColor: PALETTE.ashes, opacity: menuOpen ? 0 : 1, transition: 'all 0.3s ease' }} />
                        <span style={{ display: 'block', width: '22px', height: '1px', backgroundColor: PALETTE.ashes, transition: 'all 0.3s ease', transform: menuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
                    </button>
                </div>
            </nav>

            {/* ── Slide-in menu ── */}
            <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '320px', backgroundColor: PALETTE.bark, zIndex: 99, transform: menuOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.5s cubic-bezier(0.76, 0, 0.24, 1)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem 3rem' }}>
                {[['Gallery', '/'], ['Sessions', '/sessions'], ['Goals', '/goals'], ['Calendar', '/calendar']].map(([label, path], i) => (
                    <div key={label} style={{ padding: '1.2rem 0', borderBottom: '1px solid rgba(183,180,174,0.1)' }}>
                        <span onClick={() => { navigate(path); setMenuOpen(false) }} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 300, color: PALETTE.cream, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '0.65rem', color: PALETTE.charcoal, fontFamily: "'Jost', sans-serif" }}>0{i + 1}</span>
                            {label}
                        </span>
                    </div>
                ))}
                <button onClick={() => { logout(); setMenuOpen(false) }} style={{ marginTop: '2rem', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: PALETTE.charcoal, textAlign: 'left', padding: 0 }}>Sign Out</button>
            </div>
            {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 98, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />}

            {/* ── Hero ── */}
            <section style={{ minHeight: '45vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 3rem 4rem', borderBottom: '1px solid rgba(183,180,174,0.08)' }}>
                <div style={{ paddingTop: '120px' }}>
                    <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: PALETTE.charcoal, marginBottom: '1.5rem' }}>Practice Log</p>
                    <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(3rem, 7vw, 6rem)', fontWeight: 300, lineHeight: 0.9, color: PALETTE.cream, margin: 0 }}>
                        The<br /><em style={{ fontStyle: 'italic', color: PALETTE.ashes }}>Sessions</em>
                    </h1>
                    {sessions.length > 0 && (
                        <div style={{ marginTop: '2.5rem', display: 'flex', gap: '3rem' }}>
                            <div>
                                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem', fontWeight: 300, color: PALETTE.cream, margin: 0 }}>{sessions.length}</p>
                                <p style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: PALETTE.charcoal, margin: '0.3rem 0 0' }}>Sessions</p>
                            </div>
                            <div>
                                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem', fontWeight: 300, color: PALETTE.cream, margin: 0 }}>{formatDuration(totalMinutes)}</p>
                                <p style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: PALETTE.charcoal, margin: '0.3rem 0 0' }}>Total Practice</p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ── Session list ── */}
            <section style={{ padding: '4rem 3rem 8rem', maxWidth: '900px' }}>
                {isLoading && <p style={{ color: PALETTE.charcoal, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Loading...</p>}

                {!isLoading && sessions.length === 0 && (
                    <div style={{ paddingTop: '4rem' }}>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 300, color: PALETTE.charcoal, fontStyle: 'italic' }}>No sessions logged yet.</p>
                        <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: PALETTE.bark, marginTop: '1rem' }}>Start tracking your practice</p>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {sessions.map((session, i) => (
                        <div key={session.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: '2rem', padding: '2rem 0', borderBottom: '1px solid rgba(183,180,174,0.08)', alignItems: 'start' }}>
                            {/* Date */}
                            <div>
                                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: PALETTE.cream, margin: 0 }}>
                                    {new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                </p>
                                <p style={{ fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: PALETTE.charcoal, margin: '0.2rem 0 0' }}>
                                    {new Date(session.date + 'T00:00:00').getFullYear()}
                                </p>
                            </div>

                            {/* Details */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '0.5rem' }}>
                                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 300, color: PALETTE.cream }}>
                                        {formatDuration(session.duration)}
                                    </span>
                                    {session.artworkTitle && (
                                        <span style={{ fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: PALETTE.charcoal }}>
                                            — {session.artworkTitle}
                                        </span>
                                    )}
                                </div>
                                {session.notes && (
                                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.95rem', fontStyle: 'italic', color: PALETTE.charcoal, margin: '0 0 0.6rem', lineHeight: 1.6 }}>
                                        {session.notes}
                                    </p>
                                )}
                                {session.tags && session.tags.length > 0 && (
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {session.tags.map(tag => (
                                            <span key={tag.id} style={{ fontSize: '0.5rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: PALETTE.charcoal, border: '1px solid rgba(183,180,174,0.15)', padding: '0.2rem 0.6rem' }}>
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => openEdit(session)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '0.55rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: PALETTE.charcoal }}>Edit</button>
                                <button onClick={() => { if (confirm('Remove this session?')) deleteMutation.mutate(session.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '0.55rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: PALETTE.kite }}>Remove</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Modal ── */}
            {showModal && (
                <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div onClick={e => e.stopPropagation()} style={{ backgroundColor: PALETTE.bark, width: '100%', maxWidth: '520px', padding: '2rem 2.5rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                        <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: PALETTE.charcoal, fontSize: '1.2rem', lineHeight: 1 }}>×</button>

                        <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: PALETTE.charcoal, marginBottom: '0.5rem' }}>
                            {editingSession ? 'Edit' : 'New'} Session
                        </p>
                        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 300, color: PALETTE.cream, margin: '0 0 1.5rem' }}>
                            {editingSession ? 'Update Session' : 'Log Practice'}
                        </h2>

                        {formError && <p style={{ color: '#c0392b', fontSize: '0.75rem', marginBottom: '1rem' }}>{formError}</p>}

                        <form onSubmit={handleSubmit}>
                            {/* Duration */}
                            <div style={{ marginBottom: '1.2rem' }}>
                                <label style={labelStyle}>Duration (minutes)</label>
                                <input type="number" required min="1" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} style={inputStyle}
                                    onFocus={e => e.target.style.borderBottomColor = PALETTE.ashes}
                                    onBlur={e => e.target.style.borderBottomColor = 'rgba(183,180,174,0.25)'} />
                            </div>

                            {/* Date */}
                            <div style={{ marginBottom: '1.2rem' }}>
                                <label style={labelStyle}>Date</label>
                                <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                                    style={{ ...inputStyle, colorScheme: 'dark' }}
                                    onFocus={e => e.target.style.borderBottomColor = PALETTE.ashes}
                                    onBlur={e => e.target.style.borderBottomColor = 'rgba(183,180,174,0.25)'} />
                            </div>

                            {/* Linked artwork */}
                            {artworks.length > 0 && (
                                <div style={{ marginBottom: '1.2rem' }}>
                                    <label style={labelStyle}>Linked Artwork (optional)</label>
                                    <select value={form.artworkId} onChange={e => setForm({ ...form, artworkId: e.target.value })} style={{ ...inputStyle, background: PALETTE.bark, cursor: 'pointer' }}>
                                        <option value="" style={{ backgroundColor: PALETTE.bark }}>None</option>
                                        {artworks.map(a => <option key={a.id} value={a.id} style={{ backgroundColor: PALETTE.bark }}>{a.title}</option>)}
                                    </select>
                                </div>
                            )}

                            {/* Tags */}
                            {tags.length > 0 && (
                                <div style={{ marginBottom: '1.2rem' }}>
                                    <label style={labelStyle}>Tags</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {tags.map(tag => (
                                            <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)} style={{ background: 'none', border: `1px solid ${form.tagIds.includes(tag.id) ? PALETTE.ashes : 'rgba(183,180,174,0.2)'}`, color: form.tagIds.includes(tag.id) ? PALETTE.cream : PALETTE.charcoal, fontFamily: "'Jost', sans-serif", fontSize: '0.55rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.3rem 0.8rem', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                                                {tag.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={labelStyle}>Notes (optional)</label>
                                <textarea rows={4} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ ...inputStyle, fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', resize: 'none', lineHeight: 1.6 }}
                                    onFocus={e => e.target.style.borderBottomColor = PALETTE.ashes}
                                    onBlur={e => e.target.style.borderBottomColor = 'rgba(183,180,174,0.25)'} />
                            </div>

                            <button type="submit" disabled={isPending} style={{ width: '100%', background: 'transparent', border: '1px solid rgba(183,180,174,0.4)', color: PALETTE.cream, fontFamily: "'Jost', sans-serif", fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '1rem', cursor: 'pointer', transition: 'all 0.3s ease', opacity: isPending ? 0.5 : 1 }}
                                onMouseEnter={e => { e.target.style.backgroundColor = PALETTE.charcoal; e.target.style.borderColor = PALETTE.charcoal }}
                                onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.borderColor = 'rgba(183,180,174,0.4)' }}>
                                {isPending ? 'Saving...' : editingSession ? 'Update Session' : 'Log Session'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}