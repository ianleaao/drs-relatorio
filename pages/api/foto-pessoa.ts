/**
 * GET /api/foto-pessoa?nome=daniel
 *
 * Devolve a foto de um membro da equipe (public/pessoas/[nome].jpg|jpeg|png)
 * como data URI base64. Usada na prévia da proposta e da holding.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import fs   from 'fs';
import path from 'path';

// Só nomes conhecidos: evita que o parâmetro seja usado para ler outros arquivos
const MEMBROS = new Set(['daniel', 'douglas', 'laila']);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { nome } = req.query;
  if (typeof nome !== 'string' || !MEMBROS.has(nome)) {
    return res.status(400).json({ src: null });
  }

  for (const ext of ['jpg', 'jpeg', 'png']) {
    const filePath = path.join(process.cwd(), 'public', 'pessoas', `${nome}.${ext}`);
    if (fs.existsSync(filePath)) {
      const mime   = ext === 'jpg' ? 'jpeg' : ext;
      const base64 = fs.readFileSync(filePath).toString('base64');
      return res.json({ src: `data:image/${mime};base64,${base64}` });
    }
  }

  return res.status(404).json({ src: null });
}
