import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area";

import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Bike, Eye, EyeOff, Origami } from "lucide-react"

interface BikeRackViewType {
  id: number,
  name: string,
  city: string,
  state: string
}

export default function Login() {
  const [availableBikeRacks, setAvailableBikeRacks] = useState<BikeRackViewType[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    cpf: "",
    phone: "",
    role: "",
    street: "",
    num: "",
    zip_code: "",
    city: "",
    state: "",
  })
  
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // console.log(formData)
      const success = await login(formData.email, formData.password)
      if (success) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao sistema BikeRack.",
        })
        navigate("/dashboard")
      } else {
        toast({
          title: "Erro no login",
          description: "Email ou senha incorretos.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      fetch("http://localhost:4000/user/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          cpf: formData.cpf,
          phone: formData.phone,
          // role: formData.role,
        })
      })
      .then(response => {
        if (!response.ok) {
          toast({
            title: "Erro ao cadastrar",
            description: "Não foi possível fazer o seu cadastro no sistema.",
            variant: 'destructive'
          })
          throw new Error("Erro ao cadastrar")
        }
        return response.json()
      })
      .then(data => {
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Você já pode entrar no sistema.",
        })
        navigate("/")
      })
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBikeRacks = async () => {
    fetch(`http://localhost:4000/bikerack/list`)
    .then(res => {
      if(!res.ok){
        toast({
          title:'Erro ao buscar bicicletários!',
          description: "Parece que houve um problema na busca dos bicicletáios",
          variant: 'destructive'
        })
        return;
      }

      return res.json();
    })
    .then(data => {
      setAvailableBikeRacks(data.map(br => {
        return {
          id: br.bike_rack_id,
          name: br.name,
          city: br.city,
          state: br.state
        } as BikeRackViewType
      }))
    })
    .catch(err => {
      toast({
        title:'Erro ao buscar bicicletários!',
        description: "Parece que há um problema no servidor.",
        variant: 'destructive'
      })
    })

    console.log(availableBikeRacks)
  }

  useEffect(() => {
    fetchBikeRacks();
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <Bike className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">BikeRack</h1>
              <p className="text-sm text-muted-foreground">Sistema de Gerenciamento</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="register">Cadastrar</TabsTrigger>
            <TabsTrigger value="bikeracks">Bicicletários</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Entrar na conta</CardTitle>
                <CardDescription>
                  Digite suas credenciais para acessar o sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Criar conta</CardTitle>
                <CardDescription>
                  Preencha os dados para criar sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nome completo</Label>
                    <Input
                      id="register-name"
                      placeholder="Seu nome completo"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-phone">Telefone</Label>
                      <Input
                        id="register-phone"
                        placeholder="(11) 99999-9999"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-cpf">CPF</Label>
                    <Input
                      id="register-cpf"
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                      required
                    />
                  </div>

                  {/* <div className="space-y-2">
                    <Label htmlFor="register-role">Tipo de usuário</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Cliente</SelectItem>
                        <SelectItem value="owner">Proprietário de Bicicletário</SelectItem>
                      </SelectContent>
                    </Select>
                  </div> */}

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Criando conta..." : "Criar conta"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bikeracks">
            <Card>
              <CardHeader>
                <CardTitle>Biciletários</CardTitle>
                <CardDescription>
                  Bicicletários disponíveis no sistema.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[391px] w-full">
                  <div className="flex flex-col gap-2">
                  {
                    availableBikeRacks.map(br => {
                      return (
                        <Card key={br.id} className="hover:shadow-md transition-shadow p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">{br.name}</h3>
                              <p className="text-sm text-muted-foreground">{`${br.city} • ${br.state}`}</p>
                            </div>
                            
                            {/* Botão à direita */}
                            <div className="ml-4">
                              {/* <Button variant="outline" onClick={() => {
                                // mudar para o tabContent de login
                                const loginTab = document.querySelector('[data-tab="login"]') as HTMLButtonElement;
                                if (loginTab) {
                                  loginTab.click();
                                }
                                toast({
                                  title: "Ops, só mais um passo!",
                                  description: "Para adicionar o bicicletário, faça login antes."
                                })
                              }}>
                                Visualizar
                              </Button> */}
                              <Bike className="h-8 w-8"/>
                            </div>
                          </div>
                        </Card>
                      )
                    })
                  }
                  </div>
                  {
                    availableBikeRacks.length === 0 &&
                    <div className="h-full mt-20 flex flex-col items-center gap-5">
                      <Origami className="h-20 w-20 text-gray-300"/>
                      <div className="flex flex-col items-center gap-1">
                        <h1 className="text-2xl">Nenhum bicicletário disponível</h1>
                        <p className="text-gray-500">Crie o seu próprio bicicletário!</p>
                      </div>
                    </div>
                  }
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}