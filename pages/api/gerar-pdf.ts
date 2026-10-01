/**
 * POST /api/gerar-pdf
 *
 * Recebe os dados via JSON body, constrói a URL da rota limpa correspondente
 * (/relatorio, /proposta ou /holding), abre o Puppeteer, aguarda o carregamento
 * completo (incluindo imagens) e retorna o PDF A4 portrait para download.
 *
 * Campo `tipo`: 'relatorio' (padrão) | 'proposta' | 'holding'.
 * Os campos de proposta e holding estão documentados em pages/proposta.tsx
 * e pages/holding.tsx.
 *
 * Body esperado (relatório):
 *   {
 *     cliente:            string
 *     mes:                string
 *     ano:                string
 *     logoClienteArquivo: string   (nome do arquivo sem extensão, ex: "AFIX")
 *     atividades:         string[]
 *     horasAtividades:    string[] (mesmo tamanho que atividades, pode ter strings vazias)
 *     horasTotais:        string   (ex: "32h")
 *   }
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';
import fs   from 'fs';
import path from 'path';

/** Remove acentos e caracteres especiais e troca espaços por hífen, preservando maiúsculas. */
function slugify(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // remove diacríticos
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/** "2026-04-22" → "22-04-2026"; sem data, usa a data de hoje. */
function dataSlug(dataISO: string): string {
  const iso = dataISO || new Date().toISOString().split('T')[0];
  const [a, m, d] = iso.split('-');
  return `${d}-${m}-${a}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  const tipo = (req.body.tipo as string) || 'relatorio';

  // ── URL absoluta ───────────────────────────────────────────────────────────
  // O Puppeteer sempre acessa o próprio servidor (porta local da requisição).
  // Não usamos o header Host: ele vem do cliente e permitiria apontar o
  // navegador headless para qualquer endereço.
  const baseUrl = `http://127.0.0.1:${req.socket.localPort ?? 3000}`;

  let url:         string;
  let nomeArquivo: string;
  let logoNome:    string;  // nome do arquivo do cliente (sem extensão)

  if (tipo === 'holding') {
    // ── Holding ───────────────────────────────────────────────────────────────
    const {
      destinatario   = '',
      mostrarCliente = true,
      logoCliente    = '',
      dataISO        = '',
    } = req.body as Record<string, string>;

    const params = new URLSearchParams();
    params.set('destinatario',   String(destinatario));
    params.set('mostrarCliente', String(mostrarCliente));
    params.set('logoCliente',    String(logoCliente));

    url      = `${baseUrl}/holding?${params.toString()}`;
    logoNome = String(logoCliente);

    nomeArquivo = `Holding-DRS-${slugify(destinatario || 'Cliente')}-${dataSlug(dataISO)}.pdf`;

  } else if (tipo === 'proposta') {
    // ── Proposta ──────────────────────────────────────────────────────────────
    const {
      destinatario    = '',
      mostrarCliente  = true,
      logoCliente     = '',
      data            = '',
      dataISO         = '',
      titulo          = '',
      introducao      = '',
      quadros         = [],
      formato         = '',
      duracao         = '',
      modoInv         = 'A',
      invValorUnico   = '',
      invValorOriginal= '',
      invDesconto     = '',
      invValorDesconto= '',
      invVista        = '',
      invParcelas     = '',
      invValorParcela = '',
      invTextoParcela = '',
      encerramento    = '',
    } = req.body as Record<string, any>;

    const params = new URLSearchParams();
    params.set('destinatario',    String(destinatario));
    params.set('mostrarCliente',  String(mostrarCliente));
    params.set('logoCliente',     String(logoCliente));
    params.set('data',            String(data));
    params.set('titulo',          String(titulo));
    params.set('introducao',      String(introducao));
    params.set('formato',         String(formato));
    params.set('duracao',         String(duracao));
    params.set('modoInv',         String(modoInv));
    params.set('invValorUnico',   String(invValorUnico));
    params.set('invValorOriginal',String(invValorOriginal));
    params.set('invDesconto',     String(invDesconto));
    params.set('invValorDesconto',String(invValorDesconto));
    params.set('invVista',        String(invVista));
    params.set('invParcelas',     String(invParcelas));
    params.set('invValorParcela', String(invValorParcela));
    params.set('invTextoParcela', String(invTextoParcela));
    params.set('encerramento',    String(encerramento));

    // Encodifica quadros: q1=titulo, q1i1=item, q1i2=item, ...
    (quadros as { titulo: string; itens: string[] }[]).forEach((q, qi) => {
      params.set(`q${qi + 1}`, q.titulo);
      q.itens.filter((item: string) => item.trim()).forEach((item: string, ii: number) => {
        params.set(`q${qi + 1}i${ii + 1}`, item);
      });
    });

    url      = `${baseUrl}/proposta?${params.toString()}`;
    logoNome = String(logoCliente);

    nomeArquivo = `Proposta-DRS-${slugify(destinatario || 'Cliente')}-${dataSlug(dataISO)}.pdf`;

  } else {
    // ── Relatório ─────────────────────────────────────────────────────────────
    const {
      cliente            = '',
      mes                = '',
      ano                = '',
      logoClienteArquivo = '',
      atividades         = [],
      horasAtividades    = [],
      horasTotais        = '',
    } = req.body as {
      cliente?:             string;
      mes?:                 string;
      ano?:                 string;
      logoClienteArquivo?:  string;
      atividades?:          string[];
      horasAtividades?:     string[];
      horasTotais?:         string;
    };

    const params = new URLSearchParams();
    params.set('cliente',     cliente);
    params.set('mes',         mes);
    params.set('ano',         ano);
    params.set('logo',        logoClienteArquivo);
    params.set('horasTotal',  horasTotais);

    (atividades as string[]).filter((a: string) => a.trim()).forEach((a: string, i: number) => {
      params.set(`a${i + 1}`, a);
      const h = (horasAtividades as string[])[i] ?? '';
      if (h.trim()) params.set(`h${i + 1}`, h);
    });

    url      = `${baseUrl}/relatorio?${params.toString()}`;
    logoNome = String(logoClienteArquivo);

    const NOMES_MESES = [
      'Janeiro','Fevereiro','Marco','Abril','Maio','Junho',
      'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
    ];
    const mesIdx  = parseInt(mes, 10) - 1;
    const mesNome = NOMES_MESES[mesIdx] ?? slugify(mes);
    nomeArquivo = `Relatorio-${slugify(cliente || 'Cliente')}-${mesNome}-${slugify(ano) || 'Ano'}.pdf`;
  }

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

    // ── Injetar logo do cliente como base64 (evita falha de path no mobile) ──
    // Aceita só um nome de arquivo simples (sem pastas), para não ler nada fora da pasta de logos
    logoNome = path.basename(logoNome.trim());
    if (logoNome && !logoNome.startsWith('.')) {
      const hasExt   = /\.(png|jpe?g)$/i.test(logoNome);
      const candidates = hasExt
        ? [logoNome]
        : ['png', 'jpg', 'jpeg'].map(e => `${logoNome}.${e}`);

      // Relatório usa /public/clientes/; proposta e holding usam /public/clientes-relatorio/
      const logoFolder = tipo === 'relatorio' ? 'clientes' : 'clientes-relatorio';

      for (const filename of candidates) {
        const filePath = path.join(process.cwd(), 'public', logoFolder, filename);
        if (fs.existsSync(filePath)) {
          const ext     = filename.split('.').pop()!.toLowerCase();
          const mime    = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
          const dataUrl = `data:${mime};base64,${fs.readFileSync(filePath).toString('base64')}`;
          await page.evaluate((src: string) => {
            document.querySelectorAll<HTMLImageElement>('.client-logo-img').forEach(img => {
              img.src = src;
            });
          }, dataUrl);
          break;
        }
      }
    }

    // ── Fotos da equipe: injeção base64 de segurança (proposta) ──────────────
    if (tipo === 'proposta') {
      for (const member of ['daniel', 'douglas', 'laila']) {
        for (const ext of ['jpg', 'jpeg', 'png']) {
          const fp = path.join(process.cwd(), 'public', 'pessoas', `${member}.${ext}`);
          if (fs.existsSync(fp)) {
            const mime    = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
            const dataUrl = `data:${mime};base64,${fs.readFileSync(fp).toString('base64')}`;
            await page.evaluate((pessoa: string, src: string) => {
              const img = document.querySelector<HTMLImageElement>(`[data-pessoa="${pessoa}"]`);
              if (img) img.src = src;
            }, member, dataUrl);
            break;
          }
        }
      }
    }

    // Pequena pausa extra para garantir rendering de backgrounds CSS
    await new Promise(resolve => setTimeout(resolve, 400));

    // ── Geração do PDF ──────────────────────────────────────────────────────
    const pdfBuffer = await page.pdf({
      format:            'A4',
      printBackground:   true,
      preferCSSPageSize: tipo !== 'holding',  // holding usa fluxo contínuo sem altura fixa
      tagged:            true,
      margin:            { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
    });

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
