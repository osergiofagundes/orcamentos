"use client"

import { useState } from "react"
import { User, Lock, Camera, Pen, Save, Send, Loader2, Edit } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageEditorModal } from "@/components/ui/image-editor-modal"
import { useToast } from "@/hooks/use-toast"

interface UserProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: {
    name: string
    email: string
    avatar: string
  }
  canChangePassword?: boolean // Se false, não mostra a aba de senha (usuário logou com Google)
  isGoogleUser?: boolean // Se true, usuário logou com Google e não pode trocar email
}

export function UserProfileModal({ open, onOpenChange, user, canChangePassword = true, isGoogleUser = false }: UserProfileModalProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    avatar: user.avatar,
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isLoadingPassword, setIsLoadingPassword] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false)

  // Reset dados quando o modal abrir/fechar
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset formulários quando fechar
      setProfileData({
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      })
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setSelectedFile(null)
      setIsEditorModalOpen(false)
    }
    onOpenChange(newOpen)
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoadingProfile(true)
    
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
          image: profileData.avatar,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar perfil')
      }

      const updatedUser = await response.json()
      
      toast.success('Perfil atualizado com sucesso!')
      
      // Se o email foi alterado, redirecionar para workspace-management
      if (updatedUser.emailChanged) {
        toast.success('Um email de verificação foi enviado para o novo endereço')
        onOpenChange(false)
        router.push('/workspace-management')
        router.refresh() // Atualiza a página para mostrar o modal de verificação
      } else {
        onOpenChange(false)
        router.refresh() // Atualiza a página para refletir as mudanças
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar perfil')
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('A nova senha deve ter pelo menos 8 caracteres')
      return
    }

    setIsLoadingPassword(true)
    
    try {
      const response = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao alterar senha')
      }

      const result = await response.json()
      
      // Limpar campos após sucesso
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      
      toast.success(result.message || 'Senha alterada com sucesso!')
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao alterar senha')
    } finally {
      setIsLoadingPassword(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Instead of reading directly, open the editor modal
      setSelectedFile(file)
      setIsEditorModalOpen(true)
    }
  }

  const handleImageSave = async (editedFile: File) => {
    try {
      const reader = new FileReader()
      reader.onload = (event) => {
        setProfileData(prev => ({
          ...prev,
          avatar: event.target?.result as string
        }))
      }
      reader.readAsDataURL(editedFile)
    } catch (error) {
      console.error('Erro ao processar imagem:', error)
      toast.error('Erro ao processar imagem')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg border-l-8 border-l-sky-600">
        <DialogHeader>
          <DialogTitle>Perfil do Usuário</DialogTitle>
          <DialogDescription>
            Gerencie suas informações pessoais e configurações de segurança.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className={`grid w-full ${canChangePassword ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-sky-600 data-[state=active]:text-white cursor-pointer">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            {canChangePassword && (
              <TabsTrigger value="password" className="flex items-center gap-2 data-[state=active]:bg-sky-600 data-[state=active]:text-white cursor-pointer">
                <Lock className="h-4 w-4" />
                Senha
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="profile" className="mt-4">
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profileData.avatar} alt={profileData.name} />
                    <AvatarFallback>
                      {profileData.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90 transition-colors">
                    <Pen className="h-3 w-3" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Seu nome"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="seu@email.com"
                  disabled={isGoogleUser}
                  className={isGoogleUser ? "bg-gray-100 cursor-not-allowed" : ""}
                />
                {isGoogleUser && (
                  <p className="text-xs text-gray-500">
                    O email não pode ser alterado pois você fez login com Google
                  </p>
                )}
              </div>
              
              <Button type="submit" disabled={isLoadingProfile} className='w-full bg-sky-600 hover:bg-sky-700 cursor-pointer'>
                {isLoadingProfile ? (<>Salvando <Loader2 className="h-4 w-4 animate-spin" /></>) : (<>Salvar Alterações <Edit className="h-4 w-4" /></>)}
              </Button>
            </form>
          </TabsContent>
          
          {canChangePassword && (
            <TabsContent value="password">
              <div className="space-y-4 flex flex-col items-center justify-center">
                <p className="text-center text-gray-700">
                  Para alterar sua senha, enviaremos um link de redefinição para seu email cadastrado.
                </p>
                <Button
                  type="button"
                  disabled={isLoadingPassword}
                  className="w-full bg-sky-600 hover:bg-sky-700 cursor-pointer"
                  onClick={async () => {
                    setIsLoadingPassword(true)
                    try {
                      const response = await fetch('/api/auth/forgot-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: profileData.email }),
                      })
                      const data = await response.json()
                      if (!response.ok || !data.success) {
                        throw new Error(data.message || 'Erro ao enviar email de redefinição')
                      }
                      toast.success('Enviamos um email para redefinir sua senha!')
                    } catch (error) {
                      toast.error(error instanceof Error ? error.message : 'Erro ao enviar email de redefinição')
                    } finally {
                      setIsLoadingPassword(false)
                    }
                  }}
                >
                  {isLoadingPassword ? (<>Enviando <Loader2 className="h-4 w-4 animate-spin" /></>) : (<>Enviar email de redefinição <Send className="h-4 w-4" /></>)}
                </Button>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>

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
    </Dialog>
  )
}
