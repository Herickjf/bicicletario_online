import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Edit, Trash2, Users as UsersIcon, Mail, Phone, Filter, UserCheck, Shield, Crown } from "lucide-react";
import { UserRole, User } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { useBikeRacks } from "@/contexts/bikerack-context";
import CantOpen from "@/components/layout/cant-open";
interface UserWithRole extends User {
  role: UserRole;
}
const mockUsers: UserWithRole[] = [{
  user_id: 1,
  name: "João Silva",
  email: "joao@email.com",
  cpf: "12345678901",
  phone: "11999999999",
  address_id: 1,
  role: "owner"
}, {
  user_id: 2,
  name: "Maria Santos",
  email: "maria@email.com",
  cpf: "98765432100",
  phone: "11888888888",
  address_id: 2,
  role: "manager"
}, {
  user_id: 3,
  name: "Carlos Oliveira",
  email: "carlos@email.com",
  cpf: "45678912300",
  phone: "11777777777",
  address_id: 3,
  role: "attendant"
}, {
  user_id: 4,
  name: "Ana Costa",
  email: "ana@email.com",
  cpf: "78912345600",
  phone: "11666666666",
  address_id: 4,
  role: "customer"
}];
const roleColors = {
  owner: "bg-accent text-accent-foreground",
  manager: "bg-primary text-primary-foreground",
  attendant: "bg-secondary text-secondary-foreground",
  customer: "bg-muted text-muted-foreground"
};
const roleLabels = {
  owner: "Proprietário",
  manager: "Gerente",
  attendant: "Vendedor",
  customer: "Cliente"
};
const roleIcons = {
  owner: Crown,
  manager: Shield,
  attendant: UserCheck,
  customer: UsersIcon
};
export default function Users() {
  const { user } = useAuth();
  const { currentBikeRack } = useBikeRacks();
  const [ usuarios, setUsuarios ] = useState<UserWithRole[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
    role: "customer" as UserRole,
    street: "",
    num: "",
    zip_code: "",
    city: "",
    state: ""
  });
  const {
    toast
  } = useToast();
  const filteredUsers = usuarios.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()) || user.cpf.includes(searchTerm);
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });
  const handleSave = () => {
    if (editingUser) {
      // PREN-AQUI : atualizar o usuário de id: editingUser.user_id com os dados de formData

      fetch(`http://localhost:4000/user/update/${editingUser.user_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      }).then(res => {
        if (!res.ok) {
          throw new Error("Erro ao atualizar usuário");
        }
        return res.json();
      }).then(data => {
        console.log("Usuário atualizado:", data);
        setUsuarios(usuarios.map(user => user.user_id === editingUser.user_id ? {
          ...user,
          ...formData
        } : user));
        toast({
          title: "Usuário atualizado",
          description: "As informações foram salvas com sucesso."
        });
      }).catch(err => {
        console.error(err);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o usuário.",
          variant: "destructive"
        });
      });
    } else {
      const newUser: UserWithRole = {
        user_id: Math.max(...usuarios.map(u => u.user_id)) + 1,
        address_id: 1,
        ...formData
      };
      setUsuarios([...usuarios, newUser]);
      toast({
        title: "Usuário cadastrado",
        description: "Novo usuário foi adicionado com sucesso."
      });
    }
    setIsDialogOpen(false);
    setEditingUser(null);
    resetForm();
  };
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      cpf: "",
      phone: "",
      role: "customer",
      street: "",
      num: "",
      zip_code: "",
      city: "",
      state: ""
    });
  };
  const handleEdit = (user: UserWithRole) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      cpf: user.cpf,
      phone: user.phone,
      role: user.role,
      street: "",
      num: "",
      zip_code: "",
      city: "",
      state: ""
    });
    setIsDialogOpen(true);
  };
  const handleDelete = (userId: number) => {
    // PREN-AQUI : remover usuário de ID userId
    setUsuarios(usuarios.filter(user => user.user_id !== userId));
    toast({
      title: "Usuário removido",
      description: "O usuário foi removido do sistema."
    });
  };
  const openNewDialog = () => {
    setEditingUser(null);
    resetForm();
    setIsDialogOpen(true);
  };

  useEffect(() => {
    // PREN-AQUI : preencher a lista de usuários com role:
    // export interface UserWithRole {
    //   user_id: number;
    //   name: string;
    //   email: string;
    //   cpf: string;
    //   phone: string;
    //   address_id: number;
    //   address?: Address;
    //   role: UserRole ('owner' | 'manager' | 'attendant' | 'customer')
    // }

    
  }, [])

  if(!currentBikeRack){
    return(
      <CantOpen pageName="Usuários"/>
  )}

  return <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
            <p className="text-muted-foreground">
              Gerencie funcionários e clientes do sistema
            </p>
          </div>
          <Button onClick={openNewDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Usuário
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por nome, email ou CPF..." className="pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <Select value={roleFilter} onValueChange={value => setRoleFilter(value as UserRole | "all")}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por função" className="px-0 mx-[5px]" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as funções</SelectItem>
                  <SelectItem value="owner">Proprietário</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="attendant">Vendedor</SelectItem>
                  <SelectItem value="customer" className="mx-[5px]">Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map(user => {
              const RoleIcon = roleIcons[user.role];
              return <Card key={user.user_id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <CardTitle className="text-lg">{user.name}</CardTitle>
                            <CardDescription>ID: {user.user_id}</CardDescription>
                          </div>
                        </div>
                        <Badge className={roleColors[user.role]}>
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {roleLabels[user.role]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{user.email}</p>
                            <p className="text-xs text-muted-foreground">Email</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{user.phone}</p>
                            <p className="text-xs text-muted-foreground">Telefone</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <UsersIcon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{user.cpf}</p>
                            <p className="text-xs text-muted-foreground">CPF</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(user.user_id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remover
                        </Button>
                      </div>
                    </CardContent>
                  </Card>;
            })}
            </div>
            
            {filteredUsers.length === 0 && <div className="text-center py-8">
                <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Nenhum usuário encontrado</h3>
                <p className="text-muted-foreground">
                  {searchTerm || roleFilter !== "all" ? "Tente ajustar os filtros de busca" : "Cadastre o primeiro usuário"}
                </p>
              </div>}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Editar Usuário" : "Novo Usuário"}
              </DialogTitle>
              <DialogDescription>
                {editingUser ? "Atualize as informações do usuário" : "Cadastre um novo usuário no sistema"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-96 overflow-y-auto mx-0 px-[10px]">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" placeholder="João Silva" value={formData.name} onChange={e => setFormData({
                ...formData,
                name: e.target.value
              })} className="mx-0" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="joao@email.com" value={formData.email} onChange={e => setFormData({
                  ...formData,
                  email: e.target.value
                })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" placeholder="11999999999" value={formData.phone} onChange={e => setFormData({
                  ...formData,
                  phone: e.target.value
                })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" placeholder="12345678901" value={formData.cpf} onChange={e => setFormData({
                  ...formData,
                  cpf: e.target.value
                })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Função</Label>
                  <Select value={formData.role} onValueChange={value => setFormData({
                  ...formData,
                  role: value as UserRole
                })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Cliente</SelectItem>
                      <SelectItem value="attendant">Vendedor</SelectItem>
                      <SelectItem value="manager">Gerente</SelectItem>
                      <SelectItem value="owner">Proprietário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3">Endereço</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="street">Rua</Label>
                      <Input id="street" placeholder="Rua das Flores" value={formData.street} onChange={e => setFormData({
                      ...formData,
                      street: e.target.value
                    })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="num">Número</Label>
                      <Input id="num" placeholder="123" value={formData.num} onChange={e => setFormData({
                      ...formData,
                      num: e.target.value
                    })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zip_code">CEP</Label>
                      <Input id="zip_code" placeholder="01234-567" value={formData.zip_code} onChange={e => setFormData({
                      ...formData,
                      zip_code: e.target.value
                    })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input id="city" placeholder="São Paulo" value={formData.city} onChange={e => setFormData({
                      ...formData,
                      city: e.target.value
                    })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input id="state" placeholder="SP" value={formData.state} onChange={e => setFormData({
                      ...formData,
                      state: e.target.value
                    })} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="flex-1">
                {editingUser ? "Salvar" : "Cadastrar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>;
}