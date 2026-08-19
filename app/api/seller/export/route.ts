import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'

type ExportType = 'orders' | 'customers'
type ExportFormat = 'csv' | 'xlsx'
/** Statut "métier" tel que présenté au vendeur — distinct des enums Prisma
 * bruts, car "abandonné" n'a pas d'équivalent direct (une commande
 * abandonnée n'a jamais de ligne Order créée dans ce système : on
 * l'approxime par un paiement resté PENDING au-delà d'un délai). */
type BusinessStatus = 'all' | 'pending' | 'completed' | 'abandoned' | 'failed'

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function toCsv(rows: string[][]): string {
  return rows.map((row) => row.map(escapeCsvField).join(',')).join('\n')
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  const seller = await prisma.seller.findUnique({ where: { user_id: user.id } })
  if (!seller) {
    return NextResponse.json({ error: 'Vendeur introuvable.' }, { status: 403 })
  }

  const url = req.nextUrl
  const type = (url.searchParams.get('type') ?? 'orders') as ExportType
  const format = (url.searchParams.get('format') ?? 'csv') as ExportFormat
  const status = (url.searchParams.get('status') ?? 'all') as BusinessStatus
  const fromParam = url.searchParams.get('from')
  const toParam = url.searchParams.get('to')
  const productId = url.searchParams.get('product_id')

  const dateFilter: { gte?: Date; lte?: Date } = {}
  if (fromParam) dateFilter.gte = new Date(fromParam)
  if (toParam) dateFilter.lte = new Date(`${toParam}T23:59:59`)

  if (type === 'orders') {
    const orders = await prisma.order.findMany({
      where: {
        order_items: {
          some: {
            product: {
              shop: { seller_id: seller.id },
              ...(productId ? { id: productId } : {}),
            },
          },
        },
        ...(Object.keys(dateFilter).length > 0 ? { order_date: dateFilter } : {}),
      },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        payment: true,
        order_items: {
          where: {
            product: {
              shop: { seller_id: seller.id },
              ...(productId ? { id: productId } : {}),
            },
          },
          include: { product: { select: { name: true } } },
        },
      },
      orderBy: { order_date: 'desc' },
    })

    const filtered = orders.filter((order) => {
      if (status === 'all') return true
      const paymentStatus = order.payment?.status
      if (status === 'completed') return order.status === 'COMPLETED' || order.status === 'DELIVERED' || order.status === 'SHIPPED'
      if (status === 'failed') return paymentStatus === 'FAILED'
      if (status === 'pending') return order.status === 'PENDING' && paymentStatus !== 'FAILED'
      if (status === 'abandoned') {
        const ageMs = Date.now() - new Date(order.order_date).getTime()
        return order.status === 'PENDING' && ageMs > 24 * 60 * 60 * 1000
      }
      return true
    })

    const headers = ['Date', 'Commande', 'Client', 'Email', 'Téléphone', 'Produits', 'Montant total (FCFA)', 'Statut commande', 'Statut paiement']
    const rows = filtered.map((order) => [
      new Date(order.order_date).toLocaleString('fr-FR'),
      order.id,
      order.user.name ?? '',
      order.user.email,
      order.user.phone ?? '',
      order.order_items.map((item) => `${item.product.name} x${item.quantity}`).join('; '),
      String(order.total_amount),
      order.status,
      order.payment?.status ?? 'AUCUN',
    ])

    return respond(headers, rows, format, `commandes-${new Date().toISOString().slice(0, 10)}`)
  }

  const orders = await prisma.order.findMany({
    where: {
      order_items: { some: { product: { shop: { seller_id: seller.id } } } },
      ...(Object.keys(dateFilter).length > 0 ? { order_date: dateFilter } : {}),
    },
    include: { user: { select: { id: true, name: true, email: true, phone: true, university: true } } },
    orderBy: { order_date: 'desc' },
  })

  const customersMap = new Map<string, { name: string; email: string; phone: string; university: string; ordersCount: number; totalSpent: number; lastOrder: Date }>()
  for (const order of orders) {
    const existing = customersMap.get(order.user.id)
    const amount = Number(order.total_amount)
    if (existing) {
      existing.ordersCount += 1
      existing.totalSpent += amount
      if (order.order_date > existing.lastOrder) existing.lastOrder = order.order_date
    } else {
      customersMap.set(order.user.id, {
        name: order.user.name ?? '',
        email: order.user.email,
        phone: order.user.phone ?? '',
        university: order.user.university ?? '',
        ordersCount: 1,
        totalSpent: amount,
        lastOrder: order.order_date,
      })
    }
  }

  const headers = ['Nom', 'Email', 'Téléphone', 'Université', 'Nombre de commandes', 'Total dépensé (FCFA)', 'Dernière commande']
  const rows = Array.from(customersMap.values()).map((customer) => [
    customer.name,
    customer.email,
    customer.phone,
    customer.university,
    String(customer.ordersCount),
    String(customer.totalSpent),
    customer.lastOrder.toLocaleString('fr-FR'),
  ])

  return respond(headers, rows, format, `clients-${new Date().toISOString().slice(0, 10)}`)
}

async function respond(headers: string[], rows: string[][], format: ExportFormat, filename: string) {
  if (format === 'csv') {
    const csv = toCsv([headers, ...rows])
    const body = `\uFEFF${csv}`
    return new NextResponse(body, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}.csv"`,
      },
    })
  }

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Export')
  sheet.addRow(headers)
  sheet.getRow(1).font = { bold: true }
  rows.forEach((row) => sheet.addRow(row))
  sheet.columns.forEach((column) => {
    column.width = 22
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
    },
  })
}
