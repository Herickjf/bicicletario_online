import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "next-themes"
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Building,
  Mail,
  Phone,
  MapPin,
  Save,
  Moon,
  Sun,
  Monitor
} from "lucide-react"

export default function Settings() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  
  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    cpf: user?.cpf || ""
  })

  const [bikeRackInfo, setBikeRackInfo] = useState({
    name: "Bicicletário Central",
    description: "Bicicletário localizado no centro da cidade",
    address: "Rua das Flores, 123",
    city: "São Paulo",
    state: "SP",
    zipCode: "01234-567"
  })

  const [notifications, setNotifications] = useState({
    emailRentals: true,
    emailReports: true,
    emailPromotions: false,
    pushNotifications: true,
    smsAlerts: false
  })

  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: "60",
    passwordExpiry: "90"
  })

  const handleSavePersonalInfo = () => {
    toast({
      title: "Informações atualizadas",
      description: "Suas informações pessoais foram salvas com sucesso."
    })
  }

  const handleSaveBikeRackInfo = () => {
    toast({
      title: "Bicicletário atualizado", 
      description: "As informações do bicicletário foram salvas."
    })
  }

  const handleSaveNotifications = () => {
    toast({
      title: "Preferências salvas",
      description: "Suas preferências de notificação foram atualizadas."
    })
  }

  const handleSaveSecurity = () => {
    toast({
      title: "Configurações de segurança",
      description: "As configurações de segurança foram atualizadas."
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie suas preferências e configurações do sistema
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Atualize seus dados pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={personalInfo.name}
                  onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={personalInfo.cpf}
                    onChange={(e) => setPersonalInfo({...personalInfo, cpf: e.target.value})}
                  />
                </div>
              </div>
              <Button onClick={handleSavePersonalInfo} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Salvar Informações
              </Button>
            </CardContent>
          </Card>

          {/* Configurações do Bicicletário */}
          {(user?.role === 'owner' || user?.role === 'manager') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Bicicletário
                </CardTitle>
                <CardDescription>
                  Informações do seu bicicletário
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rack-name">Nome do Bicicletário</Label>
                  <Input
                    id="rack-name"
                    value={bikeRackInfo.name}
                    onChange={(e) => setBikeRackInfo({...bikeRackInfo, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={bikeRackInfo.description}
                    onChange={(e) => setBikeRackInfo({...bikeRackInfo, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={bikeRackInfo.address}
                    onChange={(e) => setBikeRackInfo({...bikeRackInfo, address: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={bikeRackInfo.city}
                      onChange={(e) => setBikeRackInfo({...bikeRackInfo, city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={bikeRackInfo.state}
                      onChange={(e) => setBikeRackInfo({...bikeRackInfo, state: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">CEP</Label>
                    <Input
                      id="zip"
                      value={bikeRackInfo.zipCode}
                      onChange={(e) => setBikeRackInfo({...bikeRackInfo, zipCode: e.target.value})}
                    />
                  </div>
                </div>
                <Button onClick={handleSaveBikeRackInfo} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Bicicletário
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Tema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Aparência
              </CardTitle>
              <CardDescription>
                Escolha o tema da interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Tema</Label>
                  <p className="text-sm text-muted-foreground">
                    Selecione como a interface deve aparecer
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  onClick={() => setTheme("light")}
                  className="flex flex-col gap-2 h-auto p-4"
                >
                  <Sun className="h-5 w-5" />
                  <span className="text-sm">Claro</span>
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  onClick={() => setTheme("dark")}
                  className="flex flex-col gap-2 h-auto p-4"
                >
                  <Moon className="h-5 w-5" />
                  <span className="text-sm">Escuro</span>
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  onClick={() => setTheme("system")}
                  className="flex flex-col gap-2 h-auto p-4"
                >
                  <Monitor className="h-5 w-5" />
                  <span className="text-sm">Sistema</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notificações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
              </CardTitle>
              <CardDescription>
                Configure como você gostaria de receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>E-mails de Aluguéis</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber e-mails sobre novos aluguéis
                  </p>
                </div>
                <Switch
                  checked={notifications.emailRentals}
                  onCheckedChange={(checked) => setNotifications({...notifications, emailRentals: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Relatórios por E-mail</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber relatórios semanais/mensais
                  </p>
                </div>
                <Switch
                  checked={notifications.emailReports}
                  onCheckedChange={(checked) => setNotifications({...notifications, emailReports: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Promoções</Label>
                  <p className="text-sm text-muted-foreground">
                    E-mails promocionais e ofertas especiais
                  </p>
                </div>
                <Switch
                  checked={notifications.emailPromotions}
                  onCheckedChange={(checked) => setNotifications({...notifications, emailPromotions: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Notificações Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificações no navegador
                  </p>
                </div>
                <Switch
                  checked={notifications.pushNotifications}
                  onCheckedChange={(checked) => setNotifications({...notifications, pushNotifications: checked})}
                />
              </div>
              <Button onClick={handleSaveNotifications} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Salvar Preferências
              </Button>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Segurança
              </CardTitle>
              <CardDescription>
                Configurações de segurança da conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Autenticação em Duas Etapas</Label>
                  <p className="text-sm text-muted-foreground">
                    Adicionar uma camada extra de segurança
                  </p>
                </div>
                <Switch
                  checked={security.twoFactor}
                  onCheckedChange={(checked) => setSecurity({...security, twoFactor: checked})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Timeout da Sessão (minutos)</Label>
                <Select value={security.sessionTimeout} onValueChange={(value) => setSecurity({...security, sessionTimeout: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                    <SelectItem value="480">8 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-expiry">Expiração da Senha (dias)</Label>
                <Select value={security.passwordExpiry} onValueChange={(value) => setSecurity({...security, passwordExpiry: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="60">60 dias</SelectItem>
                    <SelectItem value="90">90 dias</SelectItem>
                    <SelectItem value="180">180 dias</SelectItem>
                    <SelectItem value="never">Nunca</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveSecurity} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Salvar Segurança
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}