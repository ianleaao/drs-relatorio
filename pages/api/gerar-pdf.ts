/**
 * POST /api/gerar-pdf
 *
 * Recebe os dados do relatório via JSON body, constrói a URL absoluta
 * de /relatorio, abre o Puppeteer, aguarda o carregamento completo
 * (incluindo imagens) e retorna o PDF A4 portrait para download.
 *
 * Body esperado:
 *   {
 *     cliente:            string
 *     mes:                string
 *     ano:                string
 *     logoClienteArquivo: string   (nome do arquivo sem extensão, ex: "AFIX")
 *     atividades:         string[]
 *   }
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  const {
    cliente,
    mes,
    ano,
    logoClienteArquivo = '',
    atividades = [],
  } = req.body as {
    cliente:             string;
    mes:                 string;
    ano:                 string;
    logoClienteArquivo?: string;
    atividades:          string[];
  };

  // ── URL absoluta para a rota /relatorio ────────────────────────────────────
  // Puppeteer sempre acessa o servidor local; usamos http://localhost para
  // garantir que todas as imagens (/logo-drs.png, /fundo.png, /clientes/...)
  // sejam carregadas via URL absoluta sem problemas de CORS.
  const host     = req.headers.host || 'localhost:3000';
  const protocol = host.startsWith('localhost') || host.startsWith('127') ? 'http' : 'https';
  const baseUrl  = `${protocol}://${host}`;

  const params = new URLSearchParams();
  params.set('cliente', cliente             || '');
  params.set('mes',     mes                 || '');
  params.set('ano',     ano                 || '');
  params.set('logo',    logoClienteArquivo  || '');

  atividades
    .filter(a => a.trim())
    .forEach((a, i) => params.set(`a${i + 1}`, a));

  const url = `${baseUrl}/relatorio?${params.toString()}`;

  // ── Puppeteer ──────────────────────────────────────────────────────────────
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    const page = await browser.newPage();

    // Viewport A4 portrait @ 96 dpi  →  794 × 1123 px
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });

    // Navega para a rota limpa do relatório
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30_000 });

    // Aguarda o carregamento das fontes Web (Inter via Google Fonts)
    await page.evaluateHandle('document.fonts.ready');

    // Aguarda a rede ficar completamente ociosa (garante imagens carregadas)
    // waitForNetworkIdle está disponível a partir do Puppeteer v22
    await page.waitForNetworkIdle({ idleTime: 500, timeout: 10_000 }).catch(() => {
      // Se não disponível ou timeout, continua mesmo assim
    });

    // Pequena pausa extra para garantir rendering de backgrounds CSS
    await new Promise(resolve => setTimeout(resolve, 400));

    // ── Geração do PDF ──────────────────────────────────────────────────────
    const pdfBuffer = await page.pdf({
      format:            'A4',
      printBackground:   true,   // essencial para backgrounds escuros e imagens
      preferCSSPageSize: true,   // respeita @page do CSS; deixa o conteúdo crescer
      tagged:            true,   // preserva links clicáveis (<a href>) no PDF
      margin:            { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
    });

    // ── Monta o nome do arquivo no padrão Relatorio-[Cliente]-[Mês]-[Ano].pdf ─
    const NOMES_MESES = [
      'Janeiro','Fevereiro','Marco','Abril','Maio','Junho',
      'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
    ];

    /** Remove acentos e substitui espaços por hífen, preservando maiúsculas. */
    function slugify(str: string): string {
      return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')  // strip diacríticos
        .replace(/[^a-zA-Z0-9\s-]/g, '')  // remove caracteres especiais
        .trim()
        .replace(/\s+/g, '-');
    }

    const mesIdx      = parseInt(mes, 10) - 1;                         // "4" → 3
    const mesNome     = NOMES_MESES[mesIdx] ?? slugify(mes);            // → "Abril"
    const nomeArquivo = `Relatorio-${slugify(cliente || 'Cliente')}-${mesNome}-${ano || 'Ano'}.pdf`;

    res.setHeader('Content-Type',        'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivo}"`);
    res.setHeader('Content-Length',       pdfBuffer.length);
    res.end(pdfBuffer);

  } catch (err) {
    console.error('[gerar-pdf] Erro:', err);
    res.status(500).json({ error: 'Erro interno ao gerar o PDF.', detail: String(err) });
  } finally {
    if (browser) await browser.close();
  }
}
