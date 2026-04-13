/**
 * / — Página principal com painel de edição lateral + prévia do relatório.
 * O painel de edição é visível apenas no browser; o PDF é gerado via /api/gerar-pdf.
 */

import { useState } from 'react';
import Head from 'next/head';
import RelatorioContent from '../components/RelatorioContent';

// ─── Constantes ───────────────────────────────────────────────────────────────

const MESES = [
  { value: '1',  label: 'Janeiro'   },
  { value: '2',  label: 'Fevereiro' },
  { value: '3',  label: 'Março'     },
  { value: '4',  label: 'Abril'     },
  { value: '5',  label: 'Maio'      },
  { value: '6',  label: 'Junho'     },
  { value: '7',  label: 'Julho'     },
  { value: '8',  label: 'Agosto'    },
  { value: '9',  label: 'Setembro'  },
  { value: '10', label: 'Outubro'   },
  { value: '11', label: 'Novembro'  },
  { value: '12', label: 'Dezembro'  },
];

const ATIVIDADES_EXEMPLO = [
  'Elaboração de contrato de prestação de serviços jurídicos',
  'Acompanhamento do processo trabalhista nº 0001234-56.2024.5.01.0001',
  'Assessoria e parecer jurídico sobre cláusulas contratuais',
];

// ─── Componentes auxiliares do painel ────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        display: 'block',
        fontSize: '10px',
        fontWeight: 700,
        color: 'rgba(255,255,255,0.45)',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        marginBottom: '6px',
      }}
    >
      {children}
    </label>
  );
}

const inputBase: React.CSSProperties = {
  width: '100%',
  background: '#060e1f',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  padding: '9px 12px',
  color: '#ffffff',
  fontSize: '13px',
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  transition: 'border-color 0.2s',
};

// ─── Página principal ─────────────────────────────────────────────────────────

export default function Home() {
  // Estado do formulário
  const now        = new Date();
  const [cliente,             setCliente            ] = useState('Nome do Cliente');
  const [mes,                 setMes                ] = useState(String(now.getMonth() + 1));
  const [ano,                 setAno                ] = useState(String(now.getFullYear()));
  const [logoClienteArquivo,  setLogoClienteArquivo ] = useState('');
  const [atividades,          setAtividades         ] = useState<string[]>(ATIVIDADES_EXEMPLO);
  const [gerando,             setGerando            ] = useState(false);
  const [erro,                setErro               ] = useState('');

  // Atividades com conteúdo (para o counter e para o relatório)
  const atividadesPreenchidas = atividades.filter(a => a.trim());

  // ── Handlers ────────────────────────────────────────────────────────────────

  const adicionar = () => setAtividades(prev => [...prev, '']);

  const remover = (i: number) =>
    setAtividades(prev => prev.filter((_, idx) => idx !== i));

  const atualizar = (i: number, valor: string) =>
    setAtividades(prev => prev.map((a, idx) => (idx === i ? valor : a)));

  const gerarPDF = async () => {
    setGerando(true);
    setErro('');
    try {
      const res = await fetch('/api/gerar-pdf', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ cliente, mes, ano, logoClienteArquivo, atividades: atividadesPreenchidas }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || `Erro HTTP ${res.status}`);
      }

      // Cria link de download e dispara o clique automaticamente
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href     = url;
      // O nome real vem no Content-Disposition do servidor.
      // Este valor é apenas o fallback local do navegador.
      link.download = `Relatorio-${cliente.replace(/\s+/g, '-')}-${mes}-${ano}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (err) {
      setErro(String(err));
    } finally {
      setGerando(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <Head>
        <title>DRS Advogados — Gerador de Relatório</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div
        style={{
          display:    'flex',
          minHeight:  '100vh',
          background: '#060e1f',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* ═══════════════════════════════════════════
            SIDEBAR — Painel de edição (apenas web)
        ═══════════════════════════════════════════ */}
        <aside
          style={{
            width:      '340px',
            minWidth:   '340px',
            height:     '100vh',
            position:   'sticky',
            top:        0,
            overflowY:  'auto',
            background: '#0d1f3c',
            borderRight:'1px solid rgba(255,255,255,0.07)',
            display:    'flex',
            flexDirection: 'column',
          }}
        >
          {/* Cabeçalho da sidebar */}
          <div
            style={{
              padding:      '24px 24px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  width:        '6px',
                  height:       '6px',
                  borderRadius: '50%',
                  background:   '#2e6fd4',
                  display:      'inline-block',
                }}
              />
              <span
                style={{
                  fontSize:      '9px',
                  fontWeight:    700,
                  color:         '#2e6fd4',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                }}
              >
                Painel de Edição
              </span>
            </div>
            <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>
              DRS Advogados
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
              Gerador de Relatório Mensal
            </p>
          </div>

          {/* Formulário */}
          <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Campo: Cliente */}
            <div>
              <Label>Nome do Cliente</Label>
              <input
                type="text"
                value={cliente}
                onChange={e => setCliente(e.target.value)}
                placeholder="Ex: Empresa ABC Ltda"
                style={inputBase}
                onFocus={e  => (e.target.style.borderColor = '#2e6fd4')}
                onBlur={e   => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>

            {/* Campo: Logo do cliente */}
            <div>
              <Label>Logo do Cliente (arquivo)</Label>
              <input
                type="text"
                value={logoClienteArquivo}
                onChange={e => setLogoClienteArquivo(e.target.value.trim())}
                placeholder="Ex: AFIX  (sem extensão .png)"
                style={inputBase}
                onFocus={e => (e.target.style.borderColor = '#2e6fd4')}
                onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
              <p style={{
                margin: '5px 0 0', fontSize: '10px',
                color: 'rgba(255,255,255,0.22)', lineHeight: 1.5,
              }}>
                Arquivo em <code style={{ color: '#60a5fa', fontSize: '9px' }}>public/clientes/[nome].png</code>
                <br />Se vazio, exibe as iniciais do cliente.
              </p>
            </div>

            {/* Campos: Mês + Ano */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <Label>Mês</Label>
                <select
                  value={mes}
                  onChange={e => setMes(e.target.value)}
                  style={{ ...inputBase, cursor: 'pointer', appearance: 'auto' }}
                  onFocus={e => (e.target.style.borderColor = '#2e6fd4')}
                  onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                >
                  {MESES.map(m => (
                    <option key={m.value} value={m.value} style={{ background: '#0d1f3c' }}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <Label>Ano</Label>
                <input
                  type="number"
                  value={ano}
                  onChange={e => setAno(e.target.value)}
                  placeholder="2026"
                  style={inputBase}
                  onFocus={e => (e.target.style.borderColor = '#2e6fd4')}
                  onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>
            </div>

            {/* Lista de Atividades */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display:        'flex',
                  justifyContent: 'space-between',
                  alignItems:     'center',
                  marginBottom:   '10px',
                }}
              >
                <Label>
                  Atividades&nbsp;
                  <span style={{ color: '#2e6fd4' }}>({atividadesPreenchidas.length})</span>
                </Label>
                <button
                  onClick={adicionar}
                  style={{
                    background:    'rgba(46,111,212,0.12)',
                    border:        '1px solid rgba(46,111,212,0.3)',
                    borderRadius:  '6px',
                    color:         '#60a5fa',
                    fontSize:      '11px',
                    fontWeight:    700,
                    padding:       '3px 10px',
                    cursor:        'pointer',
                    fontFamily:    'Inter, sans-serif',
                  }}
                >
                  + Adicionar
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {atividades.map((atividade, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    {/* Número */}
                    <span
                      style={{
                        fontSize:   '11px',
                        fontWeight: 900,
                        color:      '#2e6fd4',
                        marginTop:  '9px',
                        minWidth:   '18px',
                        opacity:    0.8,
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    {/* Textarea */}
                    <textarea
                      value={atividade}
                      onChange={e => atualizar(i, e.target.value)}
                      rows={2}
                      placeholder={`Atividade ${i + 1}...`}
                      style={{
                        ...inputBase,
                        resize:     'vertical',
                        minHeight:  '54px',
                        lineHeight: 1.5,
                      }}
                      onFocus={e => (e.target.style.borderColor = '#2e6fd4')}
                      onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                    />

                    {/* Botão remover */}
                    <button
                      onClick={() => remover(i)}
                      title="Remover atividade"
                      style={{
                        background:  'none',
                        border:      'none',
                        color:       'rgba(255,255,255,0.25)',
                        fontSize:    '18px',
                        cursor:      'pointer',
                        padding:     '4px',
                        marginTop:   '4px',
                        lineHeight:  1,
                        transition:  'color 0.2s',
                        fontFamily:  'Inter, sans-serif',
                      }}
                      onMouseEnter={e => ((e.target as HTMLElement).style.color = '#f87171')}
                      onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.25)')}
                    >
                      ×
                    </button>
                  </div>
                ))}

                {/* Hint para adicionar */}
                {atividades.length === 0 && (
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', margin: '12px 0' }}>
                    Clique em "Adicionar" para incluir atividades.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Rodapé da sidebar: botão Gerar PDF */}
          <div
            style={{
              padding:    '20px 24px',
              borderTop:  '1px solid rgba(255,255,255,0.07)',
            }}
          >
            {/* Mensagem de erro */}
            {erro && (
              <div
                style={{
                  background:   'rgba(239,68,68,0.1)',
                  border:       '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '8px',
                  padding:      '10px 12px',
                  marginBottom: '12px',
                  fontSize:     '11px',
                  color:        '#fca5a5',
                  lineHeight:   1.5,
                }}
              >
                <strong>Erro:</strong> {erro}
              </div>
            )}

            {/* Botão principal */}
            <button
              onClick={gerarPDF}
              disabled={gerando || atividadesPreenchidas.length === 0}
              style={{
                width:          '100%',
                background:     gerando ? 'rgba(46,111,212,0.5)' : '#2e6fd4',
                border:         'none',
                borderRadius:   '10px',
                color:          '#ffffff',
                fontSize:       '13px',
                fontWeight:     700,
                padding:        '13px 20px',
                cursor:         gerando || atividadesPreenchidas.length === 0 ? 'not-allowed' : 'pointer',
                fontFamily:     'Inter, sans-serif',
                opacity:        atividadesPreenchidas.length === 0 ? 0.5 : 1,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            '8px',
                transition:     'background 0.2s',
              }}
              onMouseEnter={e => {
                if (!gerando && atividadesPreenchidas.length > 0)
                  (e.target as HTMLElement).style.background = '#1a3f80';
              }}
              onMouseLeave={e => {
                if (!gerando)
                  (e.target as HTMLElement).style.background = '#2e6fd4';
              }}
            >
              {gerando ? (
                <>
                  {/* Spinner */}
                  <span
                    style={{
                      width:        '14px',
                      height:       '14px',
                      border:       '2px solid rgba(255,255,255,0.3)',
                      borderTop:    '2px solid #fff',
                      borderRadius: '50%',
                      display:      'inline-block',
                      animation:    'spin 0.7s linear infinite',
                    }}
                  />
                  Gerando PDF...
                </>
              ) : (
                <>
                  {/* Ícone download */}
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Gerar PDF
                </>
              )}
            </button>

            <p
              style={{
                margin:        '10px 0 0',
                textAlign:     'center',
                fontSize:      '10px',
                color:         'rgba(255,255,255,0.2)',
                letterSpacing: '0.03em',
              }}
            >
              Gerado via Puppeteer · formato A4
            </p>
          </div>

          {/* Animação do spinner */}
          <style>{`
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            select option { background: #0d1f3c; color: #fff; }
          `}</style>
        </aside>

        {/* ═══════════════════════════════════════════
            ÁREA PRINCIPAL — Prévia do relatório
        ═══════════════════════════════════════════ */}
        <main
          style={{
            flex:       1,
            padding:    '32px',
            overflowY:  'auto',
            display:    'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Label de prévia */}
          <div
            style={{
              display:        'flex',
              alignItems:     'center',
              gap:            '12px',
              width:          '100%',
              maxWidth:       '794px',
              marginBottom:   '16px',
            }}
          >
            <span
              style={{
                fontSize:      '9px',
                fontWeight:    700,
                color:         'rgba(255,255,255,0.25)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                whiteSpace:    'nowrap',
              }}
            >
              Prévia
            </span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', whiteSpace: 'nowrap' }}>
              PDF gerado em A4 portrait
            </span>
          </div>

          {/* Container do relatório com shadow + ring (simula folha A4) */}
          <div
            style={{
              width:        '100%',
              maxWidth:     '794px',
              borderRadius: '12px',
              overflow:     'hidden',
              boxShadow:    '0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
            }}
          >
            <RelatorioContent
              cliente={cliente}
              mes={mes}
              ano={ano}
              atividades={atividadesPreenchidas}
              logoClienteArquivo={logoClienteArquivo}
            />
          </div>
        </main>
      </div>
    </>
  );
}
