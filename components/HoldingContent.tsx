'use client';
import { useState, useEffect } from 'react';
import LogoDRS from './LogoDRS';

export interface HoldingProps {
  destinatario:        string;
  logoClienteArquivo?: string;
  mostrarCliente?:     boolean;
  data?:               string;
  teamPhotos?:         Record<string, string>;
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function GradientBar({ height = 4 }: { height?: number }) {
  return <div style={{ height, background: 'linear-gradient(90deg, #0d1f3c 0%, #1a3f80 25%, #2e6fd4 50%, #1a3f80 75%, #0d1f3c 100%)' }} />;
}

function SectionDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '0 0 24px' }}>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(46,111,212,0.45))' }} />
      <span style={{ fontSize: '14px', opacity: 0.5 }}>⚖</span>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(46,111,212,0.45), transparent)' }} />
    </div>
  );
}

const EXTS_H = ['.png', '.jpg', '.jpeg'] as const;
function temExt(n: string) { return /\.[a-zA-Z]{2,5}$/.test(n); }
function iniciais(n: string) { return n.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase() || 'C'; }

function LogoClienteH({ arquivo, nome, size = 'sm' }: { arquivo: string; nome: string; size?: 'sm' | 'lg' }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => { setIdx(0); }, [arquivo]);
  const px = size === 'lg' ? '80px' : '36px';
  const radius = size === 'lg' ? '16px' : '8px';
  const fz = size === 'lg' ? '28px' : '13px';
  const border = size === 'lg' ? '2px solid rgba(46,111,212,0.4)' : 'none';
  const avatar: React.CSSProperties = { width: px, height: px, borderRadius: radius, background: 'linear-gradient(135deg, #1a3f80, #2e6fd4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fz, fontWeight: 900, color: '#fff', flexShrink: 0, border };
  if (!arquivo) return <div style={avatar}>{iniciais(nome)}</div>;
  const paths = temExt(arquivo) ? [`/clientes-relatorio/${arquivo}`] : EXTS_H.map(e => `/clientes-relatorio/${arquivo}${e}`);
  if (idx >= paths.length) return <div style={avatar}>{iniciais(nome)}</div>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img key={paths[idx]} src={paths[idx]} alt={nome} className="client-logo-img" onError={() => setIdx(i => i + 1)} style={{ width: px, height: px, borderRadius: radius, objectFit: 'contain', background: 'rgba(13,31,60,0.6)', flexShrink: 0, border }} />;
}

const EQUIPE_H = [
  { arquivo: 'daniel',  nome: 'Dr. Daniel Martins',  oab: 'OAB/DF 36.203', cargo: 'Fundador & CEO',  cor: '#6ee7b7', borda: '#34d399', glow: 'rgba(52,211,153,0.10)',   bio: 'Formado em Direito desde 2009 e Advogado há 16 anos. Especialista na área Civil e Penal. Trabalhou em grandes escritórios de advocacia do país. Fundador da DRS Advogados Associados. Referência em consultoria jurídica estratégica para empresas.' },
  { arquivo: 'douglas', nome: 'Dr. Douglas Santos',  oab: 'OAB/DF 55.068', cargo: 'Advogado',        cor: '#60a5fa', borda: '#2e6fd4', glow: 'rgba(46,111,212,0.10)',   bio: 'Advogado desde 2017 e atuante na área jurídica há 17 anos. Trabalhou em Órgãos Públicos, Escritórios de Advocacia, Empresas Privadas e Sistema S. Hoje é Advogado da DRS e Professor Universitário de Direito da Faculdade Mauá-GO. Possui quatro Especializações e atualmente cursa Mestrado em Estudos Jurídicos Avançados na Universidad Européa del Atlântico – Espanha.' },
  { arquivo: 'laila',   nome: 'Dra. Laila Araújo',   oab: 'OAB/DF 62.421', cargo: 'Advogada',        cor: '#c4b5fd', borda: '#a78bfa', glow: 'rgba(167,139,250,0.10)', bio: 'Advogada atuante em Direito das Famílias, Inventários e Planejamento Patrimonial por meio de Holding Familiar. Especialista em Direito Público, Civil e Processo Civil pela Escola da Magistratura do DF. MBA em Holding, Planejamento Societário e Sucessório pela EBPÓS. Professora e coordenadora do curso de Direito da Faculdade Mauá (GO). Mestranda em Direito do Trabalho pelo UDF.' },
];

// ─── Componente principal ─────────────────────────────────────────────────────

export default function HoldingContent({ destinatario, logoClienteArquivo, mostrarCliente = true, teamPhotos }: HoldingProps) {
  const [fotos, setFotos] = useState<Record<string, string>>(teamPhotos ?? {});
  useEffect(() => {
    if (teamPhotos && Object.keys(teamPhotos).length >= 3) { setFotos(teamPhotos); return; }
    Promise.all(['daniel', 'douglas', 'laila'].map(nome =>
      fetch(`/api/foto-pessoa?nome=${nome}`)
        .then(r => r.json())
        .then((d: { src: string | null }) => [nome, d.src] as const)
        .catch(() => [nome, null] as const)
    )).then(pairs => {
      const acc: Record<string, string> = {};
      pairs.forEach(([nome, src]) => { if (src) acc[nome] = src; });
      setFotos(acc);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const heroBg: React.CSSProperties = {
    background: '#060e1f',
    backgroundImage: [
      'radial-gradient(ellipse 120% 80% at 55% -10%, rgba(46,111,212,0.3) 0%, transparent 65%)',
      'linear-gradient(rgba(46,111,212,0.055) 1px, transparent 1px)',
      'linear-gradient(90deg, rgba(46,111,212,0.055) 1px, transparent 1px)',
    ].join(', '),
    backgroundSize: '100% 100%, 36px 36px, 36px 36px',
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#060e1f', color: '#fff' }}>
      <div className="report-wrapper">

        {/* ═══ PÁGINA 1 — CAPA ═══════════════════════════════════════════════ */}
        <section className="hero-section" style={{ ...heroBg, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <svg aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.04, pointerEvents: 'none' }} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" viewBox="0 0 794 1123">
            {Array.from({ length: 36 }, (_, i) => <line key={i} x1={-400 + i * 55} y1={0} x2={-400 + i * 55 + 700} y2={1123} stroke="white" strokeWidth="0.6" />)}
          </svg>
          <div aria-hidden="true" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -52%)', width: '700px', height: '700px', pointerEvents: 'none' }}>
            {[700, 560, 420, 280, 140].map((d, i) => <div key={i} style={{ position: 'absolute', width: `${d}px`, height: `${d}px`, borderRadius: '50%', border: '1px solid rgba(46,111,212,0.08)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />)}
          </div>

          <div style={{ padding: '44px 48px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ marginBottom: '20px' }}><LogoDRS size="lg" align="center" /></div>
            <div style={{ width: '220px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(46,111,212,0.5), transparent)' }} />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 48px', position: 'relative', zIndex: 1, gap: '24px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '999px', border: '1px solid rgba(46,111,212,0.4)', background: 'rgba(46,111,212,0.1)', color: '#93c5fd', fontSize: '12px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#2e6fd4', display: 'inline-block' }} />
              Planejamento Patrimonial
            </span>
            <h1 style={{ margin: 0, fontSize: '66px', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.08, color: '#60a5fa', textAlign: 'center', width: '100%' }}>
              Estruturação de Holding
            </h1>
            {mostrarCliente && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '20px 32px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px' }}>
                <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase' }}>Preparado para</p>
                <LogoClienteH arquivo={logoClienteArquivo ?? ''} nome={destinatario || 'Cliente'} size="lg" />
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>{destinatario || 'Cliente'}</span>
              </div>
            )}
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ height: '1px', margin: '0 48px', background: 'linear-gradient(90deg, transparent, rgba(46,111,212,0.35), transparent)', marginBottom: '24px' }} />
            <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '32px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '999px', border: '1px solid rgba(46,111,212,0.35)', background: 'rgba(46,111,212,0.12)', color: '#93c5fd', fontSize: '11px', fontWeight: 700 }}>
                ⚖️ Assessoria Jurídica Especializada
              </span>
            </div>
            <GradientBar height={4} />
          </div>
        </section>

        {/* ─── quebra de página ─── */}
        <div className="page-break" />

        {/* ═══ PÁGINA 2 — O QUE É + VANTAGENS ═══════════════════════════════ */}
        <section className="page-section" style={{ background: '#060e1f', padding: '28px 48px' }}>
          <SectionDivider />

          {/* O que é */}
          <h2 style={{ margin: '0 0 10px', fontSize: '34px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', textAlign: 'center' }}>O que é uma Holding?</h2>
          <p style={{ margin: '0 0 18px', fontSize: '18px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, textAlign: 'justify' }}>
            Holding é uma empresa criada para administrar bens, participações societárias e patrimônio de uma pessoa, família ou grupo empresarial. Seu principal objetivo é centralizar a gestão patrimonial e societária, trazendo mais segurança, controle e eficiência.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '28px' }}>
            {[
              { titulo: 'Pode ser utilizada para:', itens: ['Proteção patrimonial', 'Planejamento sucessório', 'Organização societária', 'Melhor governança dos bens e empresas'] },
              { titulo: '✅ Principais finalidades:', itens: ['Separar o patrimônio da pessoa física', 'Facilitar a administração de imóveis, investimentos e empresas', 'Reduzir conflitos familiares e societários', 'Planejar a sucessão de forma estruturada'] },
            ].map(({ titulo, itens }) => (
              <div key={titulo} className="content-box" style={{ background: 'rgba(46,111,212,0.08)', border: '1px solid rgba(46,111,212,0.25)', borderRadius: '12px', padding: '18px 20px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>{titulo}</h4>
                {itens.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ color: '#2e6fd4', fontSize: '15px', flexShrink: 0, lineHeight: 1.6 }}>✦</span>
                    <span style={{ fontSize: '17px', color: 'rgba(255,255,255,0.82)', lineHeight: 1.6 }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Divisor visual */}
          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(46,111,212,0.35), transparent)', marginBottom: '24px' }} />

          {/* Vantagens */}
          <h2 style={{ margin: '0 0 4px', fontSize: '32px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', textAlign: 'center' }}>Vantagens da Holding</h2>
          <p style={{ margin: '0 0 16px', fontSize: '15px', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>Benefícios estratégicos para o seu patrimônio</p>
          <div className="vantagens-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'stretch' }}>
            {[
              { icon: '🔒', titulo: 'Proteção Patrimonial',    cor: '#60a5fa', itens: ['Maior organização dos bens', 'Definição mais clara de propriedade e administração', 'Estrutura jurídica mais segura'] },
              { icon: '👨‍👩‍👧‍👦', titulo: 'Planejamento Sucessório', cor: '#6ee7b7', itens: ['Facilita a transferência de bens aos herdeiros', 'Pode reduzir burocracias', 'Ajuda a evitar conflitos familiares'] },
              { icon: '📈', titulo: 'Eficiência na Gestão',    cor: '#c4b5fd', itens: ['Centralização do controle patrimonial', 'Melhor acompanhamento dos ativos', 'Regras claras de administração'] },
              { icon: '💰', titulo: 'Planejamento Tributário', cor: '#fbbf24', itens: ['Dependendo da estrutura pode haver ganhos de eficiência tributária', 'Necessária análise individualizada'] },
            ].map(({ icon, titulo, cor, itens }) => (
              <div key={titulo} className="vantagem-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ fontSize: '20px', marginBottom: '8px' }}>{icon}</div>
                <p style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 800, color: cor }}>{titulo}</p>
                {itens.map((item, i) => (
                  <div key={i} style={{ position: 'relative', paddingLeft: '12px', marginBottom: '6px' }}>
                    <span style={{ position: 'absolute', left: 0, color: '#60a5fa', fontWeight: 700 }}>·</span>
                    <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '28px' }}><GradientBar height={3} /></div>
        </section>

        {/* ─── quebra de página ─── */}
        <div className="page-break" />

        {/* ═══ PÁGINA 3 — COMO FUNCIONA ══════════════════════════════════════ */}
        <section className="page-section" style={{ background: '#060e1f', padding: '28px 48px' }}>
          <SectionDivider />
          <h2 style={{ margin: '0 0 8px', fontSize: '36px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', textAlign: 'center' }}>Como funciona a Estruturação</h2>
          <p style={{ margin: '0 0 6px', fontSize: '17px', color: 'rgba(255,255,255,0.45)', textAlign: 'center' }}>Etapas do projeto</p>
          <p style={{ margin: '0 0 28px', fontSize: '17px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, textAlign: 'justify' }}>
            A estruturação de uma Holding é um processo personalizado e criterioso. Cada etapa é conduzida por especialistas que analisam o seu perfil patrimonial para entregar a solução mais adequada.
          </p>

          {/* Pills de destaque */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'nowrap', marginBottom: '36px' }}>
            {[
              { icon: '📋', label: '3 etapas estruturadas' },
              { icon: '🎯', label: 'Processo 100% personalizado' },
              { icon: '⚖️', label: 'Equipe jurídica especializada' },
            ].map(({ icon, label }) => (
              <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '999px', border: '1px solid rgba(46,111,212,0.3)', background: 'rgba(46,111,212,0.08)', color: 'rgba(255,255,255,0.75)', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                <span>{icon}</span> {label}
              </span>
            ))}
          </div>

          {/* Timeline */}
          <div style={{ position: 'relative', paddingLeft: '60px' }}>
            <div style={{ position: 'absolute', left: '18px', top: '20px', bottom: '80px', width: '2px', background: 'linear-gradient(180deg, #2e6fd4, rgba(46,111,212,0.15))' }} />

            <div className="timeline-step" style={{ position: 'relative', marginBottom: '40px' }}>
              <div style={{ position: 'absolute', left: '-50px', top: '2px', width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(46,111,212,0.2)', border: '2px solid #2e6fd4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 900, color: '#60a5fa' }}>01</div>
              <h3 style={{ margin: '0 0 8px', fontSize: '21px', fontWeight: 800, color: '#fff' }}>Reunião Prévia</h3>
              <p style={{ margin: 0, fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, textAlign: 'justify' }}>
                Compreensão completa do caso, dos objetivos de vida e do perfil patrimonial do cliente. Identificação das principais necessidades e definição do escopo do projeto.
              </p>
            </div>

            <div className="timeline-step" style={{ position: 'relative', marginBottom: '40px' }}>
              <div style={{ position: 'absolute', left: '-50px', top: '2px', width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(46,111,212,0.2)', border: '2px solid #2e6fd4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 900, color: '#60a5fa' }}>02</div>
              <h3 style={{ margin: '0 0 12px', fontSize: '21px', fontWeight: 800, color: '#fff' }}>Sessão de Viabilidade da Holding</h3>
              {['Diagnóstico patrimonial e societário', 'Levantamento dos bens, empresas e objetivos', 'Estudo jurídico e tributário', 'Definição do modelo mais adequado'].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ color: '#2e6fd4', fontSize: '15px', flexShrink: 0 }}>✦</span>
                  <span style={{ fontSize: '17px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.65 }}>{item}</span>
                </div>
              ))}
            </div>

            <div className="timeline-step" style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-50px', top: '2px', width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(46,111,212,0.2)', border: '2px solid rgba(46,111,212,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 900, color: 'rgba(96,165,250,0.7)' }}>03</div>
              <h3 style={{ margin: '0 0 12px', fontSize: '21px', fontWeight: 800, color: '#fff' }}>Constituição da Holding</h3>
              {['Elaboração do contrato social', 'Integralização dos bens', 'Definição de regras de administração', 'Planejamento sucessório e cláusulas de proteção'].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ color: 'rgba(46,111,212,0.6)', fontSize: '15px', flexShrink: 0 }}>✦</span>
                  <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resultado esperado */}
          <div className="content-box" style={{ background: 'rgba(46,111,212,0.08)', border: '1px solid rgba(46,111,212,0.25)', borderRadius: '14px', padding: '26px 32px', marginTop: '40px' }}>
            <p style={{ margin: '0 0 16px', fontSize: '17px', fontWeight: 800, color: '#60a5fa' }}>🎯 Resultado esperado ao final do processo</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {['Patrimônio mais organizado e protegido', 'Sucessão familiar planejada com segurança', 'Maior segurança jurídica em cada etapa', 'Estrutura eficiente para gestão e crescimento'].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: '#2e6fd4', fontSize: '15px', flexShrink: 0 }}>✦</span>
                  <span style={{ fontSize: '17px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.65 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '28px' }}><GradientBar height={3} /></div>
        </section>

        {/* ═══ EQUIPE + FOOTER — página nova, fluxo contínuo ═══════ */}
        <section className="page-section" style={{ background: '#060e1f', padding: '28px 48px 0', pageBreakBefore: 'always', breakBefore: 'page' }}>
          <SectionDivider />

          {/* Cabeçalho equipe */}
          <div style={{ marginBottom: '24px' }}>
            <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '8px', textAlign: 'center' }}>Nossa Equipe</span>
            <h2 style={{ margin: '0 0 8px', fontSize: '34px', fontWeight: 900, color: '#fff', letterSpacing: '-0.8px', textAlign: 'center' }}>
              Quem estará <span style={{ color: '#60a5fa' }}>ao seu lado</span>
            </h2>
            <p style={{ margin: 0, fontSize: '15px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, textAlign: 'center' }}>
              Profissionais especializados, com trajetória sólida e comprometimento total com o seu caso.
            </p>
          </div>

          {/* Cards da equipe */}
          {EQUIPE_H.map(({ arquivo, nome, oab, cargo, cor, borda, glow, bio }) => (
            <div key={arquivo} className="team-card" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderLeft: `3px solid ${borda}`, borderRadius: '12px', padding: '18px 20px', marginBottom: '12px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 0% 50%, ${glow} 0%, transparent 55%)`, pointerEvents: 'none' }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={`team-photo team-photo-${arquivo}`} src={fotos[arquivo] || ''} alt={nome} style={{ width: '88px', height: '100px', borderRadius: '10px', objectFit: 'cover', objectPosition: 'top center', flexShrink: 0, border: '2px solid rgba(255,255,255,0.08)', position: 'relative', zIndex: 1, display: 'block' }} />
              <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                <p style={{ margin: '0 0 2px', fontSize: '18px', fontWeight: 900, color: cor }}>{nome}</p>
                <p style={{ margin: '0 0 2px', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{cargo}</p>
                <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.8px' }}>{oab}</p>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '8px' }} />
                <p style={{ margin: 0, fontSize: '14.5px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, textAlign: 'justify' }}>{bio}</p>
              </div>
            </div>
          ))}

          {/* Footer — sem nenhuma quebra antes */}
          <footer style={{ background: 'transparent', borderTop: '1px solid rgba(46,111,212,0.15)', paddingTop: '24px', marginTop: '8px' }}>
            <style>{`
              .hcl { text-decoration:none; color:inherit; display:flex; align-items:center; gap:8px; padding:9px 12px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07); border-radius:8px; margin-bottom:6px; width:100%; box-sizing:border-box; }
              .hcl:hover { opacity:0.82; }
              .hci { width:32px; height:32px; border-radius:6px; object-fit:cover; flex-shrink:0; }
              .hclabel { font-size:10px; color:#64748b; text-transform:uppercase; letter-spacing:0.1em; font-weight:700; margin-bottom:1px; }
              .hcvalue { font-size:13px; font-weight:700; color:rgba(255,255,255,0.82); }
            `}</style>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(46,111,212,0.3))' }} />
              <span style={{ fontSize: '12px', opacity: 0.4 }}>★</span>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(46,111,212,0.3), transparent)' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '24px', alignItems: 'center', paddingBottom: '16px' }}>
              <div>
                <a href="https://instagram.com/drsadvogadosassociados" target="_blank" rel="noopener noreferrer" className="hcl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/Redes/instagram.png" alt="Instagram" className="hci" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <div><div className="hclabel">Instagram</div><div className="hcvalue">@drsadvogadosassociados</div></div>
                </a>
                <a href="https://wa.me/5561998909393" target="_blank" rel="noopener noreferrer" className="hcl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/Redes/whatsapp.png" alt="WhatsApp" className="hci" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <div><div className="hclabel">WhatsApp</div><div className="hcvalue">61 99890-9393</div></div>
                </a>
                <a href="https://linkedin.com/company/drsadv/" target="_blank" rel="noopener noreferrer" className="hcl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/Redes/linkedin.png" alt="LinkedIn" className="hci" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <div><div className="hclabel">LinkedIn</div><div className="hcvalue">DRS Advogados Associados</div></div>
                </a>
              </div>
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '160px' }}>
                <LogoDRS size="md" align="center" />
                <div style={{ width: '32px', height: '2px', background: 'linear-gradient(90deg, transparent, #2e6fd4, transparent)' }} />
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#93c5fd', textAlign: 'center', lineHeight: 1.4 }}>Assessoria Jurídica<br />Especializada</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                <a href="https://www.drsadv.com.br" target="_blank" rel="noopener noreferrer" className="hcl" style={{ justifyContent: 'flex-end' }}>
                  <div style={{ textAlign: 'right' }}><div className="hclabel">Site</div><div className="hcvalue">www.drsadv.com.br</div></div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 36 36" style={{ flexShrink: 0, borderRadius: '6px', background: 'rgba(46,111,212,0.18)' }}>
                    <circle cx="18" cy="18" r="10" fill="none" stroke="#2e6fd4" strokeWidth="1.5" />
                    <ellipse cx="18" cy="18" rx="5" ry="10" fill="none" stroke="#2e6fd4" strokeWidth="1.2" />
                    <line x1="8" y1="18" x2="28" y2="18" stroke="#2e6fd4" strokeWidth="1.2" />
                    <line x1="10" y1="13" x2="26" y2="13" stroke="#2e6fd4" strokeWidth="1" />
                    <line x1="10" y1="23" x2="26" y2="23" stroke="#2e6fd4" strokeWidth="1" />
                  </svg>
                </a>
                <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(46,111,212,0.08)', border: '1px solid rgba(46,111,212,0.2)', textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#93c5fd', lineHeight: 1.4 }}>Excelência jurídica<br />em cada detalhe.</p>
                </div>
              </div>
            </div>

            <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(46,111,212,0.2), transparent)', marginBottom: '10px' }} />
            <p style={{ margin: 0, textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.1)', letterSpacing: '0.08em', paddingBottom: '12px' }}>
              © {new Date().getFullYear()} DRS Advogados Associados · Todos os direitos reservados
            </p>
            <GradientBar height={4} />
          </footer>
        </section>

      </div>
    </div>
  );
}
