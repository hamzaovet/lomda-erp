import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'لم يتم اختيار ملف' }, { status: 400 });
    }

    // Convert file to base64 for ImgBB
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    const imgbbKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY; 
    
    if (!imgbbKey) {
      console.error('❌ Missing IMGBB API Key in environment variables');
      return NextResponse.json({ success: false, error: 'فشل إعدادات الرفع (API Key Missing)' }, { status: 500 });
    }

    const imgbbFormData = new FormData();
    imgbbFormData.append('image', base64);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
      method: 'POST',
      body: imgbbFormData,
    });

    const result = await response.json();

    if (result.success) {
      return NextResponse.json({ success: true, url: result.data.url });
    } else {
      console.error('❌ ImgBB Error:', result.error);
      return NextResponse.json({ success: false, error: result.error?.message || 'فشل الرفع إلى ImgBB' }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ Internal Upload Error:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ داخلي أثناء الرفع' }, { status: 500 });
  }
}
