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
import { Plus, Pencil, Trash2, Crown, Star, Zap, CreditCard } from "lucide-react";

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  bikeRackId: number;
  bikeRackName: string;
  isActive: boolean;
  subscribers: number;
}

const Plans = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([
    {
      id: 1,
      name: "Plano Básico",
      description: "Acesso a bicicletas por 30 dias com 2 horas diárias incluídas",
      price: 29.90,
      bikeRackId: 1,
      bikeRackName: "Centro - Praça da Sé",
      isActive: true,
      subscribers: 45,
    },
    {
      id: 2,
      name: "Plano Premium",
      description: "Acesso ilimitado a bicicletas por 30 dias",
      price: 59.90,
      bikeRackId: 1,
      bikeRackName: "Centro - Praça da Sé",
      isActive: true,
      subscribers: 23,
    },
    {
      id: 3,
      name: "Plano Estudante",
      description: "Desconto especial para estudantes com 1 hora diária incluída",
      price: 19.90,
      bikeRackId: 2,
      bikeRackName: "Ibirapuera - Portão 2",
      isActive: false,
      subscribers: 12,
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    bikeRackId: 1,
  });

  const bikeRacks = [
    { id: 1, name: "Centro - Praça da Sé" },
    { id: 2, name: "Ibirapuera - Portão 2" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPlan) {
      setPlans(prev => prev.map(plan => 
        plan.id === editingPlan.id 
          ? { 
              ...plan, 
              ...formData, 
              price: parseFloat(formData.price),
              bikeRackName: bikeRacks.find(br => br.id === formData.bikeRackId)?.name || ""
            }
          : plan
      ));
      toast({
        title: "Plano atualizado",
        description: "As informações foram salvas com sucesso.",
      });
    } else {
      const newPlan: Plan = {
        id: Date.now(),
        ...formData,
        price: parseFloat(formData.price),
        bikeRackName: bikeRacks.find(br => br.id === formData.bikeRackId)?.name || "",
        isActive: true,
        subscribers: 0,
      };
      setPlans(prev => [...prev, newPlan]);
      toast({
        title: "Plano criado",
        description: "Novo plano cadastrado com sucesso.",
      });
    }

    setIsDialogOpen(false);
    setEditingPlan(null);
    setFormData({ name: "", description: "", price: "", bikeRackId: 1 });
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price.toString(),
      bikeRackId: plan.bikeRackId,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setPlans(prev => prev.filter(plan => plan.id !== id));
    toast({
      title: "Plano removido",
      description: "O plano foi excluído.",
      variant: "destructive",
    });
  };

  const togglePlanStatus = (id: number) => {
    setPlans(prev => prev.map(plan => 
      plan.id === id ? { ...plan, isActive: !plan.isActive } : plan
    ));
    toast({
      title: "Status alterado",
      description: "O status do plano foi atualizado.",
    });
  };

  const getPlanIcon = (planName: string) => {
    if (planName.toLowerCase().includes("premium")) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (planName.toLowerCase().includes("estudante")) return <Star className="h-5 w-5 text-blue-500" />;
    return <Zap className="h-5 w-5 text-primary" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Planos de Assinatura</h1>
            <p className="text-muted-foreground">Gerencie os planos oferecidos nos bicicletários</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={() => {
                  setEditingPlan(null);
                  setFormData({ name: "", description: "", price: "", bikeRackId: 1 });
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Plano
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingPlan ? "Editar Plano" : "Novo Plano"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="name">Nome do Plano</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ex: Plano Premium"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Descreva os benefícios do plano..."
                      required
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">Preço Mensal (R$)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="29.90"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="bikeRack">Bicicletário</Label>
                    <select
                      id="bikeRack"
                      value={formData.bikeRackId}
                      onChange={(e) => setFormData({...formData, bikeRackId: parseInt(e.target.value)})}
                      className="w-full p-2 border border-border rounded-md bg-background"
                      required
                    >
                      {bikeRacks.map((rack) => (
                        <option key={rack.id} value={rack.id}>
                          {rack.name}
                        </option>
                      ))}
                    </select>
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
                    {editingPlan ? "Salvar" : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className="border-border/50 hover:border-primary/50 transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getPlanIcon(plan.name)}
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                  </div>
                  <Badge variant={plan.isActive ? "default" : "secondary"}>
                    {plan.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {plan.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-1">
                      <CreditCard className="h-4 w-4 text-primary" />
                      <span className="text-2xl font-bold text-primary">
                        R$ {plan.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">por mês</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">{plan.subscribers}</p>
                    <p className="text-xs text-muted-foreground">assinantes</p>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  {plan.bikeRackName}
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePlanStatus(plan.id)}
                    className="flex-1"
                  >
                    {plan.isActive ? "Desativar" : "Ativar"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(plan)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(plan.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {plans.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum plano cadastrado</p>
              <p className="text-sm text-muted-foreground mt-2">
                Clique em "Novo Plano" para começar
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Plans;