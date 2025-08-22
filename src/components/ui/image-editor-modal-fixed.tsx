"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RotateCcw, RotateCw, ZoomIn, ZoomOut, Square, Circle, Scissors } from "lucide-react"
import ReactCrop, { type Crop as ReactCropType, centerCrop, makeAspectCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"

interface ImageEditorModalProps {
    isOpen: boolean
    onClose: () => void
    imageFile: File | null
    onSave: (editedFile: File) => void
}

interface AspectRatioOption {
    label: string
    value: number | undefined
    icon: React.ReactNode
}

const aspectRatioOptions: AspectRatioOption[] = [
    { label: "Livre", value: undefined, icon: <Scissors className="w-4 h-4" /> },
    { label: "Quadrado", value: 1, icon: <Square className="w-4 h-4" /> },
    { label: "16:9", value: 16 / 9, icon: <div className="w-4 h-3 border border-current rounded-sm" /> },
    { label: "4:3", value: 4 / 3, icon: <div className="w-4 h-3 border border-current rounded-sm" /> },
    { label: "Circular", value: 1, icon: <Circle className="w-4 h-4" /> },
]

export function ImageEditorModal({ isOpen, onClose, imageFile, onSave }: ImageEditorModalProps) {
    const [imageSrc, setImageSrc] = useState<string>("")
    const [crop, setCrop] = useState<ReactCropType>()
    const [completedCrop, setCompletedCrop] = useState<ReactCropType>()
    const [rotation, setRotation] = useState(0)
    const [zoom, setZoom] = useState(1)
    const [selectedAspectRatio, setSelectedAspectRatio] = useState<number | undefined>(undefined) // Default to free crop
    const [isCircular, setIsCircular] = useState(false)
    
    const imgRef = useRef<HTMLImageElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (!imageFile) return

        const reader = new FileReader()
        reader.onload = () => {
            setImageSrc(reader.result as string)
        }
        reader.readAsDataURL(imageFile)

        return () => {
            if (imageSrc && imageSrc.startsWith('blob:')) {
                URL.revokeObjectURL(imageSrc)
            }
        }
    }, [imageFile])

    const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth: width, naturalHeight: height } = e.currentTarget

        let crop;
        
        if (selectedAspectRatio) {
            // If aspect ratio is defined, create a centered crop with that ratio
            crop = centerCrop(
                makeAspectCrop(
                    {
                        unit: "%",
                        width: 80,
                    },
                    selectedAspectRatio,
                    width,
                    height
                ),
                width,
                height
            )
        } else {
            // If no aspect ratio (free crop), use the entire image
            crop = {
                unit: "%" as const,
                x: 0,
                y: 0,
                width: 100,
                height: 100,
            }
        }

        setCrop(crop)
        setCompletedCrop(crop)
    }, [selectedAspectRatio])

    const handleAspectRatioChange = useCallback((aspectRatio: number | undefined, circular: boolean = false) => {
        setSelectedAspectRatio(aspectRatio)
        setIsCircular(circular)

        if (imgRef.current) {
            const { naturalWidth: width, naturalHeight: height } = imgRef.current

            let crop;
            
            if (aspectRatio) {
                // If aspect ratio is defined, create a centered crop with that ratio
                crop = centerCrop(
                    makeAspectCrop(
                        {
                            unit: "%",
                            width: 80,
                        },
                        aspectRatio,
                        width,
                        height
                    ),
                    width,
                    height
                )
            } else {
                // If no aspect ratio (free crop), use the entire image
                crop = {
                    unit: "%" as const,
                    x: 0,
                    y: 0,
                    width: 100,
                    height: 100,
                }
            }

            setCrop(crop)
            setCompletedCrop(crop)
        }
    }, [])

    const rotateImage = (degrees: number) => {
        setRotation(prev => (prev + degrees) % 360)
    }

    const generateEditedImage = useCallback(async (): Promise<File | null> => {
        if (!imgRef.current || !canvasRef.current) {
            return null
        }

        const image = imgRef.current
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        if (!ctx) return null

        // Use completedCrop if available, otherwise use the entire image
        const effectiveCrop = completedCrop || {
            unit: "%" as const,
            x: 0,
            y: 0,
            width: 100,
            height: 100,
        }

        // Calculate the crop dimensions
        const scaleX = image.naturalWidth / image.width
        const scaleY = image.naturalHeight / image.height

        const cropX = effectiveCrop.x * scaleX
        const cropY = effectiveCrop.y * scaleY
        const cropWidth = effectiveCrop.width * scaleX
        const cropHeight = effectiveCrop.height * scaleY

        // Set canvas size to match crop dimensions
        canvas.width = cropWidth
        canvas.height = cropHeight

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Save the context state
        ctx.save()

        // If circular crop, create clipping path
        if (isCircular) {
            ctx.beginPath()
            ctx.arc(cropWidth / 2, cropHeight / 2, Math.min(cropWidth, cropHeight) / 2, 0, Math.PI * 2)
            ctx.clip()
        }

        // Apply rotation
        ctx.translate(cropWidth / 2, cropHeight / 2)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.scale(zoom, zoom)

        // Draw the cropped image
        ctx.drawImage(
            image,
            cropX,
            cropY,
            cropWidth,
            cropHeight,
            -cropWidth / 2,
            -cropHeight / 2,
            cropWidth,
            cropHeight
        )

        // Restore context
        ctx.restore()

        // Convert canvas to blob and then to File
        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    resolve(null)
                    return
                }

                const file = new File([blob], `edited-${imageFile?.name || 'image.png'}`, {
                    type: blob.type,
                    lastModified: Date.now(),
                })

                resolve(file)
            }, 'image/png', 0.9)
        })
    }, [completedCrop, rotation, zoom, isCircular, imageFile])

    const handleSave = async () => {
        const editedFile = await generateEditedImage()
        if (editedFile) {
            onSave(editedFile)
            onClose()
        }
    }

    const handleCancel = () => {
        // Reset all states
        setCrop(undefined)
        setCompletedCrop(undefined)
        setRotation(0)
        setZoom(1)
        setSelectedAspectRatio(undefined)
        setIsCircular(false)
        setImageSrc("")
        onClose()
    }

    if (!imageSrc) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Imagem</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Aspect Ratio Selection */}
                    <div>
                        <Label className="text-sm font-medium mb-2 block">Proporção</Label>
                        <div className="flex flex-wrap gap-2">
                            {aspectRatioOptions.map((option, index) => (
                                <Button
                                    key={index}
                                    variant={
                                        (option.label === "Circular" ? isCircular : selectedAspectRatio === option.value && !isCircular)
                                            ? "default" 
                                            : "outline"
                                    }
                                    size="sm"
                                    onClick={() => handleAspectRatioChange(
                                        option.value, 
                                        option.label === "Circular"
                                    )}
                                    className="flex items-center gap-2"
                                >
                                    {option.icon}
                                    {option.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Rotation */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Rotação: {rotation}°</Label>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => rotateImage(-90)}
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </Button>
                                <Slider
                                    value={[rotation]}
                                    onValueChange={(value: number[]) => setRotation(value[0])}
                                    min={-180}
                                    max={180}
                                    step={1}
                                    className="flex-1"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => rotateImage(90)}
                                >
                                    <RotateCw className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Zoom */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Zoom: {(zoom * 100).toFixed(0)}%</Label>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
                                >
                                    <ZoomOut className="w-4 h-4" />
                                </Button>
                                <Slider
                                    value={[zoom]}
                                    onValueChange={(value: number[]) => setZoom(value[0])}
                                    min={0.5}
                                    max={3}
                                    step={0.1}
                                    className="flex-1"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}
                                >
                                    <ZoomIn className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Reset */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Resetar</Label>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setRotation(0)
                                    setZoom(1)
                                }}
                                className="w-full"
                            >
                                Resetar Transformações
                            </Button>
                        </div>
                    </div>

                    {/* Image Crop Area */}
                    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                        <ReactCrop
                            crop={crop}
                            onChange={(c) => setCrop(c)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={selectedAspectRatio}
                            circularCrop={isCircular}
                            className="max-w-full"
                        >
                            <img
                                ref={imgRef}
                                src={imageSrc}
                                alt="Crop preview"
                                onLoad={onImageLoad}
                                className="max-w-full h-auto"
                                style={{
                                    transform: `rotate(${rotation}deg) scale(${zoom})`,
                                    transformOrigin: 'center',
                                }}
                            />
                        </ReactCrop>
                    </div>

                    {/* Hidden canvas for generating the edited image */}
                    <canvas
                        ref={canvasRef}
                        className="hidden"
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave}>
                        Salvar Alterações
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
