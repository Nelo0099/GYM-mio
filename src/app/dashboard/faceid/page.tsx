"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Upload, Camera, Trash2, User, Loader2 } from "lucide-react"
import * as faceapi from 'face-api.js'

interface FaceImage {
  filename: string
  url: string
}

export default function FaceIdSetupPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [faceImages, setFaceImages] = useState<FaceImage[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [isProcessingDescriptors, setIsProcessingDescriptors] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }

    // Load existing face images
    loadFaceImages()

    // Load face-api.js models
    loadModels()
  }, [session, status, router])

  const loadModels = async () => {
    try {
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/'

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ])

      setModelsLoaded(true)
      console.log('Face API models loaded for setup')
    } catch (error) {
      console.error('Error loading models:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los modelos de reconocimiento",
        variant: "destructive",
      })
    }
  }

  const loadFaceImages = async () => {
    try {
      const response = await fetch(`/api/faceid/images?userId=${session?.user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setFaceImages(data.faceImages || [])
      }
    } catch (error) {
      console.error('Error loading face images:', error)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Tipo de archivo inválido",
        description: "Por favor selecciona una imagen",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Archivo demasiado grande",
        description: "La imagen debe ser menor a 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('userId', session?.user?.id || '')
      formData.append('faceImage', file)

      const response = await fetch('/api/faceid/images', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Imagen subida",
          description: result.message,
        })
        loadFaceImages()

        // Extract face descriptors from the uploaded image
        await extractDescriptorsFromImage(result.url)
      } else {
        toast({
          title: "Error al subir",
          description: result.message || "Error desconocido",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Error de conexión",
        description: "No se pudo subir la imagen",
        variant: "destructive",
      })
    }

    setIsUploading(false)
  }

  const extractDescriptorsFromImage = async (imageUrl: string) => {
    if (!modelsLoaded) return

    setIsProcessingDescriptors(true)

    try {
      // Load image
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = imageUrl

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })

      // Detect faces and extract descriptors
      const detections = await faceapi
        .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors()

      if (detections.length === 1) {
        const descriptor = Array.from(detections[0].descriptor)

        // Store descriptor
        const response = await fetch('/api/faceid/descriptors', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: session?.user?.id,
            descriptors: [{
              descriptor: descriptor,
              createdAt: new Date().toISOString()
            }]
          })
        })

        if (response.ok) {
          console.log('Face descriptor extracted and stored')
        }
      } else {
        console.warn(`Expected 1 face in image, found ${detections.length}`)
      }
    } catch (error) {
      console.error('Error extracting descriptors:', error)
    }

    setIsProcessingDescriptors(false)
  }

  const captureFromCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()

        // Wait a moment for camera to stabilize
        setTimeout(async () => {
          if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current
            const video = videoRef.current

            canvas.width = video.videoWidth
            canvas.height = video.videoHeight

            const ctx = canvas.getContext('2d')
            if (ctx) {
              ctx.drawImage(video, 0, 0)

              canvas.toBlob(async (blob) => {
                if (blob) {
                  const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })

                  // Stop camera
                  stream.getTracks().forEach(track => track.stop())

                  // Upload the captured image
                  const formData = new FormData()
                  formData.append('userId', session?.user?.id || '')
                  formData.append('faceImage', file)

                  const response = await fetch('/api/faceid/images', {
                    method: 'POST',
                    body: formData,
                  })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Imagen subida",
          description: result.message,
        })

        // Mark Face ID as configured
        localStorage.setItem('faceIdSetup', 'true')

        loadFaceImages()
        await extractDescriptorsFromImage(result.url)
                  }
                }
              }, 'image/jpeg', 0.8)
            }
          }
        }, 2000)
      }
    } catch (error) {
      console.error('Camera capture error:', error)
      toast({
        title: "Error de cámara",
        description: "No se pudo acceder a la cámara",
        variant: "destructive",
      })
    }
  }

  const deleteImage = async (filename: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      return
    }

    try {
      const response = await fetch(`/api/faceid/images/${filename}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: "Imagen eliminada",
          description: "La imagen ha sido eliminada correctamente",
        })
        loadFaceImages()
      } else {
        toast({
          title: "Error al eliminar",
          description: "No se pudo eliminar la imagen",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: "Error de conexión",
        description: "No se pudo eliminar la imagen",
        variant: "destructive",
      })
    }
  }

  if (status === 'loading') return (
    <div className="min-h-screen pt-24 bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Cargando configuración de Face ID...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pt-24 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Configuración de Face ID</h1>
          <p className="text-muted-foreground">
            Sube hasta 6 fotos de tu rostro para habilitar el login facial
          </p>
        </div>

        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Subir Imágenes de Rostro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>• Sube fotos claras de tu rostro desde diferentes ángulos</p>
                <p>• Usa buena iluminación y evita accesorios que cubran tu rostro</p>
                <p>• Máximo 6 imágenes por usuario</p>
                <p>• Formatos aceptados: JPG, PNG (máx. 5MB)</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading || faceImages.length >= 6}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/80"
                  />
                </div>
                <Button
                  onClick={captureFromCamera}
                  disabled={faceImages.length >= 6}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Tomar Foto
                </Button>
              </div>

              {isUploading && (
                <div className="text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Subiendo imagen...</p>
                </div>
              )}

              {isProcessingDescriptors && (
                <div className="text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Procesando descriptores faciales...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Hidden video and canvas for camera capture */}
        <video ref={videoRef} className="hidden" />
        <canvas ref={canvasRef} className="hidden" />

        {/* Images Gallery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Tus Imágenes de Rostro ({faceImages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {faceImages.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay imágenes aún</h3>
                <p className="text-muted-foreground mb-4">
                  Sube algunas fotos de tu rostro para habilitar el login facial
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {faceImages.map((image) => (
                  <div key={image.filename} className="relative group">
                    <img
                      src={image.url}
                      alt="Face image"
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteImage(image.filename)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Placeholder for remaining slots */}
                {Array.from({ length: 6 - faceImages.length }).map((_, index) => (
                  <div key={`placeholder-${index}`} className="w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Imagen {faceImages.length + index + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {faceImages.length >= 6 && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Has alcanzado el límite máximo de 6 imágenes. Para mejores resultados,
                  considera reemplazar algunas imágenes con fotos más recientes o desde diferentes ángulos.
                </p>
              </div>
            )}

            {faceImages.length >= 3 && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ Tienes suficientes imágenes para un buen reconocimiento facial.
                  El sistema Face ID está listo para usar.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-8 flex justify-center">
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            Volver al Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}