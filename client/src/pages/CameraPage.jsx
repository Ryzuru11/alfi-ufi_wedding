import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, Images, RefreshCw, SwitchCamera, Upload, LockKeyhole } from 'lucide-react'
import { apiUrl, readApiError } from '../services/api.js'

const TOKEN_KEY = 'wedding_tokens'

function getRemainingTokens() {
  const stored = localStorage.getItem(TOKEN_KEY)
  const count = stored === null ? 5 : Number(stored)
  return Number.isInteger(count) && count >= 0 ? count : 5
}

export default function CameraPage() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [remaining, setRemaining] = useState(getRemainingTokens)
  const [facingMode, setFacingMode] = useState('environment')
  const [cameraOn, setCameraOn] = useState(false)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!preview) return undefined
    return () => URL.revokeObjectURL(preview.url)
  }, [preview])

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
  }, [])

  async function startCamera(mode = facingMode) {
    setError('')
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Kamera tidak tersedia. Buka website melalui localhost atau HTTPS dan gunakan browser yang mendukung kamera.')
      return
    }

    try {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setFacingMode(mode)
      setCameraOn(true)
    } catch (cameraError) {
      setCameraOn(false)
      setError(cameraError.name === 'NotAllowedError'
        ? 'Izin kamera ditolak. Aktifkan izin kamera di pengaturan browser lalu coba lagi.'
        : `Kamera gagal dibuka: ${cameraError.message}`)
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraOn(false)
  }

  function capturePhoto() {
    const video = videoRef.current
    if (!video?.videoWidth || !video.videoHeight) {
      setError('Kamera belum siap. Tunggu sebentar lalu coba lagi.')
      return
    }

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      if (!blob) {
        setError('Foto gagal diproses. Silakan coba lagi.')
        return
      }
      setPreview({ blob, url: URL.createObjectURL(blob) })
      setError('')
      stopCamera()
    }, 'image/jpeg', 0.9)
  }

  async function uploadPhoto() {
    if (remaining <= 0) {
      setError('Jatah foto untuk sesi browser ini sudah habis.')
      return
    }
    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('photo', preview.blob, `alfi-ufi-${Date.now()}.jpg`)
      const response = await fetch(apiUrl('/api/photo/upload'), { method: 'POST', body: formData })
      if (!response.ok) throw new Error(await readApiError(response))
      const nextRemaining = remaining - 1
      localStorage.setItem(TOKEN_KEY, String(nextRemaining))
      setRemaining(nextRemaining)
      navigate('/thank-you')
    } catch (uploadError) {
      setError(`Foto belum berhasil dikirim: ${uploadError.message}`)
    } finally {
      setUploading(false)
    }
  }

  function retakePhoto() {
    setPreview(null)
    startCamera()
  }

  async function switchCamera() {
    await startCamera(facingMode === 'environment' ? 'user' : 'environment')
  }

  return <main className="subpage">
    <header className="subpage-header">
      <Link to="/" className="back-link"><ArrowLeft size={17}/> Home</Link>
      <span className="brand-mark"><Camera size={15}/> EVERAFTER</span>
      <Link to="/gallery" className="back-link">Gallery <Images size={17}/></Link>
    </header>
    <section className="camera-intro">
      <p className="eyebrow">YOUR MOMENT, YOUR MEMORY</p>
      <h1>Ready for your<br/><em>close-up?</em></h1>
      <p>Find your light, gather your people, and make a memory.</p>
    </section>
    <div className="camera-preview">
      {preview
        ? <img src={preview.url} alt="Pratinjau foto yang akan dikirim"/>
        : <video ref={videoRef} className={cameraOn ? '' : 'camera-video-hidden'} autoPlay playsInline muted />}
      {!cameraOn && !preview && <div className="camera-overlay">
        <Camera size={32}/>
        <strong>Abadikan momen bersama</strong>
        <span>Foto akan dibagikan ke galeri setelah berhasil diunggah.</span>
      </div>}
    </div>
    <div className="camera-actions">
      {!cameraOn && !preview && <button className="primary-btn" onClick={() => startCamera()}><Camera size={17}/> Buka kamera</button>}
      {cameraOn && <>
        <button className="primary-btn" onClick={capturePhoto}><Camera size={17}/> Ambil foto</button>
        <button className="secondary-btn" onClick={switchCamera} aria-label="Ganti kamera"><SwitchCamera size={17}/> Ganti kamera</button>
      </>}
      {preview && <>
        <button className="primary-btn" onClick={uploadPhoto} disabled={uploading || remaining === 0}>
          <Upload size={17}/>{uploading ? 'Mengirim...' : 'Kirim foto'}
        </button>
        <button className="secondary-btn" onClick={retakePhoto} disabled={uploading}><RefreshCw size={17}/> Foto ulang</button>
      </>}
      {error && <p className="camera-error" role="alert">{error}</p>}
      <span><LockKeyhole size={14}/> Sisa {remaining} dari 5 foto di browser ini</span>
    </div>
  </main>
}
