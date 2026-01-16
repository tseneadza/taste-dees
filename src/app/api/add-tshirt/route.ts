import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const DATA_FILE = path.resolve(process.cwd(), 'tshirts.json')

export async function POST(request: Request) {
  try {
    let name: string, description: string, price: number, image: string, category: string

    // Check content type to determine how to parse the request
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      // Handle JSON body
      const body = await request.json()
      name = String(body.name || '')
      description = String(body.description || '')
      price = Number(body.price || 0)
      image = String(body.image || '')
      category = String(body.category || 'New Arrivals')
    } else {
      // Handle FormData (legacy support)
      const form = await request.formData()
      name = String(form.get('name') || '')
      description = String(form.get('description') || '')
      price = Number(form.get('price') || 0)
      image = String(form.get('image') || '')
      category = String(form.get('category') || 'New Arrivals')
    }

    let list = []
    try {
      const raw = await fs.readFile(DATA_FILE, 'utf8')
      list = JSON.parse(raw || '[]')
    } catch (e) {
      list = []
    }

    const item = { id: Date.now(), name, description, price, image, category }
    list.push(item)

    await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2), 'utf8')

    // Return JSON response for fetch requests, redirect for form submissions
    if (contentType.includes('application/json')) {
      return NextResponse.json({ success: true, item })
    }
    return NextResponse.redirect('/admin')
  } catch (err) {
    console.error('Error adding t-shirt:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to add t-shirt' },
      { status: 500 }
    )
  }
}
