import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { 
  Plus, 
  Search, 
  Edit, 
  Clock,
  Calendar,
  User,
  Bike as BikeIcon,
  DollarSign,
  Filter,
  CheckCircle,
  XCircle
} from "lucide-react"
import { RentStatus, Rent } from "@/types"

const mockRentals: Rent[] = [
  {
    rent_id: 1,
    rent_date: "2024-01-15",
    init_time: "09:00",
    end_time: "11:00",
    total_value: 30.00,
    status: "active",
    bike_id: 1,
    client_id: 1,
    employee_id: 1,
    bike_rack_id: 1,
    bike: { bike_id: 1, model: "Mountain Bike Pro", year: 2023, rent_price: 15.00, status: "rented", tracker_number: 1001, bike_rack_id: 1 },
    client: { user_id: 1, name: "Maria Silva", email: "maria@email.com", cpf: "12345678901", phone: "11999999999", address_id: 1 },
  },
  {
    rent_id: 2,
    rent_date: "2024-01-15",
    init_time: "14:00",
    end_time: "16:30",
    total_value: 37.50,
    status: "finished",
    bike_id: 2,
    client_id: 2,
    employee_id: 1,
    bike_rack_id: 1,
    bike: { bike_id: 2, model: "City Bike Comfort", year: 2022, rent_price: 12.00, status: "available", tracker_number: 1002, bike_rack_id: 1 },
    client: { user_id: 2, name: "João Santos", email: "joao@email.com", cpf: "98765432100", phone: "11888888888", address_id: 2 },
  },
  {
    rent_id: 3,
    rent_date: "2024-01-14",
    init_time: "10:00",
    end_time: "13:00",
    total_value: 75.00,
    status: "canceled",
    bike_id: 3,
    client_id: 3,
    employee_id: 2,
    bike_rack_id: 1,
    bike: { bike_id: 3, model: "Electric Bike", year: 2023, rent_price: 25.00, status: "available", tracker_number: 1003, bike_rack_id: 1 },
    client: { user_id: 3, name: "Ana Costa", email: "ana@email.com", cpf: "45678912300", phone: "11777777777", address_id: 3 },
  },
]

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

export default function Rentals() {
  const [rentals, setRentals] = useState(mockRentals)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<RentStatus | "all">("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRental, setEditingRental] = useState<Rent | null>(null)
  const [formData, setFormData] = useState({
    client_name: "",
    bike_model: "",
    init_time: "",
    end_time: "",
    status: "active" as RentStatus,
  })
  
  const { toast } = useToast()

  const filteredRentals = rentals.filter(rental => {
    const matchesSearch = rental.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rental.bike?.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rental.rent_id.toString().includes(searchTerm)
    const matchesStatus = statusFilter === "all" || rental.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleFinishRental = (rentalId: number) => {
    setRentals(rentals.map(rental => 
      rental.rent_id === rentalId 
        ? { ...rental, status: "finished" as RentStatus, end_time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }
        : rental
    ))
    toast({
      title: "Aluguel finalizado",
      description: "O aluguel foi finalizado com sucesso.",
    })
  }

  const handleCancelRental = (rentalId: number) => {
    setRentals(rentals.map(rental => 
      rental.rent_id === rentalId 
        ? { ...rental, status: "canceled" as RentStatus }
        : rental
    ))
    toast({
      title: "Aluguel cancelado",
      description: "O aluguel foi cancelado.",
    })
  }

  const calculateDuration = (initTime: string, endTime: string) => {
    const [initHour, initMinute] = initTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)
    
    const initMinutes = initHour * 60 + initMinute
    const endMinutes = endHour * 60 + endMinute
    
    const diffMinutes = endMinutes - initMinutes
    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60
    
    return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`
  }

  const openNewDialog = () => {
    setEditingRental(null)
    setFormData({
      client_name: "",
      bike_model: "",
      init_time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      end_time: "",
      status: "active",
    })
    setIsDialogOpen(true)
  }

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
          <Button onClick={openNewDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Aluguel
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente, bicicleta ou ID..."
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
                            <button 
                              className="text-sm font-medium text-primary hover:text-primary/80 text-left"
                              onClick={() => {/* Navigate to user */}}
                            >
                              {rental.client?.name}
                            </button>
                            <p className="text-xs text-muted-foreground">Cliente</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <BikeIcon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{rental.bike?.model}</p>
                            <p className="text-xs text-muted-foreground">#{rental.bike?.tracker_number}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">
                              {rental.init_time} - {rental.end_time}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {calculateDuration(rental.init_time, rental.end_time)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">R$ {rental.total_value.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">Total</p>
                          </div>
                        </div>
                      </div>
                      
                      {rental.status === "active" && (
                        <div className="flex gap-2 mt-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleFinishRental(rental.rent_id)}
                            className="text-success hover:text-success/80 hover:border-success/20"
                          >
                            <CheckCircle className="h-5 w-5 mr-1" />
                            Finalizar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCancelRental(rental.rent_id)}
                            className="text-destructive hover:text-destructive/80 hover:border-destructive/20"
                          >
                            <XCircle className="h-5 w-5 mr-1" />
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
                <Label htmlFor="client">Cliente</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Maria Silva</SelectItem>
                    <SelectItem value="2">João Santos</SelectItem>
                    <SelectItem value="3">Ana Costa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bike">Bicicleta</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a bicicleta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Mountain Bike Pro (#1001)</SelectItem>
                    <SelectItem value="4">Hybrid Bike (#1004)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="init_time">Hora de Início</Label>
                  <Input
                    id="init_time"
                    type="time"
                    value={formData.init_time}
                    onChange={(e) => setFormData({ ...formData, init_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">Hora Prevista</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={() => setIsDialogOpen(false)} className="flex-1">
                Iniciar Aluguel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}