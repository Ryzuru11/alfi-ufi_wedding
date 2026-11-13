import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Heart, Images, RefreshCw } from 'lucide-react'
import { apiUrl, readApiError } from '../services/api.js'

export default function GalleryPage() {
  const [photos, setPhotos] = useState([])
  const [nextPageToken, setNextPageToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadPhotos = useCallback(async (pageToken, append = false, showLoading = true) => {
    if (showLoading) setLoading(true)
    setError('')
    try {
      const query = pageToken ? `?pageToken=${encodeURIComponent(pageToken)}` : ''
      const response = await fetch(apiUrl(`/api/photo/gallery${query}`))
      if (!response.ok) throw new Error(await readApiError(response))
      const result = await response.json()
      setPhotos((current) => append ? [...current, ...result.photos] : result.photos)
      setNextPageToken(result.nextPageToken)
    } catch (fetchError) {
      setError(`Galeri gagal dimuat: ${fetchError.message}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPhotos()
  }, [loadPhotos])

  useEffect(() => {
    const intervalId = window.setInterval(() => loadPhotos(undefined, false, false), 15000)
    return () => window.clearInterval(intervalId)
  }, [loadPhotos])

  return <main className="subpage">
    <header className="subpage-header">
      <Link to="/" className="back-link"><ArrowLeft size={17}/> Home</Link>
      <span className="brand-mark"><Heart size={15}/> EVERAFTER</span>
      <span className="back-link">GUEST GALLERY</span>
    </header>
    <section className="gallery-heading">
      <p className="eyebrow">LITTLE MOMENTS, BIG MEMORIES</p>
      <h1>Our day, through<br/><em>your eyes.</em></h1>
      <p>Every photo tells a story. Photos shared by guests appear here.</p>
      <button className="secondary-btn gallery-refresh" onClick={() => loadPhotos()} disabled={loading}>
        <RefreshCw size={15}/> Perbarui galeri
      </button>
    </section>
    {error && <div className="gallery-message gallery-error" role="alert">
      <span>{error}</span><button className="secondary-btn" onClick={() => loadPhotos()}><RefreshCw size={15}/> Coba lagi</button>
    </div>}
    {!error && loading && <p className="gallery-message">Memuat foto...</p>}
    {!error && !loading && photos.length === 0 && <p className="gallery-message">Belum ada foto. Jadilah yang pertama membagikan momen!</p>}
    {photos.length > 0 && <div className="gallery-grid">
      {photos.map((photo, index) => <a className="gallery-tile" key={photo.id} href={apiUrl(photo.imageUrl)} target="_blank" rel="noreferrer">
        <img src={apiUrl(photo.imageUrl)} alt={`Foto pernikahan dari tamu ${index + 1}`} loading="lazy"/>
        <span>{new Date(photo.createdTime).toLocaleString('id-ID')}</span>
      </a>)}
    </div>}
    {nextPageToken && !error && <div className="gallery-load-more">
      <button className="secondary-btn" onClick={() => loadPhotos(nextPageToken, true)} disabled={loading}>
        <Images size={16}/>{loading ? 'Memuat...' : 'Muat foto lainnya'}
      </button>
    </div>}
    {!error && <p className="gallery-footnote"><Images size={15}/> Foto disimpan di Google Drive dan dapat dilihat oleh semua tamu.</p>}
  </main>
}
