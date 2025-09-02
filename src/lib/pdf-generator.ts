"use client"

import jsPDF from 'jspdf'
import { formatCurrency, formatDate, formatCpfCnpj, formatPhone, formatCep, getTipoValorLabel } from '@/lib/formatters'

interface Cliente {
  id: number
  nome: string
  cpf_cnpj: string
  email: string
  telefone: string
  endereco: string
  bairro: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
}

interface AreaTrabalho {
  id: number
  nome: string
  cpf_cnpj: string | null
  telefone: string | null
  email: string | null
  endereco: string | null
  bairro: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  logo_url: string | null
}

interface ProdutoServico {
  id: number
  nome: string
  tipo_valor: string
}

interface ItemOrcamento {
  id: number
  orcamento_id: number
  produto_servico_id: number
  quantidade: number
  preco_unitario: number
  desconto_percentual: any
  desconto_valor: number | null
  produtoServico: ProdutoServico
}

interface OrcamentoData {
  id: number
  data_criacao: string
  valor_total: number | null
  status: string
  observacoes: string | null
  cliente: Cliente
  areaTrabalho: AreaTrabalho
  itensOrcamento: ItemOrcamento[]
  subtotal: number
  totalDesconto: number
  valorFinal: number
}

export async function generateOrcamentoPDF(orcamentoData: OrcamentoData) {

  const pdf = new jsPDF()
  let y = 30
  const pageWidth = pdf.internal.pageSize.width
  const margin = 20

  // Função auxiliar para quebrar texto
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
    pdf.setFontSize(fontSize)
    const lines = pdf.splitTextToSize(text, maxWidth)
    pdf.text(lines, x, y)
    return y + (lines.length * fontSize * 0.4)
  }

  // Função auxiliar para adicionar nova página se necessário
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > 280) {
      pdf.addPage()
      y = 20
    }
  }

  try {
    // 1. CABEÇALHO COM LOGOTIPO DA EMPRESA (se disponível)
    let hasLogo = false
    let logoHeight = 0
    
    if (orcamentoData.areaTrabalho.logo_url) {
      try {
        // Tentar carregar e adicionar o logo
        const img = new Image()
        img.crossOrigin = "anonymous"
        await new Promise((resolve, reject) => {
          img.onload = () => resolve(img)
          img.onerror = reject
          img.src = orcamentoData.areaTrabalho.logo_url!
        })
        
        // Adicionar logo (redimensionado)
        const logoWidth = 30
        const aspectRatio = img.width / img.height
        logoHeight = logoWidth / aspectRatio
        pdf.addImage(img, 'JPEG', margin, y, logoWidth, logoHeight)
        hasLogo = true
      } catch (error) {
        console.warn('Erro ao carregar logo:', error)
        // Continuar sem o logo
        hasLogo = false
      }
    }

    // 2. DADOS DA EMPRESA
    pdf.setFontSize(12)
    pdf.setFont(undefined, 'bold')
    
    // Definir posicionamento do texto
    const logoWidth = 30
    const textStartX = hasLogo ? margin + logoWidth + 10 : margin
    const textStartY = hasLogo ? y : y

    pdf.setFontSize(12)
    pdf.setFont(undefined, 'bold')
    pdf.text('DADOS DO CONTRATADO', textStartX, textStartY)
    y += 8

    let textY = textStartY + 8
    pdf.setFont(undefined, 'normal')
    pdf.setFontSize(10)
    pdf.text(`Nome: ${orcamentoData.areaTrabalho.nome}`, textStartX, textY)
    textY += 6

    
    
    
    // Sempre exibir os dados da empresa
    if (orcamentoData.areaTrabalho.cpf_cnpj) {
      const isCPF = orcamentoData.areaTrabalho.cpf_cnpj.replace(/\D/g, '').length === 11
      const label = isCPF ? 'CPF:' : 'CNPJ:'
      pdf.text(`${label} ${formatCpfCnpj(orcamentoData.areaTrabalho.cpf_cnpj)}`, textStartX, textY)
      textY += 6
    }

    if (orcamentoData.areaTrabalho.telefone) {
      pdf.text(`Telefone: ${formatPhone(orcamentoData.areaTrabalho.telefone)}`, textStartX, textY)
      textY += 6
    }

    if (orcamentoData.areaTrabalho.email) {
      pdf.text(`Email: ${orcamentoData.areaTrabalho.email}`, textStartX, textY)
      textY += 6
    }

    if (orcamentoData.areaTrabalho.endereco) {
      const enderecoItems = [
        orcamentoData.areaTrabalho.endereco,
        [
          orcamentoData.areaTrabalho.bairro,
          orcamentoData.areaTrabalho.cidade,
          orcamentoData.areaTrabalho.estado,
          orcamentoData.areaTrabalho.cep ? formatCep(orcamentoData.areaTrabalho.cep) : null
        ].filter(Boolean).join(', '),
      ].filter(item => item && item !== '');
      
      enderecoItems.forEach(item => {
      pdf.text(item, textStartX, textY)
      textY += 6
      })
    }
    
    // Ajustar y para a próxima seção
    y = Math.max(hasLogo ? y + logoHeight + 10 : y + 20, textY)

    y += 10

    // 3. TÍTULO DO ORÇAMENTO
    pdf.setFontSize(15)
    pdf.setFont(undefined, 'bold')
    pdf.text('ORÇAMENTO', pageWidth / 2, y, { align: 'center' })
    y += 10

    // 4. NÚMERO E DATA DO ORÇAMENTO
    pdf.setFontSize(12)
    pdf.setFont(undefined, 'bold')
    pdf.text(`Orçamento Nº: ${orcamentoData.id}`, margin, y)
    pdf.text(`Emitido em: ${formatDate(orcamentoData.data_criacao)} ${new Date(orcamentoData.data_criacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, pageWidth - margin, y, { align: 'right' })
    y += 10

    // 5. DADOS DO CLIENTE
    pdf.setFontSize(12)
    pdf.setFont(undefined, 'bold')
    pdf.text('DADOS DO CLIENTE', margin, y)
    y += 8

    pdf.setFontSize(10)
    pdf.setFont(undefined, 'normal')
    pdf.text(`Nome: ${orcamentoData.cliente.nome}`, margin, y)
    y += 6
    const isCPF = orcamentoData.cliente.cpf_cnpj.replace(/\D/g, '').length === 11
    const label = isCPF ? 'CPF:' : 'CNPJ:'
    pdf.text(`${label} ${formatCpfCnpj(orcamentoData.cliente.cpf_cnpj)}`, margin, y)
    y += 6
    pdf.text(`Email: ${orcamentoData.cliente.email}`, margin, y)
    y += 6
    pdf.text(`Telefone: ${formatPhone(orcamentoData.cliente.telefone)}`, margin, y)
    y += 6

    const clienteEndereco = [
      orcamentoData.cliente.endereco,
      orcamentoData.cliente.bairro,
      orcamentoData.cliente.cidade,
      orcamentoData.cliente.estado,
      orcamentoData.cliente.cep ? formatCep(orcamentoData.cliente.cep) : null
    ].filter(Boolean).join(', ')

    y = addWrappedText(`Endereço: ${clienteEndereco}`, margin, y, pageWidth - margin * 2)
    y += 10

    // 6. ITENS DO ORÇAMENTO
    checkPageBreak(80)
    
    pdf.setFontSize(12)
    pdf.setFont(undefined, 'bold')
    pdf.text('ITENS DO ORÇAMENTO', margin, y)
    y += 8

    // Cabeçalho da tabela
    pdf.setFontSize(10)
    pdf.setFont(undefined, 'bold')
    const tableHeaders = ['Item', 'Qtd', 'Un', 'Vl. Unit.', 'Desc.', 'Vl. Total']
    const colWidths = [60, 20, 15, 25, 25, 25]
    let x = margin

    tableHeaders.forEach((header, i) => {
      pdf.text(header, x, y)
      x += colWidths[i]
    })
    y += 8

    // Linha horizontal
    pdf.line(margin, y - 2, pageWidth - margin, y - 2)
    y += 4

    // Itens
    pdf.setFont(undefined, 'normal')
    orcamentoData.itensOrcamento.forEach((item, index) => {
      checkPageBreak(15)
      
      const itemTotal = item.quantidade * item.preco_unitario
      let desconto = 0
      
      if (item.desconto_percentual && Number(item.desconto_percentual) > 0) {
        desconto += (itemTotal * Number(item.desconto_percentual)) / 100
      }
      if (item.desconto_valor && item.desconto_valor > 0) {
        desconto += item.desconto_valor
      }
      
      const valorFinalItem = itemTotal - desconto

      x = margin
      
      // Nome do produto/serviço (quebrado se necessário)
      const nomeLines = pdf.splitTextToSize(item.produtoServico.nome, colWidths[0] - 5)
      pdf.text(nomeLines, x, y)
      
      x += colWidths[0]
      pdf.text(item.quantidade.toString(), x, y)
      
      x += colWidths[1]
      pdf.text(getTipoValorLabel(item.produtoServico.tipo_valor), x, y)
      
      x += colWidths[2]
      pdf.text(formatCurrency(item.preco_unitario), x, y)
      
      x += colWidths[3]
      pdf.text(formatCurrency(desconto), x, y)
      
      x += colWidths[4]
      pdf.text(formatCurrency(valorFinalItem), x, y)
      
      y += Math.max(nomeLines.length * 4, 6)
    })

    y += 10

    // 7. TOTAIS
    checkPageBreak(30)
    
    pdf.setFontSize(10)
    pdf.setFont(undefined, 'normal')
    
    const totalsX = pageWidth - margin - 80
    
    // Totais totalmente à direita
    const rightX = pageWidth - margin

    pdf.text(`Subtotal: ${formatCurrency(orcamentoData.subtotal)}`, rightX, y, { align: 'right' })
    y += 6
    pdf.text(`Desconto: ${formatCurrency(orcamentoData.totalDesconto)}`, rightX, y, { align: 'right' })
    y += 6

    pdf.setFont(undefined, 'bold')
    pdf.setFontSize(12)
    pdf.text(`TOTAL: ${formatCurrency(orcamentoData.valorFinal)}`, rightX, y, { align: 'right' })

    y += 10

    // 8. OBSERVAÇÕES
    if (orcamentoData.observacoes) {
      checkPageBreak(30)
      
      pdf.setFontSize(12)
      pdf.setFont(undefined, 'bold')
      pdf.text('OBSERVAÇÕES', margin, y)
      y += 8
      
      pdf.setFontSize(10)
      pdf.setFont(undefined, 'normal')
      y = addWrappedText(orcamentoData.observacoes, margin, y, pageWidth - margin * 2)
    }

    y += 8

    pdf.text('Gerado por: Sky Orçamentos', margin, y)
    y += 8

    // Salvar o PDF
    const fileName = `Orcamento_${orcamentoData.id}_${orcamentoData.cliente.nome.replace(/\s+/g, '_')}.pdf`
    pdf.save(fileName)

  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    throw error
  }
}
