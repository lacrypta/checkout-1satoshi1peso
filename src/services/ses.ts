import {
  SESv2Client,
  SendEmailCommand,
  SendEmailCommandInput,
} from '@aws-sdk/client-sesv2';
import { SESClientInterface } from '../types/ses';

console.log(' ');

class SESClient implements SESClientInterface {
  private client: SESv2Client;

  constructor(accessId: string, secretKey: string) {
    this.client = new SESv2Client({
      region: 'sa-east-1',
      credentials: {
        accessKeyId: accessId,
        secretAccessKey: secretKey,
      },
    });
  }

  async sendEmailOrder(email: string, orderId: string) {
    const html: string = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tu entrada para la Panchitos Party</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #FFFFFF;
            color: #333333;
            padding: 20px;
            margin: 0;
          }

          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #FFFFFF;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px #444444;
            border: 1px solid #444444;
          }

          .logo-container {
            background-color: #000000;
            max-width: auto;
            max-height: 50px;
            margin: 0 auto;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px #444444;
            border: 1px solid #444444;
          }

          .logo-container img {
            width: 200px;
            height: auto;
            display: block;
            margin: 0 auto;
          }

          h1 {
            color: #444444;
            text-align: center;
          }

          p {
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          }

          .qr-code {
            text-align: center;
            margin: 20px 0;
          }

          .qr-code img {
            background-color: #FFFFFF;
            padding: 10px;
            border-radius: 8px;
            border: 2px solid #444444;
          }

          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 14px;
            color: #666666;
          }

          .footer a {
            color: #444444;
            text-decoration: none;
            margin: 0 10px;
          }

          .divider {
            border: none;
            height: 1px;
            background-color: #444444;
            margin: 20px 0;
            /* Espacio arriba y abajo de la línea */
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo-container">
            <img src='https://raw.githubusercontent.com/lacrypta/branding/main/iso/isologo-white.png' alt='la-crypta-logo'>
          </div>
          <h1>Tu entrada para la Panchitos Party</h1>
          <p>Te esperamos en: <br>📍 Villanueva 1367, Belgrano, CABA. <br>📅 Viernes 17 de Enero<br>⏰ A partir de las 20:00 hs.</p>
          <div class="qr-code">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${orderId}" alt="QR Code">
          </div>
          <p style="text-align:center;">Presentá este QR en la entrada.</p>
          <p style="text-align:center; color:gray;">ID: ${orderId}</p>
          <div class="footer">
            <hr class="divider">
            <p>Seguinos en nuestras redes:</p>
            <a href="https://x.com/lacryptaok" target="_blank">X</a> | <a href="https://instagram.com/lacryptaok" target="_blank">Instagram</a> | <a href="https://lacrypta.ar" target="_blank">Web</a> | <a href="https://primal.net/p/npub1rujdpkd8mwezrvpqd2rx2zphfaztqrtsfg6w3vdnljdghs2q8qrqtt9u68" target="_blank">Nostr</a>
            <hr class="divider">
            <p>&copy; 2024 La Crypta. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
    </html>`;

    const input: SendEmailCommandInput = {
      FromEmailAddress: 'ticketing@lacrypta.ar',
      Destination: {
        ToAddresses: [email],
      },
      ReplyToAddresses: ['ticketing@lacrypta.ar'],
      Content: {
        Simple: {
          Subject: {
            Data: 'Tu entrada para la Panchitos Party',
          },
          Body: {
            Html: {
              Data: html,
            },
          },
        },
      },
    };

    const command = new SendEmailCommand(input);

    return await this.client.send(command);
  }
 
  async sendEmailNewsletter(email: string) {
    const html: string = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscripción al Newsletter</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #FFFFFF;
            color: #333333;
            padding: 20px;
            margin: 0;
          }

          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #FFFFFF;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px #444444;
            border: 1px solid #444444;
          }

          .logo-container {
            background-color: #000000;
            max-width: auto;
            max-height: 100px;
            margin: 0 auto;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px #444444;
            border: 1px solid #444444;
          }

          .logo-container img {
            width: 200px;
            height: auto;
            display: block;
            margin: 0 auto;
          }

          h1 {
            color: #444444;
            text-align: center;
          }

          p {
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          }

          .qr-code {
            text-align: center;
            margin: 20px 0;
          }

          .qr-code img {
            background-color: #FFFFFF;
            padding: 10px;
            border-radius: 8px;
            border: 2px solid #444444;
          }

          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 14px;
            color: #666666;
          }

          .footer a {
            color: #444444;
            text-decoration: none;
            margin: 0 10px;
          }

          .logo img {
            width: 150px;
          }

          .divider {
            border: none;
            height: 1px;
            background-color: #444444;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo-container">
            <img src='https://raw.githubusercontent.com/lacrypta/branding/main/iso/isologo-white.png' alt='la-crypta-logo'>
          </div>
          <h1>¡Gracias por suscribirte al newsletter!</h1>
          <div class="footer">
            <hr class="divider">
            <p>Seguinos en nuestras redes:</p>
            <a href="https://x.com/lacryptaok" target="_blank">X</a> | <a href="https://instagram.com/lacryptaok" target="_blank">Instagram</a> | <a href="https://lacrypta.ar" target="_blank">Web</a> | <a href="https://primal.net/p/npub1rujdpkd8mwezrvpqd2rx2zphfaztqrtsfg6w3vdnljdghs2q8qrqtt9u68" target="_blank">Nostr</a>
            <hr class="divider">
            <p>&copy; 2024 La Crypta. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
    </html>`;

    const input: SendEmailCommandInput = {
      FromEmailAddress: 'newsletter@lacrypta.ar',
      Destination: {
        ToAddresses: [email],
      },
      ReplyToAddresses: ['newsletter@lacrypta.ar'],
      Content: {
        Simple: {
          Subject: {
            Data: 'Te subscribiste al newsletter de La Crypta',
          },
          Body: {
            Text: {
              Data: 'Texto de previsualizacion?',
            },
            Html: {
              Data: html,
            },
          },
        },
      },
    };

    const command = new SendEmailCommand(input);

    return await this.client.send(command);
  }
}

export const ses: SESClientInterface = new SESClient(
  process.env.NEXT_AWS_ACCESS_KEY_ID!,
  process.env.NEXT_AWS_SECRET_ACCESS_KEY!
);
