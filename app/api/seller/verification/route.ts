import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  try {
    const seller = await prisma.seller.findUnique({ where: { user_id: user.id } })
    if (!seller) {
      return NextResponse.json({ error: 'Vendeur introuvable.' }, { status: 403 })
    }

    const documents = await prisma.storeMedia.findMany({
      where: { uploader_id: user.id },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        url: true,
        resource_type: true,
        format: true,
        width: true,
        height: true,
        created_at: true,
      },
    })

    return NextResponse.json({
      success: true,
      verificationStatus: seller.verification_status,
      documents,
    })
  } catch (error) {
    console.error('KYC GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const documents = Array.isArray(body?.documents) ? body.documents : []

    if (!documents.length) {
      return NextResponse.json({ error: 'Au moins un document de vérification est requis.' }, { status: 400 })
    }

    const seller = await prisma.seller.findUnique({ where: { user_id: user.id } })
    if (!seller) {
      return NextResponse.json({ error: 'Vendeur introuvable.' }, { status: 403 })
    }

    const persisted = await Promise.all(
      documents.map(async (doc: Record<string, unknown>, index: number) => {
        const url = typeof doc?.url === 'string' ? doc.url : ''
        const documentType = typeof doc?.type === 'string' ? doc.type : `document-${index + 1}`
        if (!url) return null

        const storeMedia = await prisma.storeMedia.create({
          data: {
            uploader_id: user.id,
            shop_id: null,
            public_id: typeof doc?.public_id === 'string' ? doc.public_id : `kyc-${documentType}-${Date.now()}-${index}`,
            url,
            resource_type: typeof doc?.resource_type === 'string' ? doc.resource_type : 'image',
            format: typeof doc?.format === 'string' ? doc.format : 'jpg',
            width: typeof doc?.width === 'number' ? doc.width : null,
            height: typeof doc?.height === 'number' ? doc.height : null,
            bytes: typeof doc?.bytes === 'number' ? doc.bytes : null,
          },
        })

        return {
          id: storeMedia.id,
          url: storeMedia.url,
          type: documentType,
          resource_type: storeMedia.resource_type,
          created_at: storeMedia.created_at,
        }
      })
    )

    const validDocuments = persisted.filter(Boolean)
    await prisma.seller.update({
      where: { id: seller.id },
      data: { verification_status: 'PENDING' },
    })

    return NextResponse.json({
      success: true,
      verificationStatus: 'PENDING',
      documents: validDocuments,
      message: 'Documents de vérification enregistrés. Une revue est en cours avant le premier retrait.',
    })
  } catch (error) {
    console.error('KYC POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
