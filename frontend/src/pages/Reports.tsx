import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  Users,
  Bike,
  DollarSign,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react"

const reportTypes = [
  { value: "rentals", label: "Relatório de Aluguéis", icon: Calendar },
  { value: "revenue", label: "Relatório de Faturamento", icon: DollarSign },
  { value: "bikes", label: "Relatório de Bicicletas", icon: Bike },
  { value: "users", label: "Relatório de Usuários", icon: Users },
  { value: "performance", label: "Relatório de Performance", icon: TrendingUp },
]

const mockReports = [
  {
    id: 1,
    name: "Aluguéis Janeiro 2024",
    type: "rentals",
    dateRange: "01/01/2024 - 31/01/2024",
    createdAt: "2024-02-01",
    status: "completed"
  },
  {
    id: 2,
    name: "Faturamento Q4 2023",
    type: "revenue", 
    dateRange: "01/10/2023 - 31/12/2023",
    createdAt: "2024-01-15",
    status: "completed"
  },
  {
    id: 3,
    name: "Performance Mensal",
    type: "performance",
    dateRange: "01/01/2024 - 31/01/2024", 
    createdAt: "2024-01-30",
    status: "processing"
  }
]

export default function Reports() {
  const [reports, setReports] = useState(mockReports)
  const [formData, setFormData] = useState({
    type: "",
    startDate: "",
    endDate: "",
    format: "pdf"
  })
  
  const { toast } = useToast()

  const handleGenerateReport = () => {
    if (!formData.type || !formData.startDate || !formData.endDate) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      })
      return
    }

    const newReport = {
      id: reports.length + 1,
      name: `${reportTypes.find(t => t.value === formData.type)?.label} - ${new Date().toLocaleDateString()}`,
      type: formData.type,
      dateRange: `${new Date(formData.startDate).toLocaleDateString()} - ${new Date(formData.endDate).toLocaleDateString()}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: "processing" as const
    }

    setReports([newReport, ...reports])
    setFormData({ type: "", startDate: "", endDate: "", format: "pdf" })
    
    toast({
      title: "Relatório solicitado",
      description: "Seu relatório está sendo gerado e aparecerá na lista em breve."
    })

    // Simular processamento
    setTimeout(() => {
      setReports(prev => prev.map(report => 
        report.id === newReport.id 
          ? { ...report, status: "completed" as const }
          : report
      ))
    }, 3000)
  }

  const handleDownloadReport = (reportId: number) => {
    toast({
      title: "Download iniciado",
      description: "O arquivo do relatório será baixado em breve."
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Gere e visualize relatórios detalhados do seu bicicletário
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gerar Novo Relatório */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Gerar Relatório
              </CardTitle>
              <CardDescription>
                Configure os parâmetros para gerar um novo relatório
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="report-type">Tipo de Relatório</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Data Inicial</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">Data Final</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Formato</Label>
                <Select value={formData.format} onValueChange={(value) => setFormData({...formData, format: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleGenerateReport} className="w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
            </CardContent>
          </Card>

          {/* Lista de Relatórios */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Relatórios Gerados
              </CardTitle>
              <CardDescription>
                Histórico de relatórios gerados e seus status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => {
                  const reportType = reportTypes.find(t => t.value === report.type)
                  const ReportIcon = reportType?.icon || FileText
                  
                  return (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <ReportIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{report.name}</h4>
                          <p className="text-sm text-muted-foreground">{report.dateRange}</p>
                          <p className="text-xs text-muted-foreground">
                            Criado em {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {report.status === "processing" ? (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-warning rounded-full animate-pulse" />
                            <span className="text-sm text-warning">Processando</span>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadReport(report.id)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
                
                {reports.length === 0 && (
                  <div className="text-center py-8">
                    <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Nenhum relatório encontrado</h3>
                    <p className="text-muted-foreground">
                      Gere seu primeiro relatório usando o formulário ao lado
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}