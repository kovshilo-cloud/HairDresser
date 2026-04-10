export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { to, clientName, slotTime, duration, cancelToken } = req.body ?? {}

  if (!to || !clientName || !slotTime || !cancelToken) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'RESEND_API_KEY not set' })

  const date = new Date(slotTime)
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
  })

  const origin = req.headers.origin || `https://${req.headers.host}`
  const cancelUrl = `${origin}?token=${cancelToken}`

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM ?? 'onboarding@resend.dev',
      to,
      subject: `Appointment confirmed – ${formattedDate}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1f2937">
          <h2 style="color:#e11d48">Your appointment is confirmed!</h2>
          <p>Hi ${clientName},</p>
          <p>Your appointment has been booked successfully:</p>
          <table style="border-collapse:collapse;width:100%;margin:16px 0">
            <tr>
              <td style="padding:8px 0;color:#6b7280;width:90px">Date</td>
              <td style="padding:8px 0;font-weight:600">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280">Time</td>
              <td style="padding:8px 0;font-weight:600">${formattedTime}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280">Duration</td>
              <td style="padding:8px 0;font-weight:600">${duration} minutes</td>
            </tr>
          </table>
          <p style="margin-top:24px">
            Need to cancel?
            <a href="${cancelUrl}" style="color:#e11d48">Click here to cancel your appointment</a>
          </p>
        </div>
      `,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    return res.status(500).json({ error: data.message ?? 'Resend API error' })
  }

  return res.status(200).json({ ok: true })
}
