import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getFirstStageId } from '@/lib/leads'
import crypto from 'crypto'

// Secret token shared between n8n/external services and our CRM to verify signature authenticity
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

function parseLeadValue(value: string | number | null | undefined) {
  if (value === undefined || value === null) return null

  const raw = typeof value === 'number' ? value : Number.parseFloat(value)
  return Number.isFinite(raw) && raw >= 0 ? raw : null
}

function isHexSignature(value: string) {
  return /^[0-9a-f]+$/i.test(value)
}

export async function POST(req: Request) {
  try {
    // 1. Read request body as raw text to compute accurate cryptographic signature
    const rawBody = await req.text()
    
    // 2. Validate webhook signature if WEBHOOK_SECRET is configured
    if (WEBHOOK_SECRET) {
      const signature = req.headers.get('x-webhook-signature')
      if (!signature) {
        return NextResponse.json(
          { error: 'Unauthorized: Missing signature header (x-webhook-signature)' },
          { status: 401 }
        )
      }

      // Generate expected HMAC-SHA256 signature
      const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET)
      const expectedSignature = hmac.update(rawBody).digest('hex')

      if (!isHexSignature(signature) || signature.length !== expectedSignature.length) {
        return NextResponse.json(
          { error: 'Unauthorized: Invalid signature' },
          { status: 401 }
        )
      }

      // Secure constant-time comparison to prevent timing attacks
      const isVerified = crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      )

      if (!isVerified) {
        return NextResponse.json(
          { error: 'Unauthorized: Invalid signature' },
          { status: 401 }
        )
      }
    }

    // 3. Parse JSON payload
    let payload: {
      name?: string
      email?: string
      phone?: string
      company?: string
      value?: string | number | null
      notes?: string
    }
    try {
      payload = JSON.parse(rawBody)
    } catch {
      return NextResponse.json(
        { error: 'Bad Request: Invalid JSON body' },
        { status: 400 }
      )
    }

    const { name, email, phone, company, value, notes } = payload

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Bad Request: "name" field is required' },
        { status: 400 }
      )
    }

    // Parse lead value if provided
    const leadValue = parseLeadValue(value)

    // 4. Resolve the default initial stage for the lead
    let stageId: string
    try {
      stageId = await getFirstStageId()
    } catch (e) {
      console.error('Webhook error resolving first stage id:', e)
      return NextResponse.json(
        { error: 'Internal Server Error: No active pipeline stages configured' },
        { status: 500 }
      )
    }

    // 5. Create Lead and register Audit Log Activity inside a transaction
    await prisma.$transaction([
      prisma.lead.create({
        data: {
          name: name.trim(),
          email: email?.trim() || null,
          phone: phone?.trim() || null,
          company: company?.trim() || null,
          value: leadValue,
          notes: notes?.trim() || 'Registrado automáticamente vía Webhook.',
          stageId,
        },
      }),
      prisma.activity.create({
        data: {
          user: 'System Webhook',
          action: 'created new lead via API Webhook',
          target: name.trim(),
          type: 'success',
        },
      }),
    ])

    return NextResponse.json(
      { ok: true, message: 'Lead registered successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Webhook registration failed:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
