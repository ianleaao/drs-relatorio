/**
 * /proposta — Rota limpa da proposta de honorários, sem painel de edição.
 * É esta rota que o Puppeteer acessa para gerar o PDF da proposta.
 *
 * Recebe dados via query params:
 *   ?destinatario=X&titulo=X&introducao=X&formato=X&duracao=X
 *   &modoInv=C&invVista=X&invParcelas=2&invValorParcela=X&encerramento=X&q1=titulo&q1i1=item...
 */

import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import fs   from 'fs';
import path from 'path';
import PropostaContent, { type PropostaProps, type ModoInvestimento } from '../components/PropostaContent';

export default function Proposta(props: PropostaProps) {
  return (
    <>
      <Head>
        <title>Proposta DRS</title>
        <style>{`
          html, body {
            margin: 0;
            padding: 0;
            background: #060e1f;
          }

          @page { size: A4 portrait; margin: 0; }

          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

.report-wrapper {
            position: relative;
            z-index: 1;
            margin:  0 !important;
            padding: 0 !important;
          }

          .hero-section {
            min-height:       297mm !important;
            page-break-after: always !important;
            break-after:      page !important;
            margin-bottom:    0 !important;
            padding-bottom:   0 !important;
          }

          .activities-section {
            margin-top:        0 !important;
            page-break-before: avoid !important;
            break-before:      avoid !important;
          }

          /* Logo do cliente — garante renderização correta no Puppeteer */
          .client-logo-img {
            display: block;
            object-fit: contain;
          }

          /* ── Nossa Equipe ── */
          .team-section {
            break-before:      auto;
            page-break-before: auto;
            break-inside:      avoid-page;
            margin-top:        0;
            padding-top:       48px;
          }
          .team-photo {
            object-fit: cover;
            object-position: top center;
            display: block;
          }

          /* Nunca cortar quadros ou bloco de investimento no meio */
          .quadro,
          .investment-box {
            break-inside:      avoid !important;
            page-break-inside: avoid !important;
          }

          /* Nunca cortar um item de tópico no meio */
          .quadro > div > div {
            break-inside:      avoid !important;
            page-break-inside: avoid !important;
          }

          /* Orphans/widows na seção de conteúdo */
          .proposal-content {
            orphans: 4;
            widows:  4;
          }

          /* Impedir página em branco após o footer final */
          footer:last-child {
            page-break-after: avoid !important;
            break-after:      avoid !important;
          }
        `}</style>
      </Head>
      <PropostaContent {...props} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<PropostaProps> = async ({ query }) => {
  const destinatario       = (query.destinatario      as string) || '';
  const mostrarCliente     = (query.mostrarCliente     as string) !== 'false';
  const logoClienteArquivo = (query.logoCliente        as string) || '';
  const data               = (query.data               as string) || '';
  const titulo             = (query.titulo             as string) || 'Proposta de Honorários';
  const introducao         = (query.introducao         as string) || '';
  const formato            = (query.formato            as string) || '';
  const duracao            = (query.duracao            as string) || '';
  const encerramento       = (query.encerramento       as string) || '';
  const modoInvestimento   = ((query.modoInv           as string) || 'A') as ModoInvestimento;
  const invValorUnico      = (query.invValorUnico      as string) || '';
  const invValorOriginal   = (query.invValorOriginal   as string) || '';
  const invDesconto        = (query.invDesconto        as string) || '';
  const invValorDesconto   = (query.invValorDesconto   as string) || '';
  const invVista           = (query.invVista           as string) || '';
  const invParcelas        = (query.invParcelas        as string) || '';
  const invValorParcela    = (query.invValorParcela    as string) || '';
  const invTextoParcela    = (query.invTextoParcela    as string) || '';

  const quadros: { titulo: string; itens: string[] }[] = [];
  let qi = 1;
  while (query[`q${qi}`] !== undefined) {
    const tituloQ = (query[`q${qi}`] as string) || '';
    const itens: string[] = [];
    let ii = 1;
    while (query[`q${qi}i${ii}`] !== undefined) {
      itens.push((query[`q${qi}i${ii}`] as string) || '');
      ii++;
    }
    quadros.push({ titulo: tituloQ, itens });
    qi++;
  }

  // Ler fotos da equipe do disco e converter para base64 (garante exibição no PDF)
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

  return {
    props: {
      destinatario, mostrarCliente, logoClienteArquivo, data, titulo, introducao, quadros, formato, duracao,
      modoInvestimento, invValorUnico, invValorOriginal, invDesconto, invValorDesconto,
      invVista, invParcelas, invValorParcela, invTextoParcela, encerramento, teamPhotos,
    },
  };
};
