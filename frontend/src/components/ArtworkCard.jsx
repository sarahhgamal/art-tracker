import { useState } from 'react'
import { useDeleteArtwork } from '../hooks/useArtworks'

const PALETTE = {
  bg: '#0A0A0A',
  bark: '#33312F',
  charcoal: '#726E68',
  ashes: '#B7B4AE',
  cream: '#E8E4DC',
}

export default function ArtworkCard({ artwork, onEdit }) {
  const deleteMutation = useDeleteArtwork()
  const [hovered, setHovered] = useState(false)

  const handleDelete = () => {
    if (confirm(`Remove "${artwork.title}" from the archive?`)) {
      deleteMutation.mutate(artwork.id)
    }
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', cursor: 'pointer' }}
    >
      {/* Image area */}
      <div style={{
        backgroundColor: PALETTE.bark,
        overflow: 'hidden',
        position: 'relative',
      }}>
        {artwork.imageUrl ? (
          <img
            src={artwork.imageUrl}
            alt={artwork.title}
            style={{
              width: '100%',
              display: 'block',
              transition: 'transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              transform: hovered ? 'scale(1.04)' : 'scale(1)',
            }}
          />
        ) : (
          <div style={{
            height: '240px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '0.85rem',
              fontStyle: 'italic',
              color: PALETTE.charcoal,
              letterSpacing: '0.05em',
            }}>
              No image yet
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundColor: 'rgba(10,10,10,0.6)',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '1.5rem',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.35s ease',
        }}>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <button
              onClick={() => onEdit(artwork)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: "'Jost', sans-serif",
                fontSize: '0.6rem', letterSpacing: '0.18em',
                textTransform: 'uppercase', color: PALETTE.cream,
                padding: 0,
              }}
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: "'Jost', sans-serif",
                fontSize: '0.6rem', letterSpacing: '0.18em',
                textTransform: 'uppercase', color: PALETTE.charcoal,
                padding: 0,
              }}
            >
              {deleteMutation.isPending ? 'Removing...' : 'Remove'}
            </button>
          </div>
        </div>
      </div>

      {/* Caption */}
      <div style={{ paddingTop: '0.9rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h3 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1rem',
            fontWeight: 400,
            color: PALETTE.cream,
            margin: 0,
            letterSpacing: '0.02em',
          }}>
            {artwork.title}
          </h3>
          <span style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: '0.55rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: PALETTE.charcoal,
            fontWeight: 300,
          }}>
            {artwork.medium.toLowerCase()}
          </span>
        </div>
        {artwork.description && (
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '0.85rem',
            fontStyle: 'italic',
            color: PALETTE.charcoal,
            margin: '0.3rem 0 0',
            lineHeight: 1.5,
          }}>
            {artwork.description}
          </p>
        )}
      </div>
    </div>
  )
}