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
import { Plus, Search, Edit, Trash2, Users as UsersIcon, Mail, Phone, Filter, UserCheck, Shield, Crown, CircleUserRound, CrownIcon, Bolt, Package } from "lucide-react";
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
  customer: "bg-primary text-primary-foreground",
  owner: "bg-warning text-warning-foreground",
  manager: "bg-success text-primary-foreground",
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

export default function Users() {
  const { user, userRole } = useAuth();
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
    fetch(`http://localhost:4000/user/changeRole`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem('token'),
      },
      body: JSON.stringify({
        id_user: editingUser.user_id,
        id_bikerack: currentBikeRack.id,
        role: formData.role
      })
    }).then(res => {
      if (!res.ok) {
        toast({
          title: "Erro ao promover usuário!",
          description: "Parece que houve um problema ao tentar promover usuário.",
          variant: 'destructive'
        });
        throw new Error("Erro ao atualizar usuário");
      }
      return res.json();
    }).then(data => {
      setUsuarios(usuarios.map(user => user.user_id === editingUser.user_id ? {
        ...user,
        ...formData
      } : user));

      // NOTIFICAÇÃO: adicionar a notificação pro usuário editingUser.user_id

      toast({
        title: "Usuário promovido!",
        description: "Usuário promovido com sucesso. Ele será notificado desta ação."
      });
    }).catch(err => {
      toast({
        title: "Erro ao promover usuário!",
        description: "Parece que houve um problema no servidor.",
        variant: "destructive"
      });
    });

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
  const handleDelete = async (userId: number) => {
      fetch(`http://localhost:4000/user/deleteRole/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + localStorage.getItem('token')
      },
      body: JSON.stringify({
        id_user: userId,
        id_bikerack: currentBikeRack.id
      })
    })
    .then(res => {
      if(!res.ok){
        toast({
          title: "Erro ao remover usuário!",
          description: "Parece que houve um problema ao tentar remover o usuário.",
          variant: 'destructive'
        })
        return;
      }

      return res.json()
    })
    .then(data => {
      fetchUsers();

      // NOTIFICAÇÃO: Usuário é notificado que foi removido do bicicletário tal;

      toast({
        title: "Usuário removido!",
        description: "O usuário foi removido com sucesso.",
      })
    })
    .catch(err => {
      toast({
        title: "Erro ao remover usuário!",
        description: "Parece que houve problemas no servidor.",
        variant: 'destructive'
      })
    })
  };

  const openNewDialog = () => {
    setEditingUser(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const fetchUsers = async () => {
    fetch(`http://localhost:4000/bikerack/getUsers/${currentBikeRack.id}`)
    .then(res => {
      if(!res.ok){
        toast({
          title: "Erro ao buscar usuários!",
          description: "Parece que houve um problema na busca.",
          variant: 'destructive'
        })
        return;
      }
      return res.json();
    }).then(data => {
      setUsuarios(data.map(user => {
        return ({
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          cpf: user.cpf,
          phone: user.phone,
          address_id: user.address_id,
          address: {
            address_id: user.address_id,
            street: user.street,
            num: user.num,
            zip_code: user.zip_code,
            city: user.city,
            state: user.state,
          },
          role: user.role
        } as UserWithRole)
      }))
      // toast({
      //   title: "Usuários carregados com sucesso!",
      //   description: "Agora você pode observar seus usuários."
      // })
    })
    .catch(err => {
      console.log(err)
      toast({
        title: "Erro ao buscar usuários!",
        description: "Parece que há um problema com o servidor.",
        variant: 'destructive'
      })
    })
  }

  useEffect(() => {
    if(!currentBikeRack){
      return;
    }

    fetchUsers()
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
          {/* <Button onClick={openNewDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Usuário
          </Button> */}
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
              {filteredUsers.map(br_user => {
              const RoleIcon = roleIcons[br_user.role];
              return <Card key={br_user.user_id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {br_user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <CardTitle className="text-lg">{br_user.name}</CardTitle>
                            <CardDescription>ID: {br_user.user_id}</CardDescription>
                          </div>
                        </div>
                        <Badge className={roleColors[br_user.role]}>
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {roleLabels[br_user.role]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{br_user.email}</p>
                            <p className="text-xs text-muted-foreground">Email</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{br_user.phone}</p>
                            <p className="text-xs text-muted-foreground">Telefone</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <UsersIcon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{br_user.cpf}</p>
                            <p className="text-xs text-muted-foreground">CPF</p>
                          </div>
                        </div>
                      </div>
                      
                      {
                        ((userRole === 'manager' || userRole === 'owner') && br_user.role !== 'owner') &&
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(br_user)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(br_user.user_id)} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remover
                          </Button>
                        </div>
                      }
                    </CardContent>
                  </Card>
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
                <Input 
                  id="name" 
                  placeholder="João Silva" 
                  value={formData.name} 
                  onChange={e => setFormData({
                    ...formData,
                    name: e.target.value
                  })} 
                  disabled={true}
                  className="mx-0" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="joao@email.com" 
                    value={formData.email} 
                    onChange={e => setFormData({
                      ...formData,
                      email: e.target.value
                    })} 
                    disabled={true}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input 
                    id="phone" 
                    placeholder="11999999999" 
                    value={formData.phone} 
                    onChange={e => setFormData({
                      ...formData,
                      phone: e.target.value
                    })} 
                    disabled={true}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input 
                    id="cpf" 
                    placeholder="12345678901" 
                    value={formData.cpf} 
                    onChange={e => setFormData({
                      ...formData,
                      cpf: e.target.value
                    })} 
                    disabled={true}
                  />
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
                      { userRole === 'owner' && <SelectItem value="manager">Gerente</SelectItem>}
                      { userRole === 'owner' && <SelectItem value="owner">Proprietário</SelectItem>}
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
                      <Input 
                        id="street" 
                        placeholder="Rua das Flores" 
                        value={formData.street} 
                        onChange={e => setFormData({
                          ...formData,
                          street: e.target.value
                        })} 
                        disabled={true}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="num">Número</Label>
                      <Input 
                        id="num" 
                        placeholder="123" 
                        value={formData.num} 
                        onChange={e => setFormData({
                          ...formData,
                          num: e.target.value
                        })} 
                        disabled={true}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zip_code">CEP</Label>
                      <Input 
                        id="zip_code" 
                        placeholder="01234-567" 
                        value={formData.zip_code} 
                        onChange={e => setFormData({
                          ...formData,
                          zip_code: e.target.value
                        })} 
                        disabled={true}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input 
                        id="city" 
                        placeholder="São Paulo" 
                        value={formData.city} 
                        onChange={e => setFormData({
                          ...formData,
                          city: e.target.value
                        })} 
                        disabled={true}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input 
                        id="state" 
                        placeholder="SP" 
                        value={formData.state} 
                        onChange={e => setFormData({
                          ...formData,
                          state: e.target.value
                        })} 
                        disabled={true}
                      />
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