'use client';
import { useState, useEffect } from 'react';
import LogoDRS from './LogoDRS';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type ModoInvestimento = 'A' | 'B' | 'C' | 'D' | 'E';

export interface Quadro {
  titulo: string;
  itens:  string[];
}

export interface PropostaProps {
  destinatario:        string;
  logoClienteArquivo?: string;
  mostrarCliente?:     boolean;
  data?:               string;
  teamPhotos?:         Record<string, string>; // base64 data-URIs das fotos da equipe
  titulo:              string;
  introducao:          string;
  quadros:             Quadro[];
  formato:             string;
  duracao:             string;
  modoInvestimento:    ModoInvestimento;
  invValorUnico:       string;
  invValorOriginal:    string;
  invDesconto:         string;
  invValorDesconto:    string;
  invVista:            string;
  invParcelas:         string;
  invValorParcela:     string;
  invTextoParcela:     string;
  encerramento:        string;
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function GradientBar({ height = 4 }: { height?: number }) {
  return (
    <div style={{
      height,
      background: 'linear-gradient(90deg, #0d1f3c 0%, #1a3f80 25%, #2e6fd4 50%, #1a3f80 75%, #0d1f3c 100%)',
    }} />
  );
}

function SectionDivider({ icon = '⚖' }: { icon?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '0 0 32px' }}>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(46,111,212,0.45) 100%)' }} />
      <span style={{ fontSize: '16px', opacity: 0.6 }}>{icon}</span>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(46,111,212,0.45) 0%, transparent 100%)' }} />
    </div>
  );
}

/** Logo do cliente da proposta — tenta .png → .jpg → .jpeg em /clientes-relatorio/ */
const EXTS_P = ['.png', '.jpg', '.jpeg'] as const;
function temExt(n: string) { return /\.[a-zA-Z]{2,5}$/.test(n); }
function iniciais(n: string) { return n.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase() || 'C'; }

function LogoClienteProposta({ arquivo, nome, size = 'sm' }: { arquivo: string; nome: string; size?: 'sm' | 'lg' }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => { setIdx(0); }, [arquivo]);

  const px     = size === 'lg' ? '80px' : '36px';
  const radius = size === 'lg' ? '16px' : '8px';
  const fz     = size === 'lg' ? '28px' : '13px';
  const border = size === 'lg' ? '2px solid rgba(46,111,212,0.4)' : 'none';

  const avatar: React.CSSProperties = {
    width: px, height: px, borderRadius: radius,
    background: 'linear-gradient(135deg, #1a3f80, #2e6fd4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: fz, fontWeight: 900, color: '#fff', flexShrink: 0, border,
  };
  const imgStyle: React.CSSProperties = {
    width: px, height: px, borderRadius: radius,
    objectFit: 'contain', background: 'rgba(13,31,60,0.6)', flexShrink: 0, border,
  };

  if (!arquivo) return <div style={avatar}>{iniciais(nome)}</div>;

  const paths = temExt(arquivo)
    ? [`/clientes-relatorio/${arquivo}`]
    : EXTS_P.map(ext => `/clientes-relatorio/${arquivo}${ext}`);

  if (idx >= paths.length) return <div style={avatar}>{iniciais(nome)}</div>;

  // eslint-disable-next-line @next/next/no-img-element
  return <img key={paths[idx]} src={paths[idx]} alt={nome} className="client-logo-img" onError={() => setIdx(i => i + 1)} style={imgStyle} />;
}

