'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageEditorModal } from "@/components/ui/image-editor-modal"
import { toast } from "sonner"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import Image from 'next/image'

interface LogoUploadProps {
    workspaceId: number
    currentLogoUrl?: string | null
    onLogoChange?: (logoUrl: string | null) => void
    canEdit: boolean
}

export function LogoUpload({ workspaceId, currentLogoUrl, onLogoChange, canEdit }: LogoUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [logoUrl, setLogoUrl] = useState<string | null>(currentLogoUrl || null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isEditorModalOpen, setIsEditorModalOpen] = useState(false)

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (!acceptedFiles.length || !canEdit) return

        const file = acceptedFiles[0]
        
        // Instead of uploading directly, open the editor modal
        setSelectedFile(file)
        setIsEditorModalOpen(true)
    }, [canEdit])

    const handleImageSave = async (editedFile: File) => {
        setIsUploading(true)

        try {
            const formData = new FormData()
            formData.append('logo', editedFile)

            const response = await fetch(`/api/workspace/${workspaceId}/logo`, {
                method: 'POST',
                body: formData,
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao fazer upload')
            }

            setLogoUrl(result.logoUrl)
            onLogoChange?.(result.logoUrl)
            toast.success('Logo carregado com sucesso!')

        } catch (error) {
            console.error('Erro no upload:', error)
            toast.error(error instanceof Error ? error.message : 'Erro ao fazer upload do logo')
        } finally {
            setIsUploading(false)
        }
    }

    const removeLogo = async () => {
        if (!canEdit) return

        setIsUploading(true)

        try {
            const response = await fetch(`/api/workspace/${workspaceId}/logo`, {
                method: 'DELETE',
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao remover logo')
            }

            setLogoUrl(null)
            onLogoChange?.(null)
            toast.success('Logo removido com sucesso!')

        } catch (error) {
            console.error('Erro ao remover logo:', error)
            toast.error(error instanceof Error ? error.message : 'Erro ao remover logo')
        } finally {
            setIsUploading(false)
        }
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.svg']
        },
        maxFiles: 1,
        maxSize: 5 * 1024 * 1024, // 5MB
        disabled: !canEdit || isUploading
    })

    return (
        <>
            {logoUrl ? (
                <div className="space-y-4">
                    {/* Preview do logo atual */}
                    <div className="flex items-center justify-center p-4 border rounded-lg bg-gray-50">
                        <div className="relative w-32 h-32">
                            {/* Use img tag instead of Next.js Image for uploaded files */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={logoUrl}
                                alt="Logo da empresa"
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    console.error('Erro ao carregar imagem:', logoUrl);
                                    // Fallback se a imagem não carregar
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>
                    </div>

                    {canEdit && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={removeLogo}
                                disabled={isUploading}
                                className="flex items-center gap-2"
                            >
                                <X className="h-4 w-4" />
                                Remover Logo
                            </Button>

                            <div {...getRootProps()} className="flex-1">
                                <input {...getInputProps()} />
                                <Button
                                    variant="outline"
                                    disabled={isUploading}
                                    className="w-full flex items-center gap-2"
                                >
                                    <Upload className="h-4 w-4" />
                                    Alterar Logo
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* Upload area quando não há logo */
                canEdit && (
                    <div
                        {...getRootProps()}
                        className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                            }
                ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
                    >
                        <input {...getInputProps()} />

                        <div className="flex flex-col items-center gap-4">
                            <div className="p-3 rounded-full bg-gray-100">
                                {isUploading ? (
                                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
                                ) : (
                                    <ImageIcon className="h-8 w-8 text-gray-400" />
                                )}
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium">
                                    {isUploading
                                        ? 'Fazendo upload...'
                                        : isDragActive
                                            ? 'Solte a imagem aqui...'
                                            : 'Clique ou arraste uma imagem'
                                    }
                                </p>
                                <p className="text-xs text-gray-500">
                                    PNG, JPG, WebP ou SVG até 5MB
                                </p>
                            </div>
                        </div>
                    </div>
                )
            )}

            {!canEdit && !logoUrl && (
                <div className="text-center py-8 text-gray-500">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Nenhum logo configurado</p>
                </div>
            )}

            {/* Image Editor Modal */}
            <ImageEditorModal
                isOpen={isEditorModalOpen}
                onClose={() => {
                    setIsEditorModalOpen(false)
                    setSelectedFile(null)
                }}
                imageFile={selectedFile}
                onSave={handleImageSave}
            />
        </>
    )
}
