// src/lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.NODE_ENV);

type SendEmailOptions = {
  to: string;
  subject: string;
  react?: React.ReactElement;
  html?: string;
};

export async function sendEmail({ to, subject, react, html }: SendEmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set');
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'delivered@resend.dev',
      to,
      subject,
      react: react || undefined,
      html: html || undefined,
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export function PasswordResetTemplate({ resetLink }: { resetLink: string }) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <img src="logo.png" alt="Logo" style={{ maxWidth: '150px' }} />
      </div>
      <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '5px' }}>
        <h2 style={{ color: '#2563eb' }}>Redefinição de Senha</h2>
        <p>Você solicitou a redefinição de senha para sua conta. Clique no botão abaixo para continuar:</p>
        <p>
          <a 
            href={resetLink} 
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '5px',
              margin: '15px 0',
            }}
          >
            Redefinir Senha
          </a>
        </p>
        <p>Se você não solicitou esta redefinição, por favor ignore este email.</p>
        <p><strong>O link expirará em 1 hora.</strong></p>
      </div>
      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#666' }}>
        <p>© {new Date().getFullYear()} Sua Empresa. Todos os direitos reservados.</p>
      </div>
    </div>
  );
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
  
  return sendEmail({
    to: email,
    subject: 'Redefinição de senha',
    react: <PasswordResetTemplate resetLink={resetLink} />,
  });
}