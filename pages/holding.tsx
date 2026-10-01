/**
 * /holding — Rota limpa da apresentação de Holding, sem painel de edição.
 * Puppeteer acessa esta rota para gerar o PDF.
 *
 * ?destinatario=X&logoCliente=X&mostrarCliente=true&data=X
 */

import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import fs   from 'fs';
import path from 'path';
import HoldingContent, { type HoldingProps } from '../components/HoldingContent';

export default function Holding(props: HoldingProps) {
  return (
    <>
      <Head>
        <title>Holding DRS</title>
        <style>{`
          html, body { margin:0; padding:0; background:#060e1f; height:auto !important; overflow:visible !important; }
          @page { size: A4 portrait; margin: 0; }
          *, *::before, *::after { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

          body::before {
            content: ''; position: fixed; inset: 0;
            background-image: url('/Foto fundo/fundo.jpg');
            background-size: cover; background-position: center;
            opacity: 0.05; z-index: 0; pointer-events: none;
          }

          .report-wrapper { position: relative; z-index: 1; margin: 0 !important; padding: 0 !important; }

          /* Capa preenche a primeira página */
          .hero-section {
            min-height: 297mm !important;
            page-break-after: always !important;
            break-after: page !important;
            margin-bottom: 0 !important;
            padding-bottom: 0 !important;
          }

          /* Quebra de página explícita — div vazio entre seções */
          .page-break {
            page-break-before: always !important;
            break-before: page !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            display: block;
          }

          /* Seções de conteúdo — sem altura fixa */
          .page-section {
            position: relative; z-index: 1;
          }

          /* Nunca cortar esses elementos no meio */
          .team-card,
          .vantagem-card,
          .timeline-step,
          .content-box {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          /* Grid de vantagens — não esticar cards */
          .vantagens-grid { align-items: start; }

          .team-photo { object-fit: cover; object-position: top center; display: block; }
          .client-logo-img { display: block; object-fit: contain; }
        `}</style>
      </Head>
      <HoldingContent {...props} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<HoldingProps> = async ({ query }) => {
  const destinatario       = (query.destinatario   as string) || '';
  const logoClienteArquivo = (query.logoCliente     as string) || '';
  const mostrarCliente     = (query.mostrarCliente  as string) !== 'false';
  const data               = (query.data            as string) || '';

  const teamPhotos: Record<string, string> = {};
  for (const member of ['daniel', 'douglas', 'laila']) {
    for (const ext of ['jpg', 'jpeg', 'png']) {
      const filePath = path.join(process.cwd(), 'public', 'pessoas', `${member}.${ext}`);
      if (fs.existsSync(filePath)) {
        const mime = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
        teamPhotos[member] = `data:${mime};base64,${fs.readFileSync(filePath).toString('base64')}`;
        break;
      }
    }
  }

  return { props: { destinatario, logoClienteArquivo, mostrarCliente, data, teamPhotos } };
};
