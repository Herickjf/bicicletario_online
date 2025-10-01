import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useAuth } from "@/contexts/auth-context"
import { 
  Bike, 
  Users, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Clock,
  MapPin,
  Package,
  SquarePlus,
  List,
  MousePointer2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { add } from "date-fns"
import { useBikeRacks } from "@/contexts/bikerack-context"
import CantOpen from "@/components/layout/cant-open"

const StatCard = ({ title, value, description, icon: Icon, trend }: {
  title: string
  value: string
  description: string
  icon: any
  trend?: string
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-base font-medium">{title}</CardTitle>
      <Icon className="h-6 w-6 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">
        {trend && (
          <span className="text-success font-medium">{trend}</span>
        )}
        {description}
      </p>
    </CardContent>
  </Card>
)

const OptionCard = ({ title, description, href }: { title: string; description: string; href: string }) => (
  <Card className="hover:shadow-md transition-shadow cursor-pointer">
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <Button variant="outline" asChild>
        <Link to={href}>Ir</Link>
      </Button>
    </CardContent>
  </Card>
);

interface BikeRack {
  id: number;
  name: string;
  address: {
    street: string,
    number: string,
    zip_code: string,
    city: string,
    state: string
  }
}

export const QuickAction = ({ title, description, icon: Icon, href, onClick, btnText}: {
  title: string
  description: string
  icon: any
  href?: string
  onClick?: () => void
  btnText?: string
}) => (
  <Card 
    className="hover:shadow-md transition-shadow cursor-pointer"
    onClick={onClick}
  >
    <CardHeader>
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
      </div>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <Button variant="outline" size="sm" asChild>
        <Link to={href}>{btnText? btnText :"Acessar"}</Link>
      </Button>
    </CardContent>
  </Card>
)

interface bicicletas {
  num_bicicletas: number
}

interface alugueis {
  num_alugueis: number
}

interface receita {
  receita_mensal: number,
  percent_aumento: number
}

interface clientes {
  num_clientes: number,
}

export default function Dashboard() {
  const {currentBikeRack} = useBikeRacks();
  const { user, userRole,authLoading } = useAuth()

  const [ bicicletasInfo, setBicicletasInfo ] = useState<bicicletas | null>(null);  
  const [ alugueisInfo, setAlugueisInfo ] = useState<alugueis | null>(null);
  const [ receitaInfo, setReceitaInfo ] = useState<receita | null>(null);
  const [ clientesInfo, setClientesInfo ] = useState<clientes | null>(null);
  
  useEffect(() => {
    if (!currentBikeRack.id) return;
    
    fetch(`http://localhost:4000/bikerack/mainScreenInfo/${currentBikeRack.id}`)
      .then(res => res.json())
      .then(data => {
        setBicicletasInfo({num_bicicletas: data[0].num_bicicletas});
        setAlugueisInfo({num_alugueis: data[0].num_alugueis});
        setReceitaInfo({receita_mensal: data[0].receita_mensal, percent_aumento: data[0].percent_aumento});
        setClientesInfo({num_clientes: data[0].num_clientes});
      })
      .catch(err => console.error('Erro ao buscar informações das bicicletas:', err));
  }, [currentBikeRack])

  // console.log("currentBikerack: ", currentBikeRack)
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div>Carregando autenticação...</div>
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

  const renderOwnerDashboard = () => (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Bicicletas Cadastradas"
          value={`${bicicletasInfo ? bicicletasInfo.num_bicicletas: 0}`}
          description="Total de Bicicletas"
          icon={Bike}
        />
        <StatCard
          title="Aluguéis Ativos"
          value={`${alugueisInfo ? alugueisInfo.num_alugueis : 0}`}
          description="Em andamento agora"
          icon={Calendar}
        />
        <StatCard
          title="Receita Mensal"
          value={`R$ ${receitaInfo ? receitaInfo.receita_mensal : 0.0}`}
          description=" desde o início do mês"
          icon={DollarSign}
          trend={`+${receitaInfo ? receitaInfo.percent_aumento : 0.0}%`}
        />
        <StatCard
          title="Usuários Cadastrados"
          value={`${clientesInfo ? clientesInfo.num_clientes : 0}`}
          description="Total de clientes"
          icon={Users}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <QuickAction
          title="Gerenciar Bicicletas"
          description="Adicionar, editar e ver status das bicicletas"
          icon={Bike}
          href="/bikes"
        />
        <QuickAction
          title="Novo Aluguel"
          description="Criar um novo aluguel para cliente"
          icon={Calendar}
          href="/rentals/new"
        />
        <QuickAction
          title="Relatórios"
          description="Ver relatórios de performance e receita"
          icon={TrendingUp}
          href="/reports"
        />
        <QuickAction
          title="Gerenciar Usuários"
          description="Adicionar funcionários e ver clientes"
          icon={Users}
          href="/users"
        />
        <QuickAction
          title="Planos"
          description="Criar e gerenciar planos de assinatura"
          icon={Package}
          href="/plans"
        />
        <QuickAction
          title="Configurações"
          description="Configurar bicicletário e preferências"
          icon={MapPin}
          href="/settings"
        />
      </div>
    </>
  )

  const renderManagerDashboard = () => (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Bicicletas Disponíveis"
          value="16"
          description="De 24 total"
          icon={Bike}
        />
        <StatCard
          title="Aluguéis Hoje"
          value="12"
          description="Finalizados e ativos"
          icon={Calendar}
        />
        <StatCard
          title="Receita do Dia"
          value="R$ 284"
          description="Arrecadado hoje"
          icon={DollarSign}
        />
        <StatCard
          title="Funcionários"
          value="3"
          description="Vendedores ativos"
          icon={Users}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <QuickAction
          title="Gerenciar Bicicletas"
          description="Ver status e atualizar bicicletas"
          icon={Bike}
          href="/bikes"
        />
        <QuickAction
          title="Aluguéis"
          description="Ver e gerenciar aluguéis"
          icon={Calendar}
          href="/rentals"
        />
        <QuickAction
          title="Funcionários"
          description="Gerenciar vendedores"
          icon={Users}
          href="/employees"
        />
        <QuickAction
          title="Relatórios"
          description="Relatórios de performance"
          icon={TrendingUp}
          href="/reports"
        />
        <QuickAction
          title="Planos"
          description="Gerenciar planos disponíveis"
          icon={Package}
          href="/plans"
        />
      </div>
    </>
  )

  const renderAttendantDashboard = () => (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Bicicletas Disponíveis"
          value="16"
          description="Prontas para aluguel"
          icon={Bike}
        />
        <StatCard
          title="Meus Aluguéis Hoje"
          value="5"
          description="Realizados por mim"
          icon={Calendar}
        />
        <StatCard
          title="Tempo Médio"
          value="2.5h"
          description="Por aluguel hoje"
          icon={Clock}
        />
        <StatCard
          title="Clientes Atendidos"
          value="8"
          description="Hoje"
          icon={Users}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <QuickAction
          title="Novo Aluguel"
          description="Iniciar um novo aluguel"
          icon={Calendar}
          href="/rentals/new"
        />
        <QuickAction
          title="Ver Bicicletas"
          description="Status das bicicletas"
          icon={Bike}
          href="/bikes"
        />
        <QuickAction
          title="Gerenciar Clientes"
          description="Cadastrar e editar clientes"
          icon={Users}
          href="/customers"
        />
      </div>
    </>
  )

  const renderCustomerDashboard = () => (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Aluguéis Este Mês"
          value="3"
          description="Total realizados"
          icon={Calendar}
        />
        <StatCard
          title="Tempo Total"
          value="8.5h"
          description="Pedaladas este mês"
          icon={Clock}
        />
        <StatCard
          title="Valor Gasto"
          value="R$ 45"
          description="Este mês"
          icon={DollarSign}
        />
        <StatCard
          title="Bicicletários"
          value="2"
          description="Já visitados"
          icon={MapPin}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <QuickAction
          title="Buscar Bicicletários"
          description="Encontrar bicicletários próximos"
          icon={MapPin}
          href="/browse-racks"
        />
        <QuickAction
          title="Meus Aluguéis"
          description="Ver histórico de aluguéis"
          icon={Calendar}
          href="/my-rentals"
        />
        <QuickAction
          title="Planos"
          description="Ver planos disponíveis"
          icon={Package}
          href="/subscriptions"
        />
      </div>
    </>
  )

  if(!currentBikeRack){
    return(
      <CantOpen pageName="Dashboard"/>
  )}

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Bem-vindo(a), {user.name}!
            </h1>
            <p className="text-muted-foreground">
              {userRole === 'owner' && 'Visão geral do seu bicicletário'}
              {userRole === 'manager' && 'Painel de gerenciamento'}
              {userRole === 'attendant' && 'Painel de vendas'}
              {userRole === 'customer' && 'Suas atividades e opções'}
            </p>
          </div>

          {/* {!user.bike_rack_id ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                <OptionCard
                  title="Participar de um BikeRack"
                  description="Escolha um bicicletário existente para se juntar e começar a alugar bicicletas."
                  href="/join-rack"
                />
                <OptionCard
                  title="Criar um BikeRack"
                  description="Crie seu próprio bicicletário e gerencie bicicletas, aluguéis e clientes."
                  href="/create-rack"
                />
              </div>

              {bikeRacks.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-2xl font-semibold mb-2">Bicicletários que você participa</h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {bikeRacks.map(rack => (
                      <Card key={rack.id}>
                        <CardHeader>
                          <CardTitle>{rack.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Button variant="outline" onClick={() => user.bike_rack_id=rack.id} asChild>
                            Acessar Bicicletário
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null} */}

          {userRole === 'owner' && renderOwnerDashboard()}
          {userRole === 'manager' && renderManagerDashboard()}
          {userRole === 'attendant' && renderAttendantDashboard()}
          {userRole === 'customer' && renderCustomerDashboard()}
        </div>
      </DashboardLayout>
    </>
  )
}