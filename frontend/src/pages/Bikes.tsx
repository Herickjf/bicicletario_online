import { useEffect, useState } from "react"
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
  Trash2, 
  Settings,
  Bike as BikeIcon,
  Filter,
  MousePointer2
} from "lucide-react"
import { BikeStatus, Bike } from "@/types"
import { useAuth } from "@/contexts/auth-context"
import { useBikeRacks } from "@/contexts/bikerack-context"
import { useNavigate } from "react-router-dom"
import CantOpen from "@/components/layout/cant-open"

const mockBikes: Bike[] = [
  {
    bike_id: 1,
    model: "Mountain Bike Pro",
    year: 2023,
    image: "/placeholder.svg",
    rent_price: 15.00,
    status: "available",
    tracker_number: 1001,
    bike_rack_id: 1,
  },
  {
    bike_id: 2,
    model: "City Bike Comfort",
    year: 2022,
    image: "/placeholder.svg",
    rent_price: 12.00,
    status: "rented",
    tracker_number: 1002,
    bike_rack_id: 1,
  },
  {
    bike_id: 3,
    model: "Electric Bike",
    year: 2023,
    image: "/placeholder.svg",
    rent_price: 25.00,
    status: "under_maintenance",
    tracker_number: 1003,
    bike_rack_id: 1,
  },
  {
    bike_id: 4,
    model: "Hybrid Bike",
    year: 2021,
    image: "/placeholder.svg",
    rent_price: 10.00,
    status: "available",
    tracker_number: 1004,
    bike_rack_id: 1,
  },
]

const statusColors = {
  available: "bg-status-available text-white",
  rented: "bg-status-rented text-white",
  under_maintenance: "bg-status-maintenance text-black",
}

const statusLabels = {
  available: "Disponível",
  rented: "Alugada",
  under_maintenance: "Manutenção",
}

export default function Bikes() {
  const { user } = useAuth();
  const {currentBikeRack} = useBikeRacks();
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<BikeStatus | "all">("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBike, setEditingBike] = useState<Bike | null>(null)
  const [formData, setFormData] = useState({
    model: "",
    year: new Date().getFullYear(),
    rent_price: 0,
    status: "available" as BikeStatus,
    tracker_number: 0,
  })
  
  const [ bicicletasInfo, setBicicletasInfo ] = useState<Bike[]>([]);

  const { toast } = useToast()

  const filteredBikes = bicicletasInfo?.filter(bike => {
    const matchesSearch = bike.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bike.tracker_number.toString().includes(searchTerm)
    const matchesStatus = statusFilter === "all" || bike.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleSave = () => {
    if (editingBike) {
      // PREN-AQUI : atualizar a bike de id editing.bike_id com os valores de formData

      setBicicletasInfo(bicicletasInfo?.map(bike => 
        bike.bike_id === editingBike.bike_id 
          ? { ...bike, ...formData }
          : bike
      ))
      toast({
        title: "Bicicleta atualizada",
        description: "As informações foram salvas com sucesso.",
      })
    } else {
      // PREN-AQUI : criar bike, retornar o id colocá-lo no campo bike_id 

      const newBike: Bike = {
        bike_id: Math.max(...bicicletasInfo.map(b => b.bike_id)) + 1, // inserir id aq
        bike_rack_id: user.bike_rack_id,
        ...formData,
      }
      setBicicletasInfo([...bicicletasInfo, newBike])
      toast({
        title: "Bicicleta cadastrada",
        description: "Nova bicicleta foi adicionada com sucesso.",
      })
    }
    
    setIsDialogOpen(false)
    setEditingBike(null)
    setFormData({
      model: "",
      year: new Date().getFullYear(),
      rent_price: 0,
      status: "available",
      tracker_number: 0,
    })
  }

  const handleEdit = (bike: Bike) => {
    setEditingBike(bike)
    setFormData({
      model: bike.model,
      year: bike.year || new Date().getFullYear(),
      rent_price: bike.rent_price,
      status: bike.status,
      tracker_number: bike.tracker_number,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (bikeId: number) => {
    // PREN-AQUI : deletar bike de id bikeId antes do setBicicletasInfo
    setBicicletasInfo(bicicletasInfo?.filter(bike => bike.bike_id !== bikeId))
    toast({
      title: "Bicicleta removida",
      description: "A bicicleta foi removida do sistema.",
    })
  }

  const openNewDialog = () => {
    setEditingBike(null)
    setFormData({
      model: "",
      year: new Date().getFullYear(),
      rent_price: 0,
      status: "available",
      tracker_number: Math.max(...bicicletasInfo?.map(b => b.tracker_number)) + 1,
    })
    setIsDialogOpen(true)
  }

  useEffect(() => {
    // PREN-AQUI
    // lista de todas as bicicletas do user.bike_rack_id
    // interface bicicleta{
    //   id: number,
    //   model: string,
    //   year: number,
    //   image?: string | "/placeholder.svg",
    //   aluguel_price: number,
    //   status: BikeStatus, // Enum: 'available' | 'rented' | 'under_maintenance'
    //   num_rastreador: number,
    //   bike_rack_id: number
    // }


  }, [])

  if(!currentBikeRack){
    return(
      <CantOpen pageName="Bicicletas"/>
  )}

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bicicletas</h1>
            <p className="text-muted-foreground">
              Gerencie o estoque de bicicletas do seu bicicletário
            </p>
          </div>
          <Button onClick={openNewDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Bicicleta
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por modelo ou número..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BikeStatus | "all")}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="available">Disponível</SelectItem>
                  <SelectItem value="rented">Alugada</SelectItem>
                  <SelectItem value="under_maintenance">Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredBikes.map((bike) => (
                <Card key={bike.bike_id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BikeIcon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{bike.model}</CardTitle>
                      </div>
                      <Badge className={statusColors[bike.status]}>
                        {statusLabels[bike.status]}
                      </Badge>
                    </div>
                    <CardDescription>
                      #{bike.tracker_number} • {bike.year}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-2xl font-bold text-primary">
                        R$ {bike.rent_price.toFixed(2)}/h
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEdit(bike)}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(bike.bike_id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredBikes.length === 0 && (
              <div className="text-center py-8">
                <BikeIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Nenhuma bicicleta encontrada</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all" 
                    ? "Tente ajustar os filtros de busca" 
                    : "Cadastre sua primeira bicicleta"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingBike ? "Editar Bicicleta" : "Nova Bicicleta"}
              </DialogTitle>
              <DialogDescription>
                {editingBike 
                  ? "Atualize as informações da bicicleta" 
                  : "Cadastre uma nova bicicleta no sistema"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  placeholder="Mountain Bike Pro"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Ano</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tracker">Número</Label>
                  <Input
                    id="tracker"
                    type="number"
                    value={formData.tracker_number}
                    onChange={(e) => setFormData({ ...formData, tracker_number: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço por hora (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.rent_price}
                  onChange={(e) => setFormData({ ...formData, rent_price: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as BikeStatus })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponível</SelectItem>
                    <SelectItem value="rented">Alugada</SelectItem>
                    <SelectItem value="under_maintenance">Em Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="flex-1">
                {editingBike ? "Salvar" : "Cadastrar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}