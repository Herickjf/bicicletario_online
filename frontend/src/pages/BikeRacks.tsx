import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, MapPin, Building2 } from "lucide-react";

interface BikeRack {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  totalBikes: number;
  availableBikes: number;
  image?: string;
}

const BikeRacks = () => {
  const { toast } = useToast();
  const [bikeRacks, setBikeRacks] = useState<BikeRack[]>([
    {
      id: 1,
      name: "Centro - Praça da Sé",
      address: "Praça da Sé, 100",
      city: "São Paulo",
      state: "SP",
      zipCode: "01001-000",
      totalBikes: 20,
      availableBikes: 15,
    },
    {
      id: 2,
      name: "Ibirapuera - Portão 2",
      address: "Av. Paulista, 1578",
      city: "São Paulo", 
      state: "SP",
      zipCode: "04038-001",
      totalBikes: 15,
      availableBikes: 8,
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBikeRack, setEditingBikeRack] = useState<BikeRack | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingBikeRack) {
      setBikeRacks(prev => prev.map(rack => 
        rack.id === editingBikeRack.id 
          ? { ...rack, ...formData }
          : rack
      ));
      toast({
        title: "Bicicletário atualizado",
        description: "As informações foram salvas com sucesso.",
      });
    } else {
      const newBikeRack: BikeRack = {
        id: Date.now(),
        ...formData,
        totalBikes: 0,
        availableBikes: 0,
      };
      setBikeRacks(prev => [...prev, newBikeRack]);
      toast({
        title: "Bicicletário criado",
        description: "Novo estabelecimento cadastrado com sucesso.",
      });
    }

    setIsDialogOpen(false);
    setEditingBikeRack(null);
    setFormData({ name: "", address: "", city: "", state: "", zipCode: "" });
  };

  const handleEdit = (bikeRack: BikeRack) => {
    setEditingBikeRack(bikeRack);
    setFormData({
      name: bikeRack.name,
      address: bikeRack.address,
      city: bikeRack.city,
      state: bikeRack.state,
      zipCode: bikeRack.zipCode,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setBikeRacks(prev => prev.filter(rack => rack.id !== id));
    toast({
      title: "Bicicletário removido",
      description: "O estabelecimento foi excluído.",
      variant: "destructive",
    });
  };

  const getAvailabilityBadge = (available: number, total: number) => {
    const percentage = total > 0 ? (available / total) * 100 : 0;
    if (percentage >= 70) return <Badge className="bg-success text-success-foreground">Alta</Badge>;
    if (percentage >= 30) return <Badge className="bg-warning text-warning-foreground">Média</Badge>;
    return <Badge className="bg-destructive text-destructive-foreground">Baixa</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Bicicletários</h1>
            <p className="text-muted-foreground">Gerencie os estabelecimentos cadastrados</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={() => {
                  setEditingBikeRack(null);
                  setFormData({ name: "", address: "", city: "", state: "", zipCode: "" });
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Bicicletário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingBikeRack ? "Editar Bicicletário" : "Novo Bicicletário"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="name">Nome do Estabelecimento</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ex: Centro - Praça da Sé"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Ex: Rua das Flores, 123"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        placeholder="São Paulo"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                        placeholder="SP"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="zipCode">CEP</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                      placeholder="01001-000"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    {editingBikeRack ? "Salvar" : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bikeRacks.map((rack) => (
            <Card key={rack.id} className="border-border/50 hover:border-primary/50 transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{rack.name}</CardTitle>
                  </div>
                  {getAvailabilityBadge(rack.availableBikes, rack.totalBikes)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>{rack.address}, {rack.city} - {rack.state}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Bicicletas Disponíveis:</span>
                  <span className="font-medium text-primary">
                    {rack.availableBikes}/{rack.totalBikes}
                  </span>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(rack)}
                    className="flex-1"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(rack.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {bikeRacks.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum bicicletário cadastrado</p>
              <p className="text-sm text-muted-foreground mt-2">
                Clique em "Novo Bicicletário" para começar
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BikeRacks;