import { useState, useEffect } from 'react'
import ArtworkCard from '../components/ArtworkCard'
import { useArtworks, useCreateArtwork, useUpdateArtwork, useUploadArtworkImage } from '../hooks/useArtworks'
import { useTags, useCreateTag, useDeleteTag } from '../hooks/useTags'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const MEDIUMS = ['WATERCOLOR', 'PENCIL', 'DIGITAL', 'INK', 'OIL', 'CHARCOAL', 'OTHER']
const emptyForm = { title: '', medium: 'PENCIL', description: '', imageUrl: '', tagIds: [] }

const PALETTE = {
    bg: '#0A0A0A',
    bark: '#33312F',
    charcoal: '#726E68',
    ashes: '#B7B4AE',
    kite: '#371E1E',
    cream: '#E8E4DC',
}


export default function Gallery() {
    const { logout, user } = useAuth()
    const navigate = useNavigate()
    const [mediumFilter, setMediumFilter] = useState(null)
    const [tagFilter, setTagFilter] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [showTagManager, setShowTagManager] = useState(false)
    const [editingArtwork, setEditingArtwork] = useState(null)
    const [form, setForm] = useState(emptyForm)
    const [formError, setFormError] = useState('')
    const [menuOpen, setMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [pendingFile, setPendingFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [newTagName, setNewTagName] = useState('')

    const { data: artworks = [], isLoading } = useArtworks(mediumFilter, tagFilter)
    const { data: tags = [] } = useTags()
    const createMutation = useCreateArtwork()
    const updateMutation = useUpdateArtwork()
    const uploadMutation = useUploadArtworkImage()
    const createTagMutation = useCreateTag()
    const deleteTagMutation = useDeleteTag()

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const openCreate = () => {
        setEditingArtwork(null)
        setForm(emptyForm)
        setFormError('')
        setPendingFile(null)
        setPreviewUrl(null)
        setShowModal(true)
        setMenuOpen(false)
    }

    const openEdit = (artwork) => {
        setEditingArtwork(artwork)
        setForm({
            title: artwork.title,
            medium: artwork.medium,
            description: artwork.description || '',
            imageUrl: artwork.imageUrl || '',
            tagIds: artwork.tags ? artwork.tags.map(t => t.id) : [],
        })
        setFormError('')
        setPendingFile(null)
        setPreviewUrl(artwork.imageUrl || null)
        setShowModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setFormError('')
        try {
            let savedArtwork
            if (editingArtwork) {
                savedArtwork = await updateMutation.mutateAsync({ id: editingArtwork.id, data: form })
            } else {
                savedArtwork = await createMutation.mutateAsync(form)
            }
            if (pendingFile) {
                await uploadMutation.mutateAsync({ id: savedArtwork.id, file: pendingFile })
            }
            setShowModal(false)
            setPendingFile(null)
            setPreviewUrl(null)
        } catch (err) {
            setFormError(err.response?.data?.error || 'Something went wrong')
        }
    }

    const handleCreateTag = async (e) => {
        e.preventDefault()
        if (!newTagName.trim()) return
        try {
            await createTagMutation.mutateAsync({ name: newTagName.trim() })
            setNewTagName('')
        } catch (err) {
            // tag already exists — ignore
        }
    }

    const toggleTagOnForm = (tagId) => {
        setForm(prev => ({
            ...prev,
            tagIds: prev.tagIds.includes(tagId)
                ? prev.tagIds.filter(id => id !== tagId)
                : [...prev.tagIds, tagId]
        }))
    }

    const isPending = createMutation.isPending || updateMutation.isPending || uploadMutation.isPending

    return (
        <div style={{ backgroundColor: PALETTE.bg, minHeight: '100vh', fontFamily: "'Jost', sans-serif", color: PALETTE.ashes }}>

            {/* ── Navbar ── */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                padding: '0 3rem', height: '72px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                backgroundColor: scrolled ? 'rgba(10,10,10,0.92)' : 'transparent',
                backdropFilter: scrolled ? 'blur(12px)' : 'none',
                transition: 'background-color 0.4s ease',
                borderBottom: scrolled ? '1px solid rgba(183,180,174,0.08)' : '1px solid transparent',
            }}>
                <span style={{ fontFamily: "'Cormorant SC', serif", fontSize: '1.1rem', letterSpacing: '0.2em', color: PALETTE.cream, fontWeight: 300 }}>
                    ATELIER
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <span style={{ fontSize: '0.6rem', letterSpacing: '0.18em', color: PALETTE.charcoal, fontWeight: 300, textTransform: 'uppercase' }}>
                        {user?.username}
                    </span>
                    <button onClick={openCreate} style={{
                        fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase',
                        color: PALETTE.ashes, background: 'none',
                        border: '1px solid rgba(183,180,174,0.3)', padding: '0.4rem 1rem',
                        cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontWeight: 300,
                        transition: 'all 0.3s ease',
                    }}
                        onMouseEnter={e => { e.target.style.borderColor = PALETTE.ashes; e.target.style.color = PALETTE.cream }}
                        onMouseLeave={e => { e.target.style.borderColor = 'rgba(183,180,174,0.3)'; e.target.style.color = PALETTE.ashes }}
                    >
                        Add Work
                    </button>
                    <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <span style={{ display: 'block', width: '22px', height: '1px', backgroundColor: PALETTE.ashes, transition: 'all 0.3s ease', transform: menuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
                        <span style={{ display: 'block', width: '22px', height: '1px', backgroundColor: PALETTE.ashes, transition: 'all 0.3s ease', opacity: menuOpen ? 0 : 1 }} />
                        <span style={{ display: 'block', width: '22px', height: '1px', backgroundColor: PALETTE.ashes, transition: 'all 0.3s ease', transform: menuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
                    </button>
                </div>
            </nav>

            {/* ── Slide-in menu ── */}
            <div style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, width: '320px',
                backgroundColor: PALETTE.bark, zIndex: 99,
                transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.5s cubic-bezier(0.76, 0, 0.24, 1)',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                padding: '4rem 3rem',
            }}>
                {[['Gallery', '/'], ['Sessions', '/sessions'], ['Goals', '/goals'], ['Calendar', '/calendar']].map(([label, path], i) => (
                  <div key={label} style={{ padding: '1.2rem 0', borderBottom: '1px solid rgba(183,180,174,0.1)' }}>
                      <span onClick={() => { navigate(path); setMenuOpen(false) }} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 300, color: PALETTE.cream, letterSpacing: '0.05em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontSize: '0.65rem', color: PALETTE.charcoal, fontFamily: "'Jost', sans-serif", letterSpacing: '0.1em' }}>0{i + 1}</span>
                          {label}
                      </span>
                  </div>
              ))}
                <button onClick={() => setShowTagManager(true)} style={{
                    marginTop: '2rem', background: 'none', border: '1px solid rgba(183,180,174,0.2)',
                    cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '0.6rem',
                    letterSpacing: '0.18em', textTransform: 'uppercase', color: PALETTE.charcoal,
                    padding: '0.7rem 1rem', textAlign: 'left',
                }}>
                    Manage Tags
                </button>
                <button onClick={() => { logout(); setMenuOpen(false) }} style={{
                    marginTop: '1rem', background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: "'Jost', sans-serif", fontSize: '0.6rem', letterSpacing: '0.18em',
                    textTransform: 'uppercase', color: PALETTE.charcoal, textAlign: 'left', padding: 0,
                }}>
                    Sign Out
                </button>
            </div>

            {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 98, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />}

            {/* ── Hero ── */}
            <section style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 3rem 4rem', borderBottom: '1px solid rgba(183,180,174,0.08)' }}>
                <div style={{ paddingTop: '120px' }}>
                    <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: PALETTE.charcoal, marginBottom: '1.5rem', fontWeight: 300 }}>
                        Personal Collection
                    </p>
                    <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(3.5rem, 8vw, 7rem)', fontWeight: 300, lineHeight: 0.9, letterSpacing: '-0.02em', color: PALETTE.cream, margin: 0 }}>
                        The<br /><em style={{ fontStyle: 'italic', color: PALETTE.ashes }}>Archive</em>
                    </h1>
                    <p style={{ marginTop: '2rem', fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', fontWeight: 300, color: PALETTE.charcoal, letterSpacing: '0.05em', maxWidth: '360px', lineHeight: 1.7 }}>
                        A curated record of the artistic journey — each work a mark in time.
                    </p>
                </div>
            </section>

            {/* ── Filter bar — mediums ── */}
            <section style={{ padding: '3rem 3rem 0' }}>
                <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap', borderBottom: '1px solid rgba(183,180,174,0.1)', paddingBottom: 0 }}>
                    {[{ label: 'All', value: null }, ...MEDIUMS.map(m => ({ label: m.charAt(0) + m.slice(1).toLowerCase(), value: m }))].map(({ label, value }) => (
                        <button key={label} onClick={() => setMediumFilter(value)} style={{
                            background: 'none', border: 'none',
                            borderBottom: mediumFilter === value ? `1px solid ${PALETTE.ashes}` : '1px solid transparent',
                            color: mediumFilter === value ? PALETTE.cream : PALETTE.charcoal,
                            fontFamily: "'Jost', sans-serif", fontSize: '0.65rem', letterSpacing: '0.18em',
                            textTransform: 'uppercase', padding: '1rem 1.5rem', cursor: 'pointer',
                            transition: 'all 0.25s ease', marginBottom: '-1px',
                            fontWeight: mediumFilter === value ? 400 : 300,
                        }}>
                            {label}
                        </button>
                    ))}
                </div>
            </section>

            {/* ── Tag filter pills ── */}
            {tags.length > 0 && (
                <section style={{ padding: '1.5rem 3rem 0', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    {tags.map(tag => (
                        <button key={tag.id} onClick={() => setTagFilter(tagFilter === tag.id ? null : tag.id)} style={{
                            background: 'none',
                            border: `1px solid ${tagFilter === tag.id ? PALETTE.ashes : 'rgba(183,180,174,0.2)'}`,
                            color: tagFilter === tag.id ? PALETTE.cream : PALETTE.charcoal,
                            fontFamily: "'Jost', sans-serif", fontSize: '0.55rem',
                            letterSpacing: '0.15em', textTransform: 'uppercase',
                            padding: '0.35rem 0.9rem', cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}>
                            {tag.name}
                        </button>
                    ))}
                </section>
            )}

            {/* ── Gallery grid ── */}
            <section style={{ padding: '4rem 3rem 8rem' }}>
                {isLoading && <p style={{ color: PALETTE.charcoal, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Loading...</p>}
                {!isLoading && artworks.length === 0 && (
                    <div style={{ paddingTop: '6rem', textAlign: 'center' }}>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 300, color: PALETTE.charcoal, fontStyle: 'italic' }}>The archive is empty.</p>
                        <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: PALETTE.bark, marginTop: '1rem' }}>Add your first work to begin</p>
                    </div>
                )}
                <div style={{ columns: 'auto 280px', columnGap: '1.5rem' }}>
                    {artworks.map(artwork => (
                        <div key={artwork.id} style={{ breakInside: 'avoid', marginBottom: '1.5rem' }}>
                            <ArtworkCard artwork={artwork} onEdit={openEdit} />
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Add/Edit Artwork Modal ── */}
            {showModal && (
                <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div onClick={e => e.stopPropagation()} style={{ backgroundColor: PALETTE.bark, width: '100%', maxWidth: '520px', padding: '2rem 2.5rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                        <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: PALETTE.charcoal, fontSize: '1.2rem', lineHeight: 1 }}>×</button>

                        <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: PALETTE.charcoal, marginBottom: '0.5rem' }}>
                            {editingArtwork ? 'Edit Work' : 'New Work'}
                        </p>
                        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 300, color: PALETTE.cream, margin: '0 0 1.5rem' }}>
                            {editingArtwork ? editingArtwork.title : 'Add to Archive'}
                        </h2>

                        {formError && <p style={{ color: '#c0392b', fontSize: '0.75rem', marginBottom: '1.5rem' }}>{formError}</p>}

                        <form onSubmit={handleSubmit}>
                            {/* Title */}
                            <div style={{ marginBottom: '1.2rem' }}>
                                <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: PALETTE.charcoal, marginBottom: '0.6rem', fontFamily: "'Jost', sans-serif" }}>Title</label>
                                <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(183,180,174,0.25)', color: PALETTE.cream, fontFamily: "'Jost', sans-serif", fontSize: '0.9rem', fontWeight: 300, padding: '0.5rem 0', outline: 'none', boxSizing: 'border-box' }}
                                    onFocus={e => e.target.style.borderBottomColor = PALETTE.ashes}
                                    onBlur={e => e.target.style.borderBottomColor = 'rgba(183,180,174,0.25)'} />
                            </div>

                            {/* Image upload */}
                            <div style={{ marginBottom: '1.2rem' }}>
                                <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: PALETTE.charcoal, marginBottom: '0.6rem', fontFamily: "'Jost', sans-serif" }}>Image</label>
                                {previewUrl && <img src={previewUrl} alt="preview" style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', marginBottom: '0.8rem' }} />}
                                <label style={{ display: 'inline-block', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: PALETTE.ashes, border: '1px solid rgba(183,180,174,0.25)', padding: '0.6rem 1.2rem', cursor: 'pointer', fontFamily: "'Jost', sans-serif" }}>
                                    {pendingFile ? pendingFile.name : previewUrl ? 'Change Image' : 'Choose File'}
                                    <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={e => { const file = e.target.files[0]; if (file) { setPendingFile(file); setPreviewUrl(URL.createObjectURL(file)) } }} />
                                </label>
                                {pendingFile && <span style={{ marginLeft: '1rem', fontSize: '0.6rem', color: PALETTE.charcoal, fontFamily: "'Jost', sans-serif" }}>Ready to upload</span>}
                            </div>

                            {/* Medium */}
                            <div style={{ marginBottom: '1.2rem' }}>
                                <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: PALETTE.charcoal, marginBottom: '0.6rem', fontFamily: "'Jost', sans-serif" }}>Medium</label>
                                <select value={form.medium} onChange={e => setForm({ ...form, medium: e.target.value })} style={{ width: '100%', background: PALETTE.bark, border: 'none', borderBottom: '1px solid rgba(183,180,174,0.25)', color: PALETTE.cream, fontFamily: "'Jost', sans-serif", fontSize: '0.9rem', fontWeight: 300, padding: '0.5rem 0', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}>
                                    {MEDIUMS.map(m => <option key={m} value={m} style={{ backgroundColor: PALETTE.bark }}>{m.charAt(0) + m.slice(1).toLowerCase()}</option>)}
                                </select>
                            </div>

                            {/* Tags */}
                            {tags.length > 0 && (
                                <div style={{ marginBottom: '1.2rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: PALETTE.charcoal, marginBottom: '0.6rem', fontFamily: "'Jost', sans-serif" }}>Tags</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {tags.map(tag => (
                                            <button key={tag.id} type="button" onClick={() => toggleTagOnForm(tag.id)} style={{
                                                background: 'none',
                                                border: `1px solid ${form.tagIds.includes(tag.id) ? PALETTE.ashes : 'rgba(183,180,174,0.2)'}`,
                                                color: form.tagIds.includes(tag.id) ? PALETTE.cream : PALETTE.charcoal,
                                                fontFamily: "'Jost', sans-serif", fontSize: '0.55rem',
                                                letterSpacing: '0.12em', textTransform: 'uppercase',
                                                padding: '0.3rem 0.8rem', cursor: 'pointer', transition: 'all 0.2s ease',
                                            }}>
                                                {tag.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: PALETTE.charcoal, marginBottom: '0.6rem', fontFamily: "'Jost', sans-serif" }}>Notes (optional)</label>
                                <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(183,180,174,0.25)', color: PALETTE.cream, fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', fontWeight: 300, padding: '0.5rem 0', outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: 1.6 }}
                                    onFocus={e => e.target.style.borderBottomColor = PALETTE.ashes}
                                    onBlur={e => e.target.style.borderBottomColor = 'rgba(183,180,174,0.25)'} />
                            </div>

                            <button type="submit" disabled={isPending} style={{ width: '100%', background: 'transparent', border: '1px solid rgba(183,180,174,0.4)', color: PALETTE.cream, fontFamily: "'Jost', sans-serif", fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '1rem', cursor: 'pointer', transition: 'all 0.3s ease', opacity: isPending ? 0.5 : 1 }}
                                onMouseEnter={e => { e.target.style.backgroundColor = PALETTE.charcoal; e.target.style.borderColor = PALETTE.charcoal }}
                                onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.borderColor = 'rgba(183,180,174,0.4)' }}>
                                {isPending ? (uploadMutation.isPending ? 'Uploading...' : 'Saving...') : editingArtwork ? 'Save Changes' : 'Add to Archive'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Tag Manager Modal ── */}
            {showTagManager && (
                <div onClick={() => setShowTagManager(false)} style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div onClick={e => e.stopPropagation()} style={{ backgroundColor: PALETTE.bark, width: '100%', maxWidth: '420px', padding: '2rem 2.5rem', position: 'relative', maxHeight: '80vh', overflowY: 'auto' }}>
                        <button onClick={() => setShowTagManager(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: PALETTE.charcoal, fontSize: '1.2rem', lineHeight: 1 }}>×</button>

                        <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: PALETTE.charcoal, marginBottom: '0.5rem' }}>System</p>
                        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 300, color: PALETTE.cream, margin: '0 0 2rem' }}>Tags</h2>

                        {/* Create tag */}
                        <form onSubmit={handleCreateTag} style={{ display: 'flex', gap: '0.8rem', marginBottom: '2rem' }}>
                            <input
                                value={newTagName}
                                onChange={e => setNewTagName(e.target.value)}
                                placeholder="new tag..."
                                style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: '1px solid rgba(183,180,174,0.25)', color: PALETTE.cream, fontFamily: "'Jost', sans-serif", fontSize: '0.85rem', fontWeight: 300, padding: '0.5rem 0', outline: 'none' }}
                            />
                            <button type="submit" style={{ background: 'none', border: '1px solid rgba(183,180,174,0.3)', color: PALETTE.ashes, fontFamily: "'Jost', sans-serif", fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.4rem 0.8rem', cursor: 'pointer' }}>
                                Add
                            </button>
                        </form>

                        {/* Tag list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {tags.length === 0 && <p style={{ color: PALETTE.charcoal, fontSize: '0.8rem', fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif" }}>No tags yet.</p>}
                            {tags.map(tag => (
                                <div key={tag.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 0', borderBottom: '1px solid rgba(183,180,174,0.08)' }}>
                                    <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '0.75rem', letterSpacing: '0.1em', color: PALETTE.ashes }}>{tag.name}</span>
                                    <button onClick={() => deleteTagMutation.mutate(tag.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: PALETTE.charcoal, fontFamily: "'Jost', sans-serif", fontSize: '0.55rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}