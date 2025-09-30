import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
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
  Activity,
  ListRestart,
  ListX,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square
} from "lucide-react"
import { useBikeRacks } from "@/contexts/bikerack-context"
import CantOpen from "@/components/layout/cant-open"
import { Checkbox } from "@/components/ui/checkbox"
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { marked } from "marked";

const reportTypes = [
  { value: "rentals", label: "Relatório de Aluguéis", icon: Calendar },
  { value: "revenue", label: "Relatório de Faturamento", icon: DollarSign },
  { value: "bikes", label: "Relatório de Bicicletas", icon: Bike },
  { value: "users", label: "Relatório de Usuários", icon: Users },
  { value: "performance", label: "Relatório de Performance", icon: TrendingUp },
]

interface ReportOption {
  id: number,
  category: string,
  description: string
}

interface CategorizedReports {
  [category: string]: ReportOption[]
}

export default function Reports() {
  const [reports, setReports] = useState([])
  const [categories, setCategories] = useState<string[]>([])
  const [categorizedOptions, setCategorizedOptions] = useState<CategorizedReports>({})
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({})
  const [formData, setFormData] = useState<{
    [id: number]: boolean
  }>({})
  
  const { toast } = useToast();
  const {currentBikeRack} = useBikeRacks();

  // Função para agrupar opções por categoria
  const groupOptionsByCategory = (options: ReportOption[], categoriesList: string[]) => {
    const grouped: CategorizedReports = {}
    
    // Inicializa todas as categorias conhecidas + "Outros"
    categoriesList.forEach(category => {
      grouped[category] = []
    })
    grouped["Outros"] = []
    
    // Agrupa as opções
    options.forEach(option => {
      if (categoriesList.includes(option.category)) {
        grouped[option.category].push(option)
      } else {
        grouped["Outros"].push(option)
      }
    })
    
    // Remove categorias vazias
    Object.keys(grouped).forEach(category => {
      if (grouped[category].length === 0 && category !== "Outros") {
        delete grouped[category]
      }
    })
    
    return grouped
  }

  // Função para buscar categorias
  const fetchCategories = async () => {
    try {
      const res = await fetch(`http://localhost:4000/reports/categories`)
      if (!res.ok) {
        throw new Error('Erro ao buscar categorias')
      }
      const data = await res.json()
      setCategories(data)
      return data
    } catch (error) {
      toast({
        title: "Erro ao buscar categorias!",
        description: "Problemas na requisição de categorias",
        variant: 'destructive'
      })
      console.log(error)
      return []
    }
  }

  // Função para buscar opções de relatório
  const fetchReportOptions = async () => {
    try {
      const res = await fetch(`http://localhost:4000/reports/reportsOptions`)
      if (!res.ok) {
        throw new Error('Erro ao buscar opções')
      }
      const data = await res.json()
      return data
    } catch (error) {
      toast({
        title: "Erro ao buscar opções de relatório!",
        description: "Problemas na requisição de opções",
        variant: 'destructive'
      })
      console.log(error)
      return []
    }
  }

  // Toggle para expandir/recolher categoria
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  // Selecionar todas as opções de uma categoria
  const selectAllInCategory = (category: string) => {
    const categoryOptions = categorizedOptions[category] || []
    const allSelected = categoryOptions.every(option => formData[option.id])
    
    const updatedFormData = { ...formData }
    
    categoryOptions.forEach(option => {
      updatedFormData[option.id] = !allSelected
    })
    
    setFormData(updatedFormData)
  }

  // Selecionar todas as opções de todas as categorias
  const selectAllOptions = () => {
    const allOptions = Object.values(categorizedOptions).flat()
    const allSelected = allOptions.every(option => formData[option.id])
    
    const updatedFormData = { ...formData }
    
    allOptions.forEach(option => {
      updatedFormData[option.id] = !allSelected
    })
    
    setFormData(updatedFormData)
  }

  // Verifica se todas as opções de uma categoria estão selecionadas
  const isCategoryAllSelected = (category: string) => {
    const categoryOptions = categorizedOptions[category] || []
    if (categoryOptions.length === 0) return false
    return categoryOptions.every(option => formData[option.id])
  }

  // Verifica se alguma opção de uma categoria está selecionada
  const isCategoryPartialSelected = (category: string) => {
    const categoryOptions = categorizedOptions[category] || []
    if (categoryOptions.length === 0) return false
    const hasSelected = categoryOptions.some(option => formData[option.id])
    const allSelected = categoryOptions.every(option => formData[option.id])
    return hasSelected && !allSelected
  }

  // Verifica se todas as opções estão selecionadas
  const isAllSelected = () => {
    const allOptions = Object.values(categorizedOptions).flat()
    if (allOptions.length === 0) return false
    return allOptions.every(option => formData[option.id])
  }

  // Verifica se alguma opção está selecionada (seleção parcial)
  const isPartialSelected = () => {
    const allOptions = Object.values(categorizedOptions).flat()
    if (allOptions.length === 0) return false
    const hasSelected = allOptions.some(option => formData[option.id])
    const allSelected = allOptions.every(option => formData[option.id])
    return hasSelected && !allSelected
  }

  const handleGenerateReport = async () => {
    const hasSelectedReports = Object.values(formData).some(value => value === true);
    
    if (!hasSelectedReports) {
      toast({
        title: "Erro!",
        description: "Escolha pelo menos um tipo de relatório.",
        variant: "destructive"
      })
      return
    }

    const selectedReportIds = Object.keys(formData)
      .filter(key => formData[Number(key)] === true)
      .map(Number);

    // Encontra os nomes dos relatórios selecionados
    const selectedReportNames: string[] = []
    Object.values(categorizedOptions).forEach(options => {
      options.forEach(option => {
        if (selectedReportIds.includes(option.id)) {
          selectedReportNames.push(option.description)
        }
      })
    })
  
    const newReport = {
      id: reports.length + 1,
      name: `Relatório ${new Date().toLocaleDateString()}`,
      type: "custom",
      dateRange: `${new Date().toLocaleDateString()}`,
      createdAt: new Date().toISOString(),
      status: "processing",
      selectedReports: selectedReportNames.join(", "),
      HTMLreport: ""
    }

    setReports([newReport, ...reports])
    
    toast({
      title: "Relatório solicitado",
      description: "Seu relatório está sendo gerado e aparecerá na lista em breve."
    })

    try{
      const res = await fetch(`http://localhost:4000/reports/getReports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify({
          bike_rack_id: currentBikeRack.id,
          options: selectedReportIds
        })
      })

      if(!res.ok){
        setReports(prev => prev.map(report => 
          report.id === newReport.id 
            ? { ...report, status: "failed" }
            : report
        ))
        toast({
          title: "Erro ao gerar relatório!",
          description: "Parece que ocorreu um problema na geração de relatórios.",
          variant: "destructive"
        })
        return;
      }
      
      const data = await res.text();

      setReports(prev => prev.map(report => 
        report.id === newReport.id 
          ? { ...report, status: "completed", report: data }
          : report
      ))
    }catch(err){
      setReports(prev => prev.map(report => 
        report.id === newReport.id 
          ? { ...report, status: "failed" }
          : report
      ))
      toast({
        title: "Erro ao gerar relatório!",
        description: "Parece que ocorreu um erro no servidor.",
        variant: 'destructive'
      })
      return;
    }
  }

const handleDownloadReport = async (reportId: number) => {
  const report = reports.find(r => r.id === reportId);

  if (!report || !report.report) {
    toast({
      title: "Erro!",
      description: "Relatório não encontrado ou sem conteúdo.",
      variant: "destructive"
    });
    return;
  }

  try {
    // cria iframe escondido
    const iframe = document.createElement("iframe");
    iframe.style.cssText = `
      position: fixed;
      left: -10000px;
      top: 0;
      width: 794px;
      min-height: 1123px;
      border: none;
      visibility: hidden;
    `;
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) throw new Error("Não foi possível acessar o documento do iframe");

    // insere conteúdo
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              margin: 0;
              padding: 20mm;
              font-family: Arial, sans-serif;
              background: white;
              box-sizing: border-box;
            }
            .report-container { width: 100%; }
            table { width: 100%; border-collapse: collapse; }
            svg { display: none; }
            .chart-placeholder {
              padding: 40px;
              text-align: center;
              color: #666;
              background: #f5f5f5;
              border: 1px dashed #ccc;
            }
          </style>
        </head>
        <body>
          <div class="report-container">
            ${report.report.replace(
              /<svg[\s\S]*?<\/svg>/gi,
              `<div class="chart-placeholder">Gráfico (somente na versão web)</div>`
            )}
          </div>
        </body>
      </html>
    `);
    iframeDoc.close();

    await new Promise(resolve => setTimeout(resolve, 800));

    // captura canvas
    const canvas = await html2canvas(iframeDoc.body, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff"
    });

    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // ====== MARGENS ======
    const marginTop = 10;     // mm
    const marginBottom = 15;  // mm
    const marginLeft = 10;    // mm
    const marginRight = 10;   // mm

    const usableWidth = pdfWidth - marginLeft - marginRight;
    const usableHeight = pdfHeight - marginTop - marginBottom;

    // proporção imagem
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // fator px → mm
    const pxPerMm = imgWidth / usableWidth;
    const pageHeightPx = usableHeight * pxPerMm;

    let position = 0;
    let page = 0;

    while (position < imgHeight) {
      if (page > 0) pdf.addPage();

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = imgWidth;
      pageCanvas.height = Math.min(pageHeightPx, imgHeight - position);

      const ctx = pageCanvas.getContext("2d");
      ctx?.drawImage(
        canvas,
        0, position, imgWidth, pageCanvas.height,
        0, 0, imgWidth, pageCanvas.height
      );

      const pageImgData = pageCanvas.toDataURL("image/png", 1.0);

      pdf.addImage(
        pageImgData,
        "PNG",
        marginLeft,
        marginTop,
        usableWidth,
        pageCanvas.height / pxPerMm // altura proporcional em mm
      );

      position += pageHeightPx;
      page++;
    }

    pdf.save(`${report.name.replace(/\s+/g, "_")}.pdf`);
    document.body.removeChild(iframe);

    toast({
      title: "PDF gerado!",
      description: `O relatório foi salvo em ${page} páginas.`
    });
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    const iframes = document.querySelectorAll('iframe[style*="left: -10000px"]');
    iframes.forEach(el => el.remove());

    toast({
      title: "Erro ao gerar PDF",
      description: "Houve um problema ao criar o arquivo.",
      variant: "destructive"
    });
  }
};



  useEffect(() => {
    const loadData = async () => {
      const categoriesData = await fetchCategories()
      const optionsData = await fetchReportOptions()
      
      if (categoriesData.length > 0 && optionsData.length > 0) {
        const groupedOptions = groupOptionsByCategory(optionsData, categoriesData)
        setCategorizedOptions(groupedOptions)
        
        // Expande todas as categorias por padrão
        const initialExpanded: {[key: string]: boolean} = {}
        Object.keys(groupedOptions).forEach(category => {
          initialExpanded[category] = true
        })
        setExpandedCategories(initialExpanded)
      }
    }

    loadData()
  }, [])

  if(!currentBikeRack){
    return(
      <CantOpen pageName="Relatórios"/>
  )}

  // Calcula o total de opções disponíveis
  const totalOptions = Object.values(categorizedOptions).reduce((total, options) => total + options.length, 0)
  const selectedCount = Object.values(formData).filter(Boolean).length

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
                Selecione os tipos de relatório desejados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="report-type" className="text-base font-semibold">
                    Tipos de Relatório
                  </Label>
                  
                  {/* Botão Selecionar Todos */}
                  {Object.keys(categorizedOptions).length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllOptions}
                      className="flex items-center gap-2"
                    >
                      {isAllSelected() ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : isPartialSelected() ? (
                        <Square className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                      {isAllSelected() ? "Desmarcar Todos" : "Selecionar Todos"}
                    </Button>
                  )}
                </div>
                
                {/* Container com scroll */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {Object.keys(categorizedOptions).length > 0 ? (
                    Object.entries(categorizedOptions).map(([category, options]) => (
                      <div key={category} className="border border-border rounded-lg">
                        {/* Cabeçalho da categoria com checkbox */}
                        <div className="flex items-center justify-between p-3 bg-accent/50 hover:bg-accent/70 transition-colors rounded-t-lg">
                          <button
                            onClick={() => toggleCategory(category)}
                            className="flex items-center gap-2 flex-1"
                          >
                            <span className="font-medium text-sm">
                              {category} ({options.length})
                            </span>
                            {expandedCategories[category] ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                          
                          {/* Checkbox para selecionar toda a categoria */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              selectAllInCategory(category)
                            }}
                            className="h-6 w-6 p-0 hover:bg-accent"
                          >
                            {isCategoryAllSelected(category) ? (
                              <CheckSquare className="h-4 w-4" />
                            ) : isCategoryPartialSelected(category) ? (
                              <Square className="h-4 w-4" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        
                        {/* Opções da categoria */}
                        {expandedCategories[category] && (
                          <div className="p-2 space-y-2">
                            {options.map((option) => (
                              <div 
                                key={option.id} 
                                className="flex items-start space-x-2 p-2 rounded-md hover:bg-accent/30 transition-colors"
                              >
                                <Checkbox
                                  id={`report-${option.id}`}
                                  checked={formData[option.id] || false}
                                  onCheckedChange={(checked) => {
                                    setFormData(prev => ({
                                      ...prev,
                                      [option.id]: checked === true
                                    }))
                                  }}
                                  className="mt-0.5 flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <Label
                                    htmlFor={`report-${option.id}`}
                                    className="text-sm font-normal cursor-pointer block mb-1"
                                  >
                                    {option.description}
                                  </Label>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <ListX className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">
                        Nenhuma opção de relatório
                      </h3>
                      <p className="text-muted-foreground">
                        Espere até que o servidor carregue as opções de relatório!
                      </p>
                    </div>
                  )}
                </div>

                {/* Contador de selecionados */}
                {Object.keys(categorizedOptions).length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">
                      {selectedCount} de {totalOptions} selecionados
                    </p>
                    {/* {selectedCount > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.round((selectedCount / totalOptions) * 100)}% das opções selecionadas
                      </p>
                    )} */}
                  </div>
                )}
              </div>

              <Button 
                onClick={handleGenerateReport} 
                className="w-full"
                size="lg"
                // disabled={Object.keys(categorizedOptions).length === 0 || selectedCount === 0}
              >
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
              <div className="space-y-4 max-h-[430px] overflow-y-auto pr-2 custom-scrollbar">
                {reports.map((report) => {
                  const reportType = reportTypes.find(t => t.value === report.type)
                  const ReportIcon = reportType?.icon || FileText
                  
                  return (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <ReportIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-medium truncate">{report.name}</h4>
                          {/* <p className="text-sm text-muted-foreground">{report.dateRange}</p> */}
                          {report.selectedReports && (
                            <p className="text-xs text-primary mt-1">
                              {report.selectedReports}
                            </p>
                          )}
                          <p className="mt-3 text-xs text-muted-foreground">
                            Criado em {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {
                          report.status === "processing" && (
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
                              <span className="text-sm text-amber-600">Processando</span>
                            </div>
                          )
                        }
                        {
                          report.status === "failed" && (
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                              <span className="text-sm text-red-400">Sem êxito</span>
                            </div>
                          )
                        }
                        {
                          report.status === "completed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadReport(report.id)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          )
                        }
                      </div>
                    </div>
                  )
                })}
                
                {reports.length === 0 && (
                  <div className="text-center py-12">
                    <PieChart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      Nenhum relatório encontrado
                    </h3>
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

      {/* Estilos customizados para o scroll */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f123;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </DashboardLayout>
  )
}