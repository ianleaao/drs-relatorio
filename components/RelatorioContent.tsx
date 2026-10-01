/**
 * RelatorioContent — Componente principal do relatório jurídico mensal DRS.
 * Renderizado na prévia do browser (/) e na rota limpa (/relatorio) que o
 * Puppeteer captura para gerar o PDF.
 *
 * Estrutura de arquivos esperada em /public:
 *   /logo-drs.png          → logo da DRS  (renomear "Logo Drs.png")
 *   /Foto fundo/fundo.jpg  → imagem de fundo
 *   /clientes/[nome].png   → logo do cliente (proposta e holding usam /clientes-relatorio/)
 */

'use client';
import { useState, useEffect } from 'react';
import LogoDRS from './LogoDRS';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface RelatorioProps {
  cliente:             string;
  mes:                 string;  // "1"–"12"
  ano:                 string;
  atividades:          string[];
  logoClienteArquivo?: string;  // nome do arquivo sem extensão, ex: "AFIX"
  horasTotais?:        string;  // ex: "32h"
  horasAtividades?:    string[]; // ex: ["4h", "2h30", ""] — same length as atividades
}

// ─── Utilitários ──────────────────────────────────────────────────────────────

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function nomeMes(mes: string): string {
  const idx = parseInt(mes, 10) - 1;
  return MESES[idx] ?? mes;
}

/** Iniciais do nome do cliente (até 2 letras). */
function iniciais(nome: string): string {
  return nome.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase() || 'C';
}

/** Badge de categoria inferido automaticamente pelo texto da atividade. */
function inferirCategoria(texto: string): { label: string; bg: string; color: string } {
  const t = texto.toLowerCase();
  if (/contrat|distrat|locaç|aluguel|compra|venda|fornec|aquisição/.test(t))
    return { label: 'Contratos',       bg: 'rgba(46,111,212,0.18)',  color: '#60a5fa' };
  if (/process|ação judicial|reclamaç|petiç|audiênc|sentença|recurso|apelação|trabalhist|cível|vara|tribunal/.test(t))
    return { label: 'Processos',       bg: 'rgba(139,92,246,0.18)',  color: '#a78bfa' };
  if (/elabor|redigir|redaç|minuta|document|draft|confecç/.test(t))
    return { label: 'Elaboração',      bg: 'rgba(16,185,129,0.18)',  color: '#34d399' };
  if (/acompanham|monitoram|prazo|andamento|diligênc|follow/.test(t))
    return { label: 'Acompanhamento',  bg: 'rgba(245,158,11,0.18)',  color: '#fbbf24' };
  return   { label: 'Assessoria',      bg: 'rgba(249,115,22,0.18)',  color: '#fb923c' };
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

// Extensões tentadas em ordem quando o usuário não digita a extensão
const EXTS = ['.png', '.jpg', '.jpeg'] as const;

/** Retorna true se a string já termina com uma extensão de imagem. */
function temExtensao(nome: string): boolean {
  return /\.[a-zA-Z]{2,5}$/.test(nome);
}

/**
 * Logo dinâmica do cliente com fallback de iniciais.
 * Tenta automaticamente .png → .jpg → .jpeg quando nenhuma extensão for digitada.
 * Reseta as tentativas sempre que `arquivo` mudar.
 */
function LogoCliente({
  arquivo, nome, size = 'sm',
}: { arquivo: string; nome: string; size?: 'sm' | 'lg' }) {
  // Índice da tentativa atual (0, 1, 2…); quando >= tentativas.length → fallback
  const [extIdx, setExtIdx] = useState(0);

  // Reinicia as tentativas toda vez que o nome do arquivo mudar
  useEffect(() => { setExtIdx(0); }, [arquivo]);

  const ini      = iniciais(nome);
  const px       = size === 'lg' ? '80px' : '36px';
  const radius   = size === 'lg' ? '16px' : '8px';
  const fontSize = size === 'lg' ? '28px' : '13px';

  const avatarStyle: React.CSSProperties = {
    width: px, height: px, borderRadius: radius,
    background: 'linear-gradient(135deg, #1a3f80, #2e6fd4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize, fontWeight: 900, color: '#fff', flexShrink: 0,
    border: size === 'lg' ? '2px solid rgba(46,111,212,0.4)' : 'none',
  };

  const imgStyle: React.CSSProperties = {
    width: px, height: px, borderRadius: radius,
    objectFit: 'contain', background: 'rgba(13,31,60,0.6)', flexShrink: 0,
    border: size === 'lg' ? '2px solid rgba(46,111,212,0.3)' : 'none',
  };

  // Sem arquivo → iniciais
  if (!arquivo) return <div style={avatarStyle}>{ini}</div>;

  // Monta a lista de caminhos a tentar:
  //   - Se o usuário já digitou extensão (ex: "AFIX.png") → tenta só ela
  //   - Se não digitou → tenta /clientes/AFIX.png, .jpg, .jpeg em sequência
  const tentativas: string[] = temExtensao(arquivo)
    ? [`/clientes/${arquivo}`]
    : EXTS.map(ext => `/clientes/${arquivo}${ext}`);

  // Todas falharam → fallback com iniciais
  if (extIdx >= tentativas.length) {
    return <div style={avatarStyle}>{ini}</div>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={tentativas[extIdx]}
      src={tentativas[extIdx]}
      alt={nome}
      className="client-logo-img"
      onError={() => setExtIdx(i => i + 1)}
      style={imgStyle}
    />
  );
}

/** Barra gradiente horizontal (hero/footer). */
function GradientBar({ height = 4 }: { height?: number }) {
  return (
    <div style={{
      height,
      background: 'linear-gradient(90deg, #0d1f3c 0%, #1a3f80 25%, #2e6fd4 50%, #1a3f80 75%, #0d1f3c 100%)',
    }} />
  );
}

/** Pill estatística no hero. */
function HeroPill({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '5px 14px', borderRadius: '999px',
      border: '1px solid rgba(46,111,212,0.35)',
      background: 'rgba(46,111,212,0.12)',
      color: '#93c5fd', fontSize: '13px', fontWeight: 700,
      letterSpacing: '0.03em', whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}

/** Separador de seção com gradiente + ícone centralizado. */
function SectionDivider({ icon = '⚖' }: { icon?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '0 0 32px' }}>
      <div style={{
        flex: 1, height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(46,111,212,0.45) 100%)',
      }} />
      <span style={{ fontSize: '16px', opacity: 0.6 }}>{icon}</span>
      <div style={{
        flex: 1, height: '1px',
        background: 'linear-gradient(90deg, rgba(46,111,212,0.45) 0%, transparent 100%)',
      }} />
    </div>
  );
}

/** Caixinha de resumo de horas trabalhadas no mês. */
function HorasBox({ horas }: { horas: string }) {
  return (
    <div style={{
      background:    'rgba(46,111,212,0.1)',
      border:        '1px solid rgba(46,111,212,0.25)',
      borderRadius:  '14px',
      padding:       '24px 32px',
      display:       'flex',
      alignItems:    'center',
      gap:           '20px',
      marginBottom:  '32px',
    }}>
      <span style={{ fontSize: '30px', flexShrink: 0, lineHeight: 1 }}>⏱</span>
      <div>
        <div style={{
          fontSize:      '11px',
          fontWeight:    700,
          color:         'rgba(255,255,255,0.45)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          marginBottom:  '6px',
        }}>
          Horas trabalhadas no mês
        </div>
        <div style={{ fontSize: '44px', fontWeight: 900, color: 'white', lineHeight: 1 }}>
          {horas}
        </div>
        <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
          no período de referência
        </div>
      </div>
    </div>
  );
}

/** Card de atividade com número outline + badge + texto + hover. */
function AtividadeCard({ index, texto, horas }: { index: number; texto: string; horas?: string }) {
  const cat = inferirCategoria(texto);
  const num = String(index + 1).padStart(2, '0');
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="act-card"
      style={{
        display: 'flex', gap: '16px', alignItems: 'flex-start',
        background:   hovered ? 'rgba(13,31,60,0.75)' : 'rgba(13,31,60,0.5)',
        border:       '1px solid rgba(255,255,255,0.06)',
        borderLeft:   hovered ? '3px solid #60a5fa' : '3px solid #2e6fd4',
        borderRadius: '10px', padding: '16px 20px', marginBottom: '10px',
        transition:   'background 0.2s, border-left-color 0.2s',
        boxShadow:    hovered ? '0 0 0 1px rgba(46,111,212,0.12), inset 0 0 20px rgba(46,111,212,0.04)' : 'none',
      }}
    >
      {/* Número */}
      <span style={{
        fontSize:   '24px',
        fontWeight: 900,
        color:      '#2e6fd4',
        lineHeight: 1,
        minWidth:   '30px',
        paddingTop: '2px',
        userSelect: 'none',
        flexShrink: 0,
      }}>
        {num}
      </span>

      {/* Conteúdo */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          display: 'inline-block', padding: '2px 10px', borderRadius: '999px',
          background: cat.bg, color: cat.color,
          fontSize: '13px', fontWeight: 700,
          letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '8px',
        }}>
          {cat.label}
        </span>
        <p style={{
          margin: 0, fontSize: '17px', color: 'rgba(255,255,255,0.88)',
          lineHeight: 1.65, fontWeight: 400,
        }}>
          {texto}
        </p>
      </div>

      {/* Badge de horas — exibida somente se informada */}
      {horas && horas.trim() && (
        <span style={{
          background:   'rgba(255,255,255,0.05)',
          border:       '1px solid rgba(96,165,250,0.2)',
          borderRadius: '6px',
          padding:      '3px 10px',
          fontSize:     '15px',
          fontWeight:   700,
          color:        '#60a5fa',
          whiteSpace:   'nowrap',
          flexShrink:   0,
          alignSelf:    'center',
        }}>
          {horas}
        </span>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function RelatorioContent({
  cliente, mes, ano, atividades, logoClienteArquivo, horasTotais, horasAtividades,
}: RelatorioProps) {
  const mesNome = nomeMes(mes);
  const total   = atividades.filter(a => a.trim()).length;
  const periodo = `${mesNome} · ${ano}`;

  const gradientText: React.CSSProperties = {
    color: '#60a5fa',
  };

  // Fundo hero: cor base + glow radial + grid sutil
  const heroBackground: React.CSSProperties = {
    background:      '#060e1f',
    backgroundImage: [
      'radial-gradient(ellipse 120% 80% at 55% -10%, rgba(46,111,212,0.3) 0%, transparent 65%)',
      'linear-gradient(rgba(46,111,212,0.055) 1px, transparent 1px)',
      'linear-gradient(90deg, rgba(46,111,212,0.055) 1px, transparent 1px)',
    ].join(', '),
    backgroundSize: '100% 100%, 36px 36px, 36px 36px',
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#060e1f', color: '#ffffff', position: 'relative' }}>

      {/* Fundo: injetado APENAS na rota /relatorio via CSS no <Head>.
          Não aparece no preview do editor. */}
      <div className="report-wrapper" style={{ position: 'relative', zIndex: 1, margin: 0, padding: 0 }}>

        {/* ══════════════════════════════════════════
            SEÇÃO 1 — HERO / CAPA (página inteira)
            min-height: 297mm = uma página A4 completa.
            page-break-after garante que as atividades
            comecem sempre numa página nova no PDF.
        ══════════════════════════════════════════ */}
        <section
          className="hero-section"
          style={{
            ...heroBackground,
            position:      'relative',
            overflow:      'hidden',
            // Ocupa exatamente uma página A4
            minHeight:     '297mm',
            // Garante nova página após a capa no PDF
            pageBreakAfter: 'always',
            breakAfter:     'page',
            // Layout em coluna com espaço distribuído
            display:        'flex',
            flexDirection:  'column',
            justifyContent: 'space-between',
          }}
        >

          {/* ── Linhas diagonais decorativas em SVG ── */}
          <svg
            aria-hidden="true"
            style={{
              position: 'absolute', top: 0, left: 0,
              width: '100%', height: '100%',
              opacity: 0.04, pointerEvents: 'none',
            }}
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
            viewBox="0 0 794 1123"
          >
            {/* Linhas diagonais que cruzam toda a capa */}
            {Array.from({ length: 36 }, (_, i) => (
              <line
                key={i}
                x1={-400 + i * 55}  y1={0}
                x2={-400 + i * 55 + 700} y2={1123}
                stroke="white" strokeWidth="0.6"
              />
            ))}
          </svg>

          {/* ── Círculos concêntricos grandes atrás do título (centro da capa) ── */}
          <div
            aria-hidden="true"
            style={{
              position:  'absolute',
              top:       '50%', left: '50%',
              transform: 'translate(-50%, -52%)',
              width:     '700px', height: '700px',
              pointerEvents: 'none',
            }}
          >
            {[700, 560, 420, 280, 140].map((d, i) => (
              <div key={i} style={{
                position:     'absolute',
                width:        `${d}px`,
                height:       `${d}px`,
                borderRadius: '50%',
                border:       '1px solid rgba(46,111,212,0.08)',
                top:          '50%', left: '50%',
                transform:    'translate(-50%, -50%)',
              }} />
            ))}
          </div>

          {/* ══ BLOCO TOPO — Logo DRS centralizada ══ */}
          <div style={{
            padding:    '44px 48px 0',
            display:    'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position:   'relative',
            zIndex:     1,
          }}>
            {/* Logo DRS grande e centralizada */}
            <div style={{ marginBottom: '20px' }}>
              <LogoDRS size="lg" align="center" />
            </div>

            {/* Linha divisória sob a logo */}
            <div style={{
              width:      '220px',
              height:     '1px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(46,111,212,0.5) 50%, transparent 100%)',
            }} />
          </div>

          {/* ══ BLOCO CENTRAL — Badge + Cliente + Título + Subtítulo ══ */}
          <div style={{
            flex:           1,
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            textAlign:      'center',
            padding:        '0 48px',
            position:       'relative',
            zIndex:         1,
            gap:            '20px',
          }}>
            {/* Badges centralizados */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              {/* Badge "Relatório Jurídico Mensal" */}
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '6px 16px', borderRadius: '999px',
                border: '1px solid rgba(46,111,212,0.4)',
                background: 'rgba(46,111,212,0.1)',
                color: '#93c5fd', fontSize: '12px', fontWeight: 700,
                letterSpacing: '0.16em', textTransform: 'uppercase',
              }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#2e6fd4', display: 'inline-block' }} />
                Relatório Jurídico Mensal
              </span>

              {/* Badge de credencial */}
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '6px 16px', borderRadius: '8px',
                background: 'rgba(26,63,128,0.25)',
                border: '1px solid rgba(46,111,212,0.3)',
                fontSize: '13px', fontWeight: 700,
                color: 'rgba(255,255,255,0.65)',
                letterSpacing: '0.06em',
              }}>
                <span>⚖️</span>
                Assessoria Jurídica Especializada
              </span>
            </div>

            {/* Logo + nome do cliente */}
            <div style={{
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              gap:            '12px',
              padding:        '20px 32px',
              background:     'rgba(255,255,255,0.03)',
              border:         '1px solid rgba(255,255,255,0.07)',
              borderRadius:   '16px',
              backdropFilter: 'blur(4px)',
            }}>
              <p style={{
                margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.3)',
                fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
              }}>
                Preparado para
              </p>
              {/* Logo grande 80×80 */}
              <LogoCliente arquivo={logoClienteArquivo ?? ''} nome={cliente} size="lg" />
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
                {cliente || 'Nome do Cliente'}
              </span>
            </div>

            {/* Título principal — Relatório + Mês */}
            <div style={{ lineHeight: 1 }}>
              <h1 style={{
                margin: 0, fontSize: '86px', fontWeight: 900,
                letterSpacing: '-0.04em', lineHeight: 0.98,
                color: '#ffffff',
              }}>
                Relatório
              </h1>
              <h2 style={{
                margin: 0, fontSize: '86px', fontWeight: 900,
                letterSpacing: '-0.04em', lineHeight: 0.98,
                ...gradientText,
              }}>
                {mesNome}
              </h2>
            </div>

            {/* Subtítulo */}
            <p style={{
              margin: 0, fontSize: '16px',
              color: 'rgba(255,255,255,0.38)', fontWeight: 400,
              lineHeight: 1.7, maxWidth: '500px',
            }}>
              Acompanhe todas as atividades jurídicas realizadas no período,
              com transparência e clareza.
            </p>
          </div>

          {/* ══ BLOCO INFERIOR — Período + Pills + Barra ══ */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Linha divisória superior */}
            <div style={{
              height:     '1px',
              margin:     '0 48px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(46,111,212,0.35) 50%, transparent 100%)',
              marginBottom: '24px',
            }} />

            {/* Período + Pills centralizados */}
            <div style={{
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              gap:            '14px',
              paddingBottom:  '32px',
              textAlign:      'center',
            }}>
              {/* Período de referência */}
              <div>
                <p style={{
                  margin: 0, fontSize: '11.5px', color: 'rgba(255,255,255,0.28)',
                  fontWeight: 700, letterSpacing: '0.2em',
                  textTransform: 'uppercase', marginBottom: '5px',
                }}>
                  Período de referência
                </p>
                <p style={{
                  margin: 0, fontSize: '20px', fontWeight: 800,
                  color: '#fff', letterSpacing: '-0.01em',
                }}>
                  {periodo}
                </p>
              </div>

              {/* Pills de estatísticas */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <HeroPill>
                  <span style={{ marginRight: '6px', opacity: 0.55 }}>▪</span>
                  {total} {total === 1 ? 'Atividade' : 'Atividades'}
                </HeroPill>
                <HeroPill>
                  <span style={{ marginRight: '6px', color: '#4ade80' }}>✓</span>
                  100% Entregues
                </HeroPill>
              </div>
            </div>

            {/* Barra gradiente na base da capa */}
            <GradientBar height={4} />
          </div>
        </section>

        {/* ══════════════════════════════════════════
            SEÇÃO 2 — CARDS DE ATIVIDADES
        ══════════════════════════════════════════ */}
        <section className="activities-section" style={{ background: '#060e1f', padding: '44px 48px 48px', marginTop: 0 }}>

          {/* Separador de seção */}
          <SectionDivider icon="⚖" />

          {/* Caixinha de horas totais — exibida somente se informadas */}
          {horasTotais && horasTotais.trim() && (
            <HorasBox horas={horasTotais} />
          )}

          {/* Cabeçalho da seção */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <h3 style={{
              margin: 0, fontSize: '15px', fontWeight: 700,
              color: 'rgba(255,255,255,0.38)', letterSpacing: '0.18em',
              textTransform: 'uppercase', whiteSpace: 'nowrap',
            }}>
              Atividades Realizadas
            </h3>
            <div style={{
              flex: 1, height: '1px',
              background: 'linear-gradient(90deg, rgba(46,111,212,0.28) 0%, transparent 100%)',
            }} />
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#2e6fd4', whiteSpace: 'nowrap' }}>
              {total} total
            </span>
          </div>

          {/* Lista de cards com linha do tempo vertical */}
          {total === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.18)', fontSize: '13px' }}>
              Nenhuma atividade adicionada ainda.
            </div>
          ) : (
            <div className="activities-grid" style={{ position: 'relative', paddingLeft: '28px' }}>
              {/* Linha do tempo vertical */}
              <div style={{
                position:   'absolute',
                left:       '10px',
                top:        '18px',
                bottom:     '18px',
                width:      '1px',
                background: 'linear-gradient(180deg, transparent 0%, rgba(46,111,212,0.3) 8%, rgba(46,111,212,0.3) 92%, transparent 100%)',
              }} />

              {atividades.filter(a => a.trim()).map((atividade, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  {/* Dot da linha do tempo */}
                  <div style={{
                    position:     'absolute',
                    left:         '-22px',
                    top:          '20px',
                    width:        '7px',
                    height:       '7px',
                    borderRadius: '50%',
                    background:   '#2e6fd4',
                    border:       '1.5px solid #060e1f',
                    boxShadow:    '0 0 6px rgba(46,111,212,0.5)',
                  }} />
                  <AtividadeCard index={i} texto={atividade} horas={horasAtividades?.[i]} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ══════════════════════════════════════════
            SEÇÃO 3 — FOOTER (3 colunas)
            Ícones reais de /public/Redes/
            Todos os links são <a> clicáveis no PDF.
        ══════════════════════════════════════════ */}
        <footer style={{
          background:  '#0d1f3c',
          borderTop:   '1px solid rgba(46,111,212,0.15)',
          padding:     '40px 48px 0',
        }}>

          {/* Estilos dos links de contato injetados localmente */}
          <style>{`
            .contact-link {
              text-decoration: none;
              color: inherit;
              display: flex;
              align-items: center;
              gap: 10px;
              padding: 10px 14px;
              background: rgba(255,255,255,0.04);
              border: 1px solid rgba(255,255,255,0.07);
              border-radius: 10px;
              margin-bottom: 8px;
              width: 100%;
              box-sizing: border-box;
            }
            .contact-link:hover { opacity: 0.82; }
            .contact-icon {
              width: 36px;
              height: 36px;
              border-radius: 8px;
              object-fit: cover;
              flex-shrink: 0;
            }
            .contact-label {
              font-size: 11px;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.12em;
              font-weight: 700;
              margin-bottom: 2px;
            }
            .contact-value {
              font-size: 14px;
              font-weight: 700;
              color: rgba(255,255,255,0.82);
            }
          `}</style>

          {/* Separador superior */}
          <SectionDivider icon="★" />

          {/* Grade de 3 colunas */}
          <div style={{
            display:             'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap:                 '32px',
            alignItems:          'center',
            paddingBottom:       '32px',
          }}>

            {/* ── Coluna esquerda: Redes sociais e contatos ── */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>

              {/* Instagram */}
              <a
                href="https://instagram.com/drsadvogadosassociados"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-link"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/Redes/instagram.png"
                  alt="Instagram"
                  className="contact-icon"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div>
                  <div className="contact-label">Instagram</div>
                  <div className="contact-value">@drsadvogadosassociados</div>
                </div>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/5561998905050"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-link"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/Redes/whatsapp.png"
                  alt="WhatsApp"
                  className="contact-icon"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div>
                  <div className="contact-label">WhatsApp</div>
                  <div className="contact-value">+55 61 99890-5050</div>
                </div>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com/company/drsadv/"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-link"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/Redes/linkedin.png"
                  alt="LinkedIn"
                  className="contact-icon"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div>
                  <div className="contact-label">LinkedIn</div>
                  <div className="contact-value">DRS Advogados Associados</div>
                </div>
              </a>
            </div>

            {/* ── Coluna central: Logo DRS + agradecimento ── */}
            <div style={{
              textAlign:     'center',
              display:       'flex',
              flexDirection: 'column',
              alignItems:    'center',
              gap:           '12px',
              minWidth:      '180px',
            }}>
              <LogoDRS size="lg" align="center" />
              <div style={{
                width:      '40px',
                height:     '2px',
                background: 'linear-gradient(90deg, transparent, #2e6fd4, transparent)',
              }} />
              <p style={{
                margin:        0,
                fontSize:      '15px',
                fontWeight:    700,
                color:         '#ffffff',
                letterSpacing: '-0.01em',
                textAlign:     'center',
                lineHeight:    1.55,
              }}>
                Obrigado por confiar<br />no nosso trabalho!
              </p>
            </div>

            {/* ── Coluna direita: Site + slogan ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>

              {/* Site — link clicável no PDF */}
              <a
                href="https://www.drsadv.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-link"
                style={{ justifyContent: 'flex-end' }}
              >
                <div style={{ textAlign: 'right' }}>
                  <div className="contact-label">Site</div>
                  <div className="contact-value">www.drsadv.com.br</div>
                </div>
                {/* Globo em SVG inline — sem dependência de arquivo externo */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="36" height="36" viewBox="0 0 36 36"
                  style={{ flexShrink: 0, borderRadius: '8px', background: 'rgba(46,111,212,0.18)' }}
                >
                  <circle cx="18" cy="18" r="10" fill="none" stroke="#2e6fd4" strokeWidth="1.5" />
                  <ellipse cx="18" cy="18" rx="5" ry="10" fill="none" stroke="#2e6fd4" strokeWidth="1.2" />
                  <line x1="8" y1="18" x2="28" y2="18" stroke="#2e6fd4" strokeWidth="1.2" />
                  <line x1="10" y1="13" x2="26" y2="13" stroke="#2e6fd4" strokeWidth="1" />
                  <line x1="10" y1="23" x2="26" y2="23" stroke="#2e6fd4" strokeWidth="1" />
                </svg>
              </a>

              {/* Slogan */}
              <div style={{
                padding:      '12px 16px',
                borderRadius: '10px',
                background:   'rgba(46,111,212,0.08)',
                border:       '1px solid rgba(46,111,212,0.2)',
                textAlign:    'right',
              }}>
                <p style={{
                  margin:        0,
                  fontSize:      '14px',
                  fontWeight:    700,
                  color:         '#93c5fd',
                  lineHeight:    1.6,
                }}>
                  Excelência jurídica<br />em cada detalhe.
                </p>
              </div>
            </div>
          </div>

          {/* Linha divisória antes do copyright */}
          <div style={{
            height:       '1px',
            background:   'linear-gradient(90deg, transparent, rgba(46,111,212,0.25), transparent)',
            marginBottom: '16px',
          }} />

          {/* Copyright */}
          <p style={{
            margin:        0,
            textAlign:     'center',
            fontSize:      '12px',
            color:         'rgba(255,255,255,0.12)',
            letterSpacing: '0.08em',
            paddingBottom: '20px',
          }}>
            © {ano || new Date().getFullYear()} DRS Advogados Associados · Todos os direitos reservados
          </p>

          {/* Barra gradiente base */}
          <GradientBar height={4} />
        </footer>

      </div>{/* /z-index wrapper */}
    </div>
  );
}
