import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { 
  Plus, 
  Search, 
  Clock,
  Calendar,
  User,
  Bike as BikeIcon,
  DollarSign,
  Filter,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { useBikeRacks } from "@/contexts/bikerack-context"
import CantOpen from "@/components/layout/cant-open"
import { useAuth } from "@/contexts/auth-context"

type RentStatus = 'active' | 'finished' | 'canceled'

interface Rent {
  rent_id: number;
  rent_date: string;
  init_time: string;
  end_time: string;
  total_value: number;
  status: RentStatus;
  client_id?: number;
  employee_id?: number;
  bike?: {
    id: number,
    model: string,
  };
  client?: {
    id: number,
    name: string,
  };
  employee?:{
    id: number,
    name: string,
  };
}

const statusColors = {
  active: "bg-primary text-primary-foreground",
  finished: "bg-success text-success-foreground",
  canceled: "bg-destructive text-destructive-foreground",
}

const statusLabels = {
  active: "Ativo",
  finished: "Finalizado", 
  canceled: "Cancelado",
}

const statusIcons = {
  active: Clock,
  finished: CheckCircle,
  canceled: XCircle,
}

interface NewRentForm {
  client_id: number | null;
  bike_id: number | null;
  init_time: string;
  end_time: string;
  estimated_value?: number;
}

interface BikeOption {
  id: number;
  model: string;
  rent_price: number;
  tracker_number: number;
}

interface ClientOption {
  id: number;
  name: string;
  email: string;
}

export default function Rentals() {
  const { user, userRole } = useAuth();  
  const { currentBikeRack } = useBikeRacks();
  const [rentals, setRentals] = useState<Rent[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<RentStatus | "all">("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [availableBikes, setAvailableBikes] = useState<BikeOption[]>([])
  const [availableClients, setAvailableClients] = useState<ClientOption[]>([])
  const [formData, setFormData] = useState<NewRentForm>({
    client_id: null,
    bike_id: null,
    init_time: new Date().toTimeString().slice(0, 5),
    end_time: "",
    estimated_value: 0
  })
  
  const { toast } = useToast()

  const formatTimeFromTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } catch (error) {
      if (timestamp.includes(':')) {
        return timestamp;
      }
      return timestamp;
    }
  }

  const calculateDuration = (initTime: string, endTime: string) => {
    try {
      const initDate = new Date(initTime);
      const endDate = new Date(endTime);
      
      const diffMs = endDate.getTime() - initDate.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      
      if (diffMinutes <= 0) return "0min";
      
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      
      if (hours > 0) {
        return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
      } else {
        return `${minutes}min`;
      }
    } catch (error) {
      const [initHour, initMinute] = initTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      const initMinutes = initHour * 60 + initMinute;
      const endMinutes = endHour * 60 + endMinute;
      const diffMinutes = endMinutes - initMinutes;
      
      if (diffMinutes <= 0) return "0min";
      
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      
      return hours > 0 ? `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}` : `${minutes}min`;
    }
  }

  const filteredRentals = rentals.filter(rental => {
    const matchesSearch = 
      rental.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.bike?.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.rent_id.toString().includes(searchTerm) ||
      rental.employee?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || rental.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleFinishRental = async (rentalId: number) => {
    try {
      fetch(`http://localhost:4000/rent/finishRent/${rentalId}`, {method: 'PATCH'})
      .then(res => {
        if(!res.ok){
          toast({
            title: "Não foi possível finalizar o aluguel!",
            variant: 'destructive'
          })
          return;
        }
        return res.json();
      })
      .catch(data => {
      })
      fetchRentals();
      setRentals(rentals.map(rental => 
        rental.rent_id === rentalId 
          ? { ...rental, status: "finished" }
          : rental
      ))
      toast({
        title: "Aluguel finalizado",
        description: "O aluguel foi finalizado com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível finalizar o aluguel.",
        variant: "destructive"
      })
    }
  }

  const handleCancelRental = async (rentalId: number) => {
    try {
      fetch(`http://localhost:4000/rent/cancelRent/${rentalId}`, {method: 'PATCH'})
      .then(res => {
        if(!res.ok){
          toast({
            title: "Não foi possível cancelar o aluguel!",
            variant: 'destructive'
          })
          return;
        }
        return res.json();
      })
      .catch(data => {
      })
      setRentals(rentals.map(rental => 
        rental.rent_id === rentalId 
          ? { ...rental, status: "canceled" }
          : rental
      ))
      fetchRentals();
      toast({
        title: "Aluguel Cancelado",
        description: "O aluguel foi cancelado com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível cancelar o aluguel.",
        variant: "destructive"
      })
    }
  }

  const calculateEstimatedValue = (initTime: string, endTime: string, bikePrice: number = 0) => {
    const [initHour, initMinute] = initTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)
    
    const initMinutes = initHour * 60 + initMinute
    const endMinutes = endHour * 60 + endMinute
    const diffMinutes = Math.max(0, endMinutes - initMinutes)
    
    const hours = Math.ceil(diffMinutes / 60)
    return hours * bikePrice
  }

  const handleCreateRental = async () => {
    if (!formData.client_id || !formData.bike_id || !formData.end_time) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      })
      return
    }

    try {
      const selectedBike = availableBikes.find(b => b.id === formData.bike_id)
      const selectedClient = availableClients.find(c => c.id === formData.client_id)
      const rent_date = new Date().toISOString().split('T')[0]
      const newRental: Rent = {
        rent_id: Math.max(...rentals.map(r => r.rent_id)) + 1,
        rent_date: rent_date,
        init_time: rent_date + " " + formData.init_time + ":00",
        end_time: rent_date + " " + formData.end_time + ":00",
        total_value: formData.estimated_value || 0,
        status: "active",
        client_id: formData.client_id,
        employee_id: user?.user_id,
        bike: {
          id: selectedBike?.id || 0,
          model: selectedBike?.model || ""
        },
        client: {
          id: selectedClient?.id || 0,
          name: selectedClient?.name || ""
        },
        employee: {
          id: user?.user_id || 0,
          name: user?.name || ""
        }
      }

      fetch(`http://localhost:4000/rent/createRent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + localStorage.getItem('token'),
        },
        body: JSON.stringify({
          "rent_date": newRental.rent_date,
          "init_time": newRental.init_time,
          "end_time": newRental.end_time,
          "total_value": newRental.total_value,
          "status": newRental.status,
          "bike_id": newRental.bike.id,
          "client_id": newRental.client.id,
          "employee_id": newRental.employee.id,
          "bike_rack_id": currentBikeRack.id
        })
      })
      .then(res => {
        if(!res.ok) {
          toast({
            title: "Erro ao criar aluguel!",
            description: "Parece que houve um problema ao criar um relatório.",
            variant: 'destructive'
          })
          return;
        }

        return res.json();
      })
      .then(data => {
        toast({
          title: "Aluguel cadastrado com sucesso!",
          description: "Seu aluguel foi cadastrado. Manipule ele na tela de aluguéis."
        })
      })
      
      fetchRentals();
      
    } catch (error) {
      toast({
        title: "Erro ao criar aluguel!",
        description: "Parece que há um problema no servidor.",
        variant: 'destructive'
      })
      return;

    }finally{
      setIsDialogOpen(false)
      setFormData({
        client_id: null,
        bike_id: null,
        init_time: new Date().toTimeString().slice(0, 5),
        end_time: "",
        estimated_value: 0
      })
    }
  }

  const fetchRentals = async () => {
    if (!currentBikeRack?.id) return

    try {
      const response = await fetch(`http://localhost:4000/rent/getAllBikerackRents/${currentBikeRack.id}`)
      if (!response.ok) throw new Error('Erro ao buscar aluguéis')
      
      const data = await response.json()
      
      const processedData = data.map((rent: any) => ({
        ...rent,
        init_time: rent.init_time,
        end_time: rent.end_time,
        bike: rent.bike || { id: 0, model: "N/A" },
        client: rent.client || { id: 0, name: "N/A" },
        employee: rent.employee || { id: 0, name: "N/A" }
      }))
      
      setRentals(processedData)
      // console.log("Dados processados:", processedData)
      
    } catch (error) {
      toast({
        title: "Erro ao buscar aluguéis!",
        description: "Parece que há um problema no servidor.",
        variant: "destructive"
      })
    }
  }

  const fetchAvailableBikes = async () => {
    if (!currentBikeRack?.id) return

    try {
      const response = await fetch(`http://localhost:4000/bikerack/listBikes/${currentBikeRack.id}`)
      if (!response.ok) throw new Error('Erro ao buscar bicicletas')
      
      const data = await response.json()
      setAvailableBikes(data.map(bike => {
        return {
          id: bike.bike_id,
          model: bike.model,
          rent_price: bike.rent_price,
          tracker_number: bike.traker_number,
        } as BikeOption
      }))
      
    } catch (error) {
      console.error("Erro ao buscar bicicletas:", error)
      toast({
        title: "Erro ao buscar bicicletas!",
        variant: "destructive"
      })
    }
  }

  const fetchAvailableClients = async () => {
    try {
      const response = await fetch(`http://localhost:4000/bikerack/getCustomers/${currentBikeRack.id}`)
      if (!response.ok) throw new Error('Erro ao buscar clientes')
      
      const data = await response.json()
      setAvailableClients(data.map(client => {
        return {
          id: client.user_id,
          name: client.name,
          email: client.email,
        } as ClientOption
      }))

    } catch (error) {
      console.error("Erro ao buscar clientes:", error)
      toast({
        title: "Erro ao buscar clientes!",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    if (currentBikeRack) {
      fetchRentals()
      fetchAvailableBikes()
      fetchAvailableClients()
    }
  }, [currentBikeRack, rentals])

  useEffect(() => {
    if (formData.bike_id && formData.init_time && formData.end_time) {
      const selectedBike = availableBikes.find(b => b.id === formData.bike_id)
      if (selectedBike) {
        const value = calculateEstimatedValue(
          formData.init_time, 
          formData.end_time, 
          selectedBike.rent_price
        )
        setFormData(prev => ({ ...prev, estimated_value: value }))
      }
    }
  }, [formData.bike_id, formData.init_time, formData.end_time, availableBikes])

  if (!currentBikeRack) {
    return <CantOpen pageName="Aluguéis" />
  }

  const canManageRentals = userRole === 'owner' || userRole === 'manager' || userRole === 'attendant'

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Aluguéis</h1>
            <p className="text-muted-foreground">
              Gerencie todos os aluguéis de bicicletas
            </p>
          </div>
          {canManageRentals && (
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Aluguel
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente, funcionário, bicicleta ou ID..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as RentStatus | "all")}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="finished">Finalizado</SelectItem>
                  <SelectItem value="canceled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredRentals.map((rental) => {
                const StatusIcon = statusIcons[rental.status]
                const formattedInitTime = formatTimeFromTimestamp(rental.init_time)
                const formattedEndTime = formatTimeFromTimestamp(rental.end_time)
                
                return (
                  <Card key={rental.rent_id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Aluguel #{rental.rent_id}</CardTitle>
                            <CardDescription>
                              {new Date(rental.rent_date).toLocaleDateString('pt-BR')}
                              {rental.employee && ` • Por: ${rental.employee.name}`}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={statusColors[rental.status]}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusLabels[rental.status]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-primary">
                              {rental.client?.name}
                            </p>
                            <p className="text-xs text-muted-foreground">Cliente</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <BikeIcon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{rental.bike?.model}</p>
                            <p className="text-xs text-muted-foreground">Bicicleta</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">
                              {formattedInitTime} - {formattedEndTime}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {calculateDuration(rental.init_time, rental.end_time)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">R$ {rental.total_value}</p>
                            <p className="text-xs text-muted-foreground">Total</p>
                          </div>
                        </div>
                      </div>
                      
                      {rental.status === "active" && canManageRentals && (
                        <div className="flex gap-2 mt-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleFinishRental(rental.rent_id)}
                            className="text-success hover:text-success/80 hover:border-success/20"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Finalizar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCancelRental(rental.rent_id)}
                            className="text-destructive hover:text-destructive/80 hover:border-destructive/20"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            
            {filteredRentals.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Nenhum aluguel encontrado</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all" 
                    ? "Tente ajustar os filtros de busca" 
                    : "Inicie o primeiro aluguel"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Novo Aluguel</DialogTitle>
              <DialogDescription>
                Inicie um novo aluguel de bicicleta
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="client">Cliente *</Label>
                <Select 
                  value={formData.client_id?.toString() || ""} 
                  onValueChange={(value) => setFormData({...formData, client_id: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableClients.map(client => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name} ({client.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bike">Bicicleta *</Label>
                <Select 
                  value={formData.bike_id?.toString() || ""} 
                  onValueChange={(value) => setFormData({...formData, bike_id: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a bicicleta" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBikes.map(bike => (
                      <SelectItem key={bike.id} value={bike.id.toString()}>
                        {bike.model} - R$ {bike.rent_price}/h
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="init_time">Hora de Início *</Label>
                  <Input
                    id="init_time"
                    type="time"
                    value={formData.init_time}
                    onChange={(e) => setFormData({ ...formData, init_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">Hora Prevista *</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    min={formData.init_time}
                  />
                </div>
              </div>
              
              {formData.estimated_value && formData.estimated_value > 0 && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm font-medium">Valor estimado: R$ {formData.estimated_value.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Baseado no tempo selecionado e preço da bicicleta</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleCreateRental} className="flex-1" disabled={!formData.client_id || !formData.bike_id || !formData.end_time}>
                Iniciar Aluguel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}