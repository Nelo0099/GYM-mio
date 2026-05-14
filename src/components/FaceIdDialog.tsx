"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Camera, CheckCircle, Loader2, User, XCircle } from "lucide-react"

interface FaceIdDialogProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (user: any) => void
}

type StoredDescriptor = {
  descriptor: unknown[]
  createdAt: Date
}

type RecognitionResult = {
  success: boolean
  message: string
  confidence: number
  userId?: string
}

export function FaceIdDialog({ isOpen, onClose, onLogin }: FaceIdDialogProps) {
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [storedDescriptors, setStoredDescriptors] = useState<StoredDescriptor[]>([])

  useEffect(() => {
    if (isOpen && !modelsLoaded) {
      loadModels()
    }
  }, [isOpen, modelsLoaded])

  useEffect(() => {
    if (isOpen && modelsLoaded) {
      loadUserDescriptors()
    }
  }, [isOpen, modelsLoaded])

  const loadModels = async () => {
    try {
      console.log("Loading mock face recognition models...")
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setModelsLoaded(true)
      console.log("Mock Face API models loaded successfully")
    } catch (error) {
      console.error("Error loading mock models:", error)
      toast({
        title: "Error de inicializacion",
        description: "Error al inicializar el reconocimiento facial.",
        variant: "destructive",
      })
      onClose()
    }
  }

  const loadUserDescriptors = async () => {
    try {
      const stored = localStorage.getItem("faceDescriptors")

      if (stored) {
        const parsedDescriptors = JSON.parse(stored)

        if (Array.isArray(parsedDescriptors) && parsedDescriptors.length > 0) {
          const descriptors = parsedDescriptors.map((desc: any) => ({
            descriptor: desc.descriptor || [],
            createdAt: new Date(desc.createdAt || Date.now()),
          }))

          setStoredDescriptors(descriptors)
          console.log(`Loaded ${descriptors.length} face descriptors from localStorage`)
          return
        }
      }

      const response = await fetch("/api/faceid/descriptors")

      if (response.ok) {
        const data = await response.json()

        if (data.descriptors && data.descriptors.length > 0) {
          const descriptors = data.descriptors.map((desc: any) => ({
            descriptor: desc.descriptor || [],
            createdAt: new Date(desc.createdAt || Date.now()),
          }))

          setStoredDescriptors(descriptors)
          localStorage.setItem("faceDescriptors", JSON.stringify(data.descriptors))
          console.log(`Loaded ${descriptors.length} face descriptors from server`)
        }
      }
    } catch (error) {
      console.error("Error loading face descriptors:", error)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
        }
      }

      setIsCapturing(true)
    } catch (error) {
      console.error("Camera error:", error)
      toast({
        title: "Error de camara",
        description: "No se pudo acceder a la camara. Asegurate de dar permisos.",
        variant: "destructive",
      })
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }

    setIsCapturing(false)
  }

  const captureAndRecognize = async () => {
    setIsProcessing(true)
    setRecognitionResult(null)

    try {
      if (!videoRef.current) {
        throw new Error("Video element not available")
      }

      if (storedDescriptors.length === 0 && localStorage.getItem("faceIdSetup") !== "true") {
        setRecognitionResult({
          success: false,
          message: "Face ID no configurado. Ve a 'Configurar Face ID' para subir tus fotos primero.",
          confidence: 0,
        })

        toast({
          title: "Face ID no configurado",
          description: "Configura Face ID primero en el dashboard",
          variant: "destructive",
        })
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))

      const recognitionSuccess = Math.random() > 0.2
      const confidence = recognitionSuccess ? Math.random() * 0.2 + 0.8 : Math.random() * 0.4

      if (recognitionSuccess) {
        const result = {
          success: true,
          userId: "demo-user",
          confidence,
          message: "Rostro reconocido exitosamente",
        }

        setRecognitionResult(result)

        toast({
          title: "Reconocimiento exitoso",
          description: `Confianza: ${Math.round(confidence * 100)}%`,
        })

        setTimeout(() => {
          onLogin({
            id: "face-login-user",
            name: "Usuario",
            email: "face@login.com",
          })
          onClose()
        }, 2000)
      } else {
        setRecognitionResult({
          success: false,
          message: "Rostro no reconocido. Verifica que estes bien iluminado y mirando directamente a la camara.",
          confidence,
        })

        toast({
          title: "Reconocimiento fallido",
          description: "Intenta de nuevo con mejor iluminacion",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Face recognition error:", error)
      setRecognitionResult({
        success: false,
        message: "Error tecnico en el reconocimiento facial",
        confidence: 0,
      })
      toast({
        title: "Error",
        description: "Error en el procesamiento facial",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    stopCamera()
    setRecognitionResult(null)
    setIsProcessing(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md mx-4 p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <User className="h-5 w-5" />
            Reconocimiento Facial
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!modelsLoaded ? (
            <div className="text-center space-y-4">
              <div className="w-32 h-32 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Loader2 className="h-16 w-16 text-muted-foreground animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground">
                Cargando modelos de reconocimiento facial...
              </p>
            </div>
          ) : !isCapturing ? (
            <div className="text-center space-y-4">
              <div className="w-32 h-32 mx-auto bg-muted rounded-full flex items-center justify-center">
                <User className="h-16 w-16 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Presiona el boton para activar la camara y reconocer tu rostro
              </p>
              {storedDescriptors.length === 0 && (
                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                  No hay imagenes de rostro registradas. Ve a "Configurar Face ID" primero.
                </p>
              )}
              <Button
                onClick={startCamera}
                className="w-full"
                disabled={storedDescriptors.length === 0}
              >
                <Camera className="h-4 w-4 mr-2" />
                Activar Camara
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full rounded-lg border"
                  playsInline
                  muted
                  autoPlay
                />
                <canvas ref={canvasRef} className="hidden" />
                {isProcessing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm">Procesando...</p>
                    </div>
                  </div>
                )}
              </div>

              {recognitionResult && (
                <div
                  className={`p-4 rounded-lg border ${
                    recognitionResult.success
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {recognitionResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span
                      className={`font-medium ${
                        recognitionResult.success ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      {recognitionResult.message}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Confianza: {Math.round(recognitionResult.confidence * 100)}%
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={captureAndRecognize}
                  disabled={isProcessing || storedDescriptors.length === 0}
                  className="flex-1"
                >
                  {isProcessing ? "Procesando..." : "Capturar y Reconocer"}
                </Button>
                <Button variant="outline" onClick={stopCamera}>
                  Detener Camara
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                Imagenes registradas: {storedDescriptors.length}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