/** Caixa azul com título em uppercase e itens com ✦ */
function QuadroBox({ quadro }: { quadro: Quadro }) {
  const itens = quadro.itens.filter(i => i.trim());
  if (!quadro.titulo.trim() && itens.length === 0) return null;
  return (
    <div
      className="quadro"
      style={{
        background: 'rgba(46,111,212,0.08)', border: '1px solid rgba(46,111,212,0.25)',
        borderRadius: '10px', padding: '14px 18px', marginBottom: 0,
        breakInside: 'avoid', pageBreakInside: 'avoid',
      }}
    >
      {quadro.titulo.trim() && (
        <h4 style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          {quadro.titulo}
        </h4>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {itens.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ color: '#2e6fd4', fontSize: '15px', flexShrink: 0, marginTop: '1px', lineHeight: 1.5 }}>✦</span>
            <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.82)', lineHeight: 1.5 }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Caixa de investimento com 4 modos */
function InvestimentoBox({
  modo, valorUnico, valorOriginal, desconto, valorDesconto, vista, parcelas, valorParcela, textoParcela,
}: {
  modo: ModoInvestimento;
  valorUnico: string; valorOriginal: string; desconto: string; valorDesconto: string;
  vista: string; parcelas: string; valorParcela: string; textoParcela: string;
}) {
  const temConteudo =
    modo === 'A' ? valorUnico.trim() :
    modo === 'B' ? (valorOriginal.trim() || valorDesconto.trim()) :
    modo === 'C' ? (vista.trim() || valorParcela.trim()) :
    modo === 'E' ? valorUnico.trim() :
    (valorOriginal.trim() || valorDesconto.trim() || valorParcela.trim());

  if (!temConteudo) return null;

  const temParcelas = parcelas.trim() || valorParcela.trim();
  const temDesconto = valorOriginal.trim() || valorDesconto.trim();

  return (
    <div
      className="investment-box"
      style={{
        background: 'rgba(46,111,212,0.08)', border: '1px solid rgba(46,111,212,0.3)',
        borderRadius: '10px', padding: '14px 18px', marginBottom: '16px',
        breakInside: 'avoid', pageBreakInside: 'avoid',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span style={{ fontSize: '18px', lineHeight: 1 }}>💼</span>
        <h4 style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          Investimento
        </h4>
      </div>

      {/* MODO A — valor único */}
      {modo === 'A' && valorUnico.trim() && (
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '38px', fontWeight: 900, color: '#60a5fa' }}>{valorUnico}</span>
        </div>
      )}

      {/* MODO B — com desconto */}
      {modo === 'B' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', textAlign: 'center' }}>
          {temDesconto && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {valorOriginal.trim() && (
                <span style={{ fontSize: '22px', color: 'rgba(255,255,255,0.38)', textDecoration: 'line-through' }}>{valorOriginal}</span>
              )}
              {valorOriginal.trim() && valorDesconto.trim() && (
                <span style={{ fontSize: '20px', color: 'rgba(255,255,255,0.3)' }}>→</span>
              )}
              {valorDesconto.trim() && (
                <span style={{ fontSize: '36px', fontWeight: 900, color: '#60a5fa' }}>{valorDesconto}</span>
              )}
              {!valorDesconto.trim() && valorOriginal.trim() && (
                <span style={{ fontSize: '36px', fontWeight: 900, color: '#60a5fa' }}>{valorOriginal}</span>
              )}
            </div>
          )}
          {desconto.trim() && (
            <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)' }}>
              {desconto}% de desconto para pagamento à vista
            </span>
          )}
        </div>
      )}

      {/* MODO C — à vista + parcelado */}
      {modo === 'C' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', textAlign: 'center' }}>
          {vista.trim() && (
            <div>
              <span style={{ fontSize: '34px', fontWeight: 900, color: '#60a5fa' }}>{vista}</span>
              <span style={{ fontSize: '17px', color: 'rgba(255,255,255,0.45)', marginLeft: '10px' }}>à vista</span>
            </div>
          )}
          {vista.trim() && temParcelas && (
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', letterSpacing: '0.06em' }}>ou</span>
          )}
          {temParcelas && (
            <div>
              <span style={{ fontSize: '26px', fontWeight: 700, color: '#93c5fd' }}>
                {parcelas.trim() && valorParcela.trim() ? `${parcelas}x de ${valorParcela}` : `${parcelas.trim()} ${valorParcela.trim()}`.trim()}
              </span>
              {textoParcela.trim() && (
                <span style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.38)', marginTop: '4px' }}>{textoParcela}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODO D — desconto + parcelamento */}
      {modo === 'D' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', textAlign: 'center' }}>
          {temDesconto && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {valorOriginal.trim() && (
                  <span style={{ fontSize: '20px', color: 'rgba(255,255,255,0.38)', textDecoration: 'line-through' }}>{valorOriginal}</span>
                )}
                {valorOriginal.trim() && valorDesconto.trim() && (
                  <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.3)' }}>→</span>
                )}
                <div>
                  <span style={{ fontSize: '30px', fontWeight: 900, color: '#60a5fa' }}>
                    {valorDesconto.trim() || valorOriginal}
                  </span>
                  <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.45)', marginLeft: '8px' }}>à vista</span>
                </div>
              </div>
              {desconto.trim() && (
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{desconto}% de desconto</span>
              )}
            </>
          )}
          {temDesconto && temParcelas && (
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>ou</span>
          )}
          {temParcelas && (
            <div>
              <span style={{ fontSize: '26px', fontWeight: 700, color: '#93c5fd' }}>
                {parcelas.trim() && valorParcela.trim() ? `${parcelas}x de ${valorParcela}` : `${parcelas.trim()} ${valorParcela.trim()}`.trim()}
              </span>
              {textoParcela.trim() && (
                <span style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.38)', marginTop: '4px' }}>{textoParcela}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODO E — valor mensal */}
      {modo === 'E' && valorUnico.trim() && (
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '38px', fontWeight: 900, color: '#60a5fa' }}>{valorUnico}</span>
          <span style={{ fontSize: '20px', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginLeft: '6px' }}>/ Mensal</span>
        </div>
      )}
    </div>
  );
}

// ─── Dados e componente da equipe ────────────────────────────────────────────

const EQUIPE = [
  {
    arquivo: 'daniel',
    nome:    'Dr. Daniel Martins',
    oab:     'OAB/DF 36.203',
    cargo:   'Fundador & CEO',
    bio:     'Formado em Direito desde 2009 e Advogado há 16 anos. Especialista na área Civil e Penal. Trabalhou em grandes escritórios de advocacia do país. Fundador da DRS Advogados Associados. Referência em consultoria jurídica estratégica para empresas.',
  },
  {
    arquivo: 'douglas',
    nome:    'Dr. Douglas Santos',
    oab:     'OAB/DF 55.068',
    cargo:   'Advogado',
    bio:     'Advogado desde 2017 e atuante na área jurídica há 17 anos. Trabalhou em Órgãos Públicos, Escritórios de Advocacia, Empresas Privadas e Sistema S. Hoje é Advogado da DRS e Professor Universitário de Direito da Faculdade Mauá-GO. Possui quatro Especializações e atualmente cursa Mestrado em Estudos Jurídicos Avançados na Universidad Européa del Atlântico – Espanha.',
  },
  {
    arquivo: 'laila',
    nome:    'Dra. Laila Araújo',
    oab:     'OAB/DF 62.421',
    cargo:   'Advogada',
    bio:     'Advogada atuante em Direito das Famílias, Inventários e Planejamento Patrimonial por meio de Holding Familiar. Especialista em Direito Público, Direito Civil e Processo Civil pela Escola da Magistratura do Distrito Federal. Possui MBA em Holding, Planejamento Societário e Sucessório pela Faculdade EBPÓS. É professora e coordenadora do curso de Direito da Faculdade Mauá (GO). Atualmente, é mestranda em Direito do Trabalho e Relações Sociais pelo Centro Universitário do Distrito Federal (UDF).',
  },
];

const EQUIPE_CORES = {
  douglas: { borda: '#2e6fd4', nome: '#60a5fa',  glow: 'rgba(46,111,212,0.10)'  },
  laila:   { borda: '#a78bfa', nome: '#c4b5fd',  glow: 'rgba(167,139,250,0.10)' },
  daniel:  { borda: '#34d399', nome: '#6ee7b7',  glow: 'rgba(52,211,153,0.10)'  },
};

function EquipeSection({ teamPhotos }: { teamPhotos?: Record<string, string> }) {
  const [fotos, setFotos] = useState<Record<string, string>>(teamPhotos ?? {});

  useEffect(() => {
    // Modo PDF (proposta.tsx SSR): teamPhotos já tem as 3 fotos em base64
    if (teamPhotos && Object.keys(teamPhotos).length >= 3) {
      setFotos(teamPhotos);
      return;
    }
    // Preview no browser: busca via API route
    const nomes = ['daniel', 'douglas', 'laila'];
    Promise.all(
      nomes.map(nome =>
        fetch(`/api/foto-pessoa?nome=${nome}`)
          .then(r => r.json())
          .then((d: { src: string | null }) => [nome, d.src] as const)
          .catch(() => [nome, null] as const)
      )
    ).then(pairs => {
      const acc: Record<string, string> = {};
      pairs.forEach(([nome, src]) => { if (src) acc[nome] = src; });
      setFotos(acc);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="team-section" style={{ background: '#060e1f', padding: '28px 48px' }}>

      {/* Separador */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(46,111,212,0.45))' }} />
        <span style={{ fontSize: '14px', opacity: 0.5 }}>⚖</span>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(46,111,212,0.45), transparent)' }} />
      </div>

      {/* Header premium */}
      <div style={{ marginBottom: '20px' }}>
        <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '6px' }}>
          Nossa Equipe
        </span>
        <h2 style={{ margin: '0 0 6px', fontSize: '34px', fontWeight: 900, color: '#fff', letterSpacing: '-1px', lineHeight: 1.1, textAlign: 'center' }}>
          Quem estará <span style={{ color: '#60a5fa' }}>ao seu lado</span>
        </h2>
        <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, textAlign: 'center' }}>
          Profissionais especializados, com trajetória sólida e comprometimento total com o seu caso.
        </p>
      </div>

      {/* Cards horizontais — um por linha */}
      {EQUIPE.map(({ arquivo, nome, oab, cargo, bio }) => {
        const c = EQUIPE_CORES[arquivo as keyof typeof EQUIPE_CORES];
        return (
          <div
            key={arquivo}
            style={{
              display:          'flex',
              gap:              '18px',
              alignItems:       'flex-start',
              background:       'rgba(255,255,255,0.03)',
              border:           '1px solid rgba(255,255,255,0.07)',
              borderLeft:       `3px solid ${c.borda}`,
              borderRadius:     '12px',
              padding:          '14px 18px',
              marginBottom:     '8px',
              breakInside:      'avoid',
              pageBreakInside:  'avoid',
              position:         'relative',
              overflow:         'hidden',
            }}
          >
            {/* Glow lateral */}
            <div style={{
              position:    'absolute',
              inset:       0,
              background:  `radial-gradient(circle at 0% 50%, ${c.glow} 0%, transparent 55%)`,
              pointerEvents: 'none',
            }} />

            {/* Foto */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="team-photo"
              data-pessoa={arquivo}
              src={fotos[arquivo] || ''}
              alt={nome}
              style={{
                width:           '76px',
                height:          '90px',
                borderRadius:    '9px',
                objectFit:       'cover',
                objectPosition:  'top center',
                flexShrink:      0,
                border:          '2px solid rgba(255,255,255,0.08)',
                position:        'relative',
                zIndex:          1,
                display:         'block',
              }}
            />

            {/* Info */}
            <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
              <p style={{ margin: '0 0 2px', fontSize: '16px', fontWeight: 900, letterSpacing: '-0.3px', color: c.nome }}>
                {nome}
              </p>
              <p style={{ margin: '0 0 1px', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                {cargo}
              </p>
              <p style={{ margin: '0 0 7px', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.8px' }}>
                {oab}
              </p>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '7px' }} />
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.55, fontWeight: 400, textAlign: 'justify' }}>
                {bio}
              </p>
            </div>
          </div>
        );
      })}

    </section>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PropostaContent({
  destinatario, logoClienteArquivo, mostrarCliente = true, titulo, introducao, quadros, formato, duracao,
  modoInvestimento, invValorUnico, invValorOriginal, invDesconto, invValorDesconto,
  invVista, invParcelas, invValorParcela, invTextoParcela, encerramento, teamPhotos,
}: PropostaProps) {

  const heroBackground: React.CSSProperties = {
    background: '#060e1f',
    backgroundImage: [
      'radial-gradient(ellipse 120% 80% at 55% -10%, rgba(46,111,212,0.3) 0%, transparent 65%)',
      'linear-gradient(rgba(46,111,212,0.055) 1px, transparent 1px)',
      'linear-gradient(90deg, rgba(46,111,212,0.055) 1px, transparent 1px)',
    ].join(', '),
    backgroundSize: '100% 100%, 36px 36px, 36px 36px',
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#060e1f', color: '#ffffff', position: 'relative' }}>
      <div className="report-wrapper" style={{ position: 'relative', zIndex: 1, margin: 0, padding: 0 }}>

        {/* ══════════════════════════════════════════
            PÁGINA 1 — CAPA
        ══════════════════════════════════════════ */}
        <section
          className="hero-section"
          style={{
            ...heroBackground,
            position: 'relative', overflow: 'hidden',
            minHeight: '297mm', pageBreakAfter: 'always', breakAfter: 'page',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}
        >
          {/* Linhas diagonais */}
          <svg aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.04, pointerEvents: 'none' }} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" viewBox="0 0 794 1123">
            {Array.from({ length: 36 }, (_, i) => (
              <line key={i} x1={-400 + i * 55} y1={0} x2={-400 + i * 55 + 700} y2={1123} stroke="white" strokeWidth="0.6" />
            ))}
          </svg>

          {/* Círculos concêntricos */}
          <div aria-hidden="true" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -52%)', width: '700px', height: '700px', pointerEvents: 'none' }}>
            {[700, 560, 420, 280, 140].map((d, i) => (
              <div key={i} style={{ position: 'absolute', width: `${d}px`, height: `${d}px`, borderRadius: '50%', border: '1px solid rgba(46,111,212,0.08)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
            ))}
          </div>

          {/* Topo: Logo DRS */}
          <div style={{ padding: '44px 48px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ marginBottom: '20px' }}>
              <LogoDRS size="lg" align="center" />
            </div>
            <div style={{ width: '220px', height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(46,111,212,0.5) 50%, transparent 100%)' }} />
          </div>

          {/* Centro: Badge + Título + Destinatário */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 48px', position: 'relative', zIndex: 1, gap: '24px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 16px', borderRadius: '999px',
              border: '1px solid rgba(46,111,212,0.4)', background: 'rgba(46,111,212,0.1)',
              color: '#93c5fd', fontSize: '12px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#2e6fd4', display: 'inline-block' }} />
              Proposta de Honorários
            </span>

            <h1 style={{ margin: 0, fontSize: '56px', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.12, maxWidth: '620px', color: '#60a5fa' }}>
              {titulo || 'Título da Proposta'}
            </h1>

            {/* Bloco "Preparado para" — exibido apenas se mostrarCliente === true */}
            {mostrarCliente && (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                padding: '20px 32px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '16px', backdropFilter: 'blur(4px)',
              }}>
                <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
                  Preparado para
                </p>
                <LogoClienteProposta arquivo={logoClienteArquivo ?? ''} nome={destinatario || 'Cliente'} size="lg" />
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
                  {destinatario || 'Cliente'}
                </span>
              </div>
            )}
          </div>

          {/* Rodapé da capa: Badge + Barra */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ height: '1px', margin: '0 48px', background: 'linear-gradient(90deg, transparent 0%, rgba(46,111,212,0.35) 50%, transparent 100%)', marginBottom: '24px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', paddingBottom: '32px', textAlign: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '999px', border: '1px solid rgba(46,111,212,0.35)', background: 'rgba(46,111,212,0.12)', color: '#93c5fd', fontSize: '13px', fontWeight: 700 }}>
                ⚖️ Assessoria Jurídica Especializada
              </span>
            </div>
            <GradientBar height={4} />
          </div>
        </section>

        {/* ══════════════════════════════════════════
            PÁGINA 2 — CONTEÚDO
        ══════════════════════════════════════════ */}
        <section className="activities-section proposal-content" style={{ background: '#060e1f', padding: '28px 48px 24px' }}>

          {introducao && introducao.trim() && (
            <p style={{ margin: '0 0 16px', fontSize: '16px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.7, fontWeight: 400, whiteSpace: 'pre-wrap', textAlign: 'justify' }}>
              {introducao}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
            {quadros.map((quadro, i) => <QuadroBox key={i} quadro={quadro} />)}
          </div>

          {(formato || duracao) && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {formato && formato.trim() && (
                <div style={{ flex: 1, minWidth: '140px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(46,111,212,0.2)', borderRadius: '10px', padding: '10px 14px' }}>
                  <div style={{ fontSize: '16px', marginBottom: '4px' }}>📅</div>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '2px' }}>Formato</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>{formato}</div>
                </div>
              )}
              {duracao && duracao.trim() && (
                <div style={{ flex: 1, minWidth: '140px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(46,111,212,0.2)', borderRadius: '10px', padding: '10px 14px' }}>
                  <div style={{ fontSize: '16px', marginBottom: '4px' }}>⏱</div>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '2px' }}>Duração</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>{duracao}</div>
                </div>
              )}
            </div>
          )}

          <InvestimentoBox
            modo={modoInvestimento}
            valorUnico={invValorUnico}
            valorOriginal={invValorOriginal}
            desconto={invDesconto}
            valorDesconto={invValorDesconto}
            vista={invVista}
            parcelas={invParcelas}
            valorParcela={invValorParcela}
            textoParcela={invTextoParcela}
          />

          {encerramento && encerramento.trim() && (
            <p style={{ margin: '0 0 16px', fontSize: '16px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, whiteSpace: 'pre-wrap', textAlign: 'justify' }}>
              {encerramento}
            </p>
          )}

        </section>

        <GradientBar height={4} />

        {/* ══════════════════════════════════════════
            PÁGINA 3 — NOSSA EQUIPE + FOOTER
            Wrapper ocupa 1 página A4 inteira
        ══════════════════════════════════════════ */}
        <div style={{ minHeight: '297mm', display: 'flex', flexDirection: 'column', pageBreakBefore: 'always', breakBefore: 'page' }}>
        <EquipeSection teamPhotos={teamPhotos} />

        <footer style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: '#060e1f', borderTop: '1px solid rgba(46,111,212,0.15)', padding: '0 48px' }}>

          <style>{`
            .proposta-cl {
              text-decoration: none; color: inherit;
              display: flex; align-items: center; gap: 9px;
              padding: 9px 12px;
              background: rgba(255,255,255,0.04);
              border: 1px solid rgba(255,255,255,0.07);
              border-radius: 9px; margin-bottom: 6px;
              width: 100%; box-sizing: border-box;
            }
            .proposta-cl:hover { opacity: 0.82; }
            .proposta-ci { width:32px; height:32px; border-radius:7px; object-fit:cover; flex-shrink:0; }
            .proposta-clbl { font-size:9px; color:#64748b; text-transform:uppercase; letter-spacing:0.1em; font-weight:700; margin-bottom:1px; }
            .proposta-cval { font-size:13px; font-weight:700; color:rgba(255,255,255,0.82); }
          `}</style>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(46,111,212,0.35))' }} />
            <span style={{ fontSize: '12px', opacity: 0.5 }}>★</span>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(46,111,212,0.35), transparent)' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '28px', alignItems: 'center', paddingBottom: '22px' }}>

            {/* Esquerda: redes sociais */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <a href="https://instagram.com/drsadvogadosassociados" target="_blank" rel="noopener noreferrer" className="proposta-cl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/Redes/instagram.png" alt="Instagram" className="proposta-ci" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div><div className="proposta-clbl">Instagram</div><div className="proposta-cval">@drsadvogadosassociados</div></div>
              </a>
              <a href="https://wa.me/5561998909393" target="_blank" rel="noopener noreferrer" className="proposta-cl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/Redes/whatsapp.png" alt="WhatsApp" className="proposta-ci" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div><div className="proposta-clbl">WhatsApp</div><div className="proposta-cval">61 99890-9393</div></div>
              </a>
              <a href="https://linkedin.com/company/drsadv/" target="_blank" rel="noopener noreferrer" className="proposta-cl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/Redes/linkedin.png" alt="LinkedIn" className="proposta-ci" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div><div className="proposta-clbl">LinkedIn</div><div className="proposta-cval">DRS Advogados Associados</div></div>
              </a>
            </div>

            {/* Centro: logo */}
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '150px' }}>
              <LogoDRS size="md" align="center" />
              <div style={{ width: '32px', height: '2px', background: 'linear-gradient(90deg, transparent, #2e6fd4, transparent)' }} />
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#93c5fd', textAlign: 'center', lineHeight: 1.45 }}>
                Assessoria Jurídica<br />Especializada
              </p>
            </div>

            {/* Direita: site + slogan */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}>
              <a href="https://www.drsadv.com.br" target="_blank" rel="noopener noreferrer" className="proposta-cl" style={{ justifyContent: 'flex-end' }}>
                <div style={{ textAlign: 'right' }}>
                  <div className="proposta-clbl">Site</div>
                  <div className="proposta-cval">www.drsadv.com.br</div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 36 36" style={{ flexShrink: 0, borderRadius: '6px', background: 'rgba(46,111,212,0.18)' }}>
                  <circle cx="18" cy="18" r="10" fill="none" stroke="#2e6fd4" strokeWidth="1.5" />
                  <ellipse cx="18" cy="18" rx="5" ry="10" fill="none" stroke="#2e6fd4" strokeWidth="1.2" />
                  <line x1="8" y1="18" x2="28" y2="18" stroke="#2e6fd4" strokeWidth="1.2" />
                  <line x1="10" y1="13" x2="26" y2="13" stroke="#2e6fd4" strokeWidth="1" />
                  <line x1="10" y1="23" x2="26" y2="23" stroke="#2e6fd4" strokeWidth="1" />
                </svg>
              </a>
              <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(46,111,212,0.08)', border: '1px solid rgba(46,111,212,0.2)', textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#93c5fd', lineHeight: 1.5 }}>
                  Excelência jurídica<br />em cada detalhe.
                </p>
              </div>
            </div>
          </div>

          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(46,111,212,0.25), transparent)', marginBottom: '10px' }} />
          <p style={{ margin: 0, textAlign: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.12)', letterSpacing: '0.08em', paddingBottom: '14px' }}>
            © {new Date().getFullYear()} DRS Advogados Associados · Todos os direitos reservados
          </p>
          <GradientBar height={4} />
        </footer>
        </div>{/* /page-3 wrapper */}
      </div>
    </div>
  );
}
