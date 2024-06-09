import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  if (req.method === 'POST') { // Check if the request method is POST
    const { email, subject, message } = await req.json();

    try {
      const sent = await resend.emails.send({
        from: 'stonksdemo@haiderb.com',
        to: email,
        subject: subject,
        html: `<p>${message}</p>`,
      });
      // console.log(`Email sent to ${email} with subject: ${subject}`);
      console.log(sent);
      return NextResponse.json(sent);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
  } else {
    return new NextResponse(`Method ${req.method} Not Allowed`, { status: 405 });
  }
}
