import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import fs from 'fs';
import path from 'path';

const NOTION_KEY = process.env.NOTION_KEY;
// If the user configures a specific Notion Database ID for CTA guides, they can define NOTION_DB_ID_CTA.
// Otherwise, we fallback to a placeholder or skip Notion if not configured.
const NOTION_DB_ID_CTA = process.env.NOTION_DB_ID_CTA;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, correo, queQuieresMejorar } = body;

    if (!nombre || !correo) {
      return NextResponse.json(
        { error: 'El nombre y el correo son requeridos.' },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();
    const submission = {
      nombre,
      correo,
      queQuieresMejorar: queQuieresMejorar || 'Solo quiero ver ejemplos',
      fecha: timestamp,
    };

    // 1. Guardar localmente en app/data/cta-submissions.json para desarrollo / respaldo
    try {
      const dataDir = path.join(process.cwd(), 'app', 'data');
      const filePath = path.join(dataDir, 'cta-submissions.json');

      // Crear directorio si no existe (por si acaso)
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      let submissions: any[] = [];
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        try {
          submissions = JSON.parse(fileContent);
          if (!Array.isArray(submissions)) {
            submissions = [];
          }
        } catch (e) {
          console.error('Error parsing cta-submissions.json, resetting array', e);
        }
      }

      submissions.push(submission);
      fs.writeFileSync(filePath, JSON.stringify(submissions, null, 2), 'utf8');
      console.log('Lead guardado localmente en cta-submissions.json:', submission);
    } catch (fsError) {
      // Registrar error local pero continuar para no interrumpir el flujo del usuario
      console.error('No se pudo escribir localmente en el archivo (puede ser un entorno Serverless):', fsError);
    }

    // 2. Intentar guardar en Notion si la API key y el ID de base de datos están configurados
    if (NOTION_KEY && NOTION_DB_ID_CTA) {
      try {
        const notion = new Client({ auth: NOTION_KEY });
        await notion.pages.create({
          parent: { database_id: NOTION_DB_ID_CTA },
          properties: {
            'Nombre completo': {
              title: [
                {
                  text: {
                    content: nombre,
                  },
                },
              ],
            },
            'Correo electrónico': {
              email: correo,
            },
            '¿Qué quieres mejorar?': {
              select: {
                name: queQuieresMejorar || 'Solo quiero ver ejemplos',
              },
            },
            'Fecha Registro': {
              date: {
                start: timestamp,
              },
            },
          },
        });
        console.log('Lead enviado con éxito a Notion.');
      } catch (notionError: any) {
        console.error('Error al guardar en Notion:', notionError.body || notionError);
        // Retornamos éxito de todos modos porque ya se guardó o se procesó el lead,
        // no queremos mostrarle un error feo de sistema al usuario final.
      }
    } else {
      console.log('Notion no configurado para este recurso (faltan NOTION_KEY o NOTION_DB_ID_CTA). Guardado solo local.');
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error en API cta-submit:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.', details: error.message },
      { status: 500 }
    );
  }
}
