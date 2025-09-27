import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, MapPin, Building2, Bike, List, SquarePlus, CircleUserRound, Crown, CrownIcon, Bolt, Package } from "lucide-react";
import { BikeRackType, useBikeRacks } from "@/contexts/bikerack-context";
import { useAuth } from "@/contexts/auth-context";
import { Link, useNavigate } from "react-router-dom";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { UserRole } from "@/types";

interface BikeRack {
  id: number;
  name: string;
  role?: UserRole
  street: string;
  number: number | null;
  city: string;
  state: string;
  zipCode: string;
  image?: string;
}

const roleColors = {
  customer: "bg-primary text-primary-foreground",
  owner: "bg-success text-success-foreground",
  manager: "bg-secondary text-secondary-foreground",
  attendant: "bg-destructive text-destructive-foreground",
}

const roleLabels = {
  customer: "Cliente",
  owner: "Proprietário", 
  manager: "Gerente", 
  attendant: "Atendente",
}

const roleIcons = {
  customer: CircleUserRound,
  owner: CrownIcon,
  manager: Bolt,
  attendant: Package,
}

export const QuickAction = ({ title, description, icon: Icon, href, onClick, btnText, role}: {
  title: string
  description: string
  icon: any
  href?: string
  onClick?: () => void
  btnText?: string
  role?: UserRole
}) => {
  const RoleIcon = role ? roleIcons[role] : null;

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-left gap-3">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-sm bg-primary/10 flex items-center justify-center">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-base">{title}</CardTitle>
            </div>
            <CardDescription>{description}</CardDescription>
          </div>
          {role &&
            <Badge className={roleColors[role]}>
              {RoleIcon && <RoleIcon className="h-3 w-3 mr-1" />}
              {roleLabels[role]}
            </Badge>
          }
        </div>
      </CardHeader>
      <CardContent>
        <Button variant="outline" size="sm" asChild>
          <Link to={href}>{btnText? btnText :"Acessar"}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

const OptionCard = ({ title, description, onCLickFunction }: { title: string; description: string; onCLickFunction: () => void }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <Button variant="outline" asChild onClick={() => onCLickFunction}>
        Adicionar
      </Button>
    </CardContent>
  </Card>
);

const BikeRacks = () => {
  const nav = useNavigate();

  const { toast } = useToast();
  const { user, authLoading } = useAuth()
  const {
    currentBikeRack,
    userBikeRacks,
    bikeRackLoading,
    createBikeRack,
    selectBikeRack,
    refetch,
  } = useBikeRacks();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const [editingBikeRack, setEditingBikeRack] = useState<BikeRack | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    street: "",
    num: null,
    city: "",
    state: "",
    zipCode: "",
  });
  const [newBikeRacksList, setNewBikeRacksList] = useState<BikeRack[]>([]);
  
  useEffect(() => {
    fetchNewBikeRacks();
  }, [createBikeRack, userBikeRacks])

  const fetchNewBikeRacks = async () => {
    try {
      const res = await fetch(`http://localhost:4000/user/notRelatedBikerack/${user.user_id}`);
      
      if(!res.ok) {
        toast({
          title: "Erro ao buscar bicicletários!",
          description: "Problemas ao procurar novos bicicletários.",
          variant: "destructive"
        });
        return;
      }

      const data = await res.json();
      
      setNewBikeRacksList(data.map(bikerack => {
        const newBikeRack: BikeRack = {
          id: bikerack.bike_rack_id,
          name: bikerack.name,
          role: bikerack.role ? bikerack.role : null,
          street: bikerack.street ? bikerack.street : null,
          number: bikerack.num ? bikerack.num : null,
          zipCode: bikerack.zip_code ? bikerack.zip_code : null,
          city: bikerack.city ? bikerack.city : null,
          state: bikerack.state ? bikerack.state : null,
        };
        return newBikeRack;
      }));

    } catch (err) {
      toast({
        title: "Erro ao buscar bicicletários!",
        description: "Parece que há problemas na conexão com o servidor.",
        variant: "destructive"
      });
      console.error(`Erro ao buscar bicicletários: ${err}`);
    }
  }

  const clearFormData = () => {
    setFormData({
      name: "",
      street: "",
      num: null,
      city: "",
      state: "",
      zipCode: "",
    })
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    if(createBikeRack({
      id: null,
      name: formData.name,
      address: {
          street: formData.street,
          number: formData.num,
          zip_code: formData.zipCode,
          city: formData.city,
          state: formData.state,
      }
    } as BikeRackType)){
      toast({
        title: "Sucesso!",
        description: `Bicicletário ${formData.name} criado com sucesso!`,
      })
      setIsDialogOpen(false);
      setEditingBikeRack(null);
      clearFormData();

    }else{
      toast({
        title: "Erro!",
        description: "Problemas ao tentar criar Bicicletário!",
        variant: "destructive"
      })
    }

    setIsDialogOpen(false);
    setEditingBikeRack(null);
    clearFormData();
  };

  const handleEdit = (bikeRack: BikeRack) => {
    setEditingBikeRack(bikeRack);
    setFormData({
      name: bikeRack.name,
      street: bikeRack.street,
      num: bikeRack.number,
      city: bikeRack.city,
      state: bikeRack.state,
      zipCode: bikeRack.zipCode,
    });
    setIsDialogOpen(true);
  };

  const handleAdd = async (br_id: number) => {
    try{
      const res = await fetch(`http://localhost:4000/user/setRole`, {
        method: 'POST',
        headers: {
          'Content-Type': "application/json",
          'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify({
          id_user: user.user_id,
          id_bikerack: br_id,
          role: "customer"
        })
      });

      const data = await res.json();

      if(!data.ok){
        toast({
          title: "Erro ao adicionar bicicletário!",
          description: "Bicicletário ou usuário inválidos.",
          variant: "destructive"
        })
        return;
      }

      refetch();    
      toast({
        title: "Bicicletário adicionado!",
        description: "Agora pode acessar esse bicicletário como cliente."
      });
      
    }catch(err){
      toast({
        title: "Erro ao tentar adicionar bicicletário!",
        description: "Parece que há um problema com a conexão com o servidor.",
        variant: "destructive"
      })
    }
  }

  const handleDelete = (id: number) => {
    // setBikeRacks(prev => prev.filter(rack => rack.id !== id));
    // toast({
    //   title: "Bicicletário removido",
    //   description: "O estabelecimento foi excluído.",
    //   variant: "destructive",
    // });
  };

  const getAvailabilityBadge = (available: number, total: number) => {
    const percentage = total > 0 ? (available / total) * 100 : 0;
    if (percentage >= 70) return <Badge className="bg-success text-success-foreground">Alta</Badge>;
    if (percentage >= 30) return <Badge className="bg-warning text-warning-foreground">Média</Badge>;
    return <Badge className="bg-destructive text-destructive-foreground">Baixa</Badge>;
  };

  if (authLoading || bikeRackLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div>Carregando ({authLoading ? "Autenticação" : "Bicicletários"})...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div>Usuário não autenticado</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Label className="text-3xl font-bold tracking-tight">
        Bicicletários
      </Label>
      <p className="text-muted-foreground">
        Gerenciamento de bicicletários relacionados
      </p>
      <div className="mt-4">
        <div className="mt-6 mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <QuickAction
            title="Buscar Biciletários"
            description="Adicione um bicicletário para alugar bicicletas online!"
            icon={List}
            btnText="Buscar"
            onClick={() => {
              fetchNewBikeRacks();
              setIsListOpen(true);
            }} // adicionar abertura do modal de listagem/seleção
          />
          <QuickAction
            title="Crie seu Biciletário"
            description="Você pode criar e gerenciar seu próprio bicicletário!"
            icon={SquarePlus}
            btnText="Criar"
            onClick={() => {
              setEditingBikeRack(null);
              clearFormData();
              setIsDialogOpen(true);
            }}
          />
        </div>

        {
          userBikeRacks.length != 0 &&
          <Label className="text-2xl">
            Visualizar bicicletário:
          </Label>
        }
        <div className="mt-6 mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {
            userBikeRacks?.map((bikerack, index) => {
              let address = bikerack.address
              let addrStr = address ?
                `${address.street}, ${address.number} - ${address.zip_code}, ${address.city} - ${address.state}`
                : ""
              return (
                <QuickAction
                  key={bikerack.id}
                  title={bikerack.name}
                  description={addrStr}
                  icon={Bike}
                  onClick={() => {
                    selectBikeRack(index);
                    nav('/dashboard')
                  }}
                  // adicionar bikerack.role, quando for fornecida pelo back (atualizar context também)
                />
              )
            })
          }
        </div>
      </div>

      {/* Caixa de Criação */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Novo Bicicletário
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Nome do Estabelecimento</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Bicicletário A"
                  required
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    placeholder="Ex: Rua das Flores, 123"
                    required
                  />
                </div>
                <div className="col-span-1">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={formData.num ? `${formData.num}`:""}
                    onChange={(e) => setFormData({ ...formData, num: Number(e.target.value) })}
                    placeholder="Ex: 10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="zipCode">CEP</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  placeholder="01001-000"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="São Paulo"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="SP"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  clearFormData();
                  setIsDialogOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-primary/70 hover:bg-primary"
              >
                Criar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Caixa de Lista de Bicicletários */}
      <Dialog open={isListOpen} onOpenChange={setIsListOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Seja cliente de outros bicicletários!
            </DialogTitle>
          </DialogHeader>

          {
            newBikeRacksList.length === 0 ?
            <div className="h-[200px] w-full flex items-center justify-center">
              <h1>Ops... Parece que não há outros biciclerários!</h1>
            </div>
            :
            <ScrollArea className="h-[400px] w-full">
              {
                newBikeRacksList.map(newBikeRack => {
                  let address = newBikeRack.street ?
                    `${newBikeRack.street}, ${newBikeRack.number} - ${newBikeRack.zipCode}, ${newBikeRack.city} - ${newBikeRack.state}`
                    : ""
                  return (
                    <OptionCard
                      title={newBikeRack.name}
                      description={address}
                      onCLickFunction={() => {
                        handleAdd(newBikeRack.id)
                      }}
                    />
                  )
                })
              }
            </ScrollArea>
          }

        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
};

export default BikeRacks;