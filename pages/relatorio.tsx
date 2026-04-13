/**
 * /relatorio — Rota limpa do relatório, sem painel de edição.
 * É esta rota que o Puppeteer acessa para gerar o PDF.
 *
 * Recebe dados via query params:
 *   ?cliente=X&mes=4&ano=2026&logo=AFIX&a1=texto&a2=texto...
 */

import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import RelatorioContent, { type RelatorioProps } from '../components/RelatorioContent';

export default function Relatorio(props: RelatorioProps) {
  return (
    <>
      <Head>
        <title>Relatório DRS — {props.cliente}</title>
        {/* Garante que o PDF tenha tamanho A4 sem margens extras */}
        <style>{`
          html, body {
            margin: 0;
            padding: 0;
            background: #060e1f;
            height: auto !important;
            overflow: visible !important;
          }

          /* Deixa o PDF crescer conforme o conteúdo — sem corte fixo de página */
          @page { size: A4 portrait; margin: 0; }

          /* Garante backgrounds no Puppeteer */
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Imagem de fundo — APENAS no PDF, não no preview do editor.
             opacity: 0.05 = textura super sutil.
             Arquivo: public/Foto fundo/fundo.jpg               */
          body::before {
            content: '';
            position: fixed;
            inset: 0;
            background-image: url('/Foto fundo/fundo.jpg');
            background-size: cover;
            background-position: center;
            opacity: 0.05;
            z-index: 0;
            pointer-events: none;
          }

          /* Todo o conteúdo acima da imagem de fundo */
          .report-wrapper {
            position: relative;
            z-index: 1;
          }

          /* Capa ocupa toda a primeira página — sem gap após */
          .hero-section {
            min-height:       297mm !important;
            page-break-after: always !important;
            break-after:      page !important;
            margin-bottom:    0 !important;
            padding-bottom:   0 !important;
          }

          /* Atividades começam rente ao topo da página 2 */
          .activities-section {
            margin-top:        0 !important;
            page-break-before: avoid !important;
            break-before:      avoid !important;
          }

          /* Nunca cortar dentro de um card */
          .act-card {
            break-inside:      avoid !important;
            page-break-inside: avoid !important;
            margin-bottom:     12px !important;
          }

          /* Permite quebra entre cards */
          .activities-grid {
            break-inside: auto !important;
          }

          /* Wrapper sem gaps */
          .report-wrapper {
            margin:  0 !important;
            padding: 0 !important;
          }
        `}</style>
      </Head>
      <RelatorioContent {...props} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<RelatorioProps> = async ({ query }) => {
  const cliente             = (query.cliente as string) || 'Nome do Cliente';
  const mes                 = (query.mes     as string) || String(new Date().getMonth() + 1);
  const ano                 = (query.ano     as string) || String(new Date().getFullYear());
  const logoClienteArquivo  = (query.logo    as string) || '';

  // Extrai atividades: a1, a2, a3, ...
  const atividades: string[] = [];
  let i = 1;
  while (query[`a${i}`]) {
    atividades.push(query[`a${i}`] as string);
    i++;
  }

  return { props: { cliente, mes, ano, atividades, logoClienteArquivo } };
};
