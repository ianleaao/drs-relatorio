/**
 * / — Página principal com painel de edição lateral + prévia do documento
 * (relatório mensal, proposta de honorários ou apresentação de holding).
 * O painel de edição é visível apenas no browser; o PDF é gerado via /api/gerar-pdf.
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import RelatorioContent from '../components/RelatorioContent';
import PropostaContent  from '../components/PropostaContent';
import HoldingContent   from '../components/HoldingContent';

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

const PROP_QUADROS_DEFAULT = [
  {
    titulo: 'O que será identificado nesta sessão',
    itens: [
      'As melhores estratégias de organização patrimonial',
      'Possibilidades de economia tributária',
      'Formas de evitar ou simplificar o inventário',
      'Mecanismos de proteção patrimonial e redução de conflitos familiares',
    ],
  },
];

const PROP_INTRO_DEFAULT =
  'É com satisfação que apresentamos esta proposta de honorários para a Sessão de Viabilidade de Holding. ' +
  'Nessa reunião estratégica, nossa equipe realizará uma análise completa e personalizada do seu perfil patrimonial, ' +
  'identificando as melhores alternativas para a proteção, planejamento e otimização do seu patrimônio.';

const PROP_ENCERRAMENTO_DEFAULT =
  'Ficamos à inteira disposição para esclarecimentos adicionais e para o agendamento da sessão. ' +
  'Será um prazer apresentar soluções que gerem valor real para o seu patrimônio e para a sua família.\n\n' +
  'Atenciosamente,\nEquipe DRS Advogados Associados';

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
  const [atividades,          setAtividades         ] = useState<{ texto: string; horas: string }[]>(
    ATIVIDADES_EXEMPLO.map(t => ({ texto: t, horas: '' }))
  );
  const [horasTotais,         setHorasTotais        ] = useState('');
  const [gerando,             setGerando            ] = useState(false);
  const [erro,                setErro               ] = useState('');

  // Controle de aba
  const [aba, setAba] = useState<'relatorio' | 'proposta' | 'holding'>('relatorio');

  // Estado da holding
  const [holdDestinatario,    setHoldDestinatario   ] = useState('');
  const [holdMostrarCliente,  setHoldMostrarCliente ] = useState(true);
  const [holdLogoCliente,     setHoldLogoCliente    ] = useState('');
  const [holdData,            setHoldData           ] = useState(() => new Date().toISOString().split('T')[0]);

  // Estado da proposta
  const [propDestinatario,     setPropDestinatario    ] = useState('');
  const [propMostrarCliente,   setPropMostrarCliente  ] = useState(true);
  const [propLogoCliente,      setPropLogoCliente     ] = useState('');
  const [propData,             setPropData            ] = useState(() => new Date().toISOString().split('T')[0]);
  const [propTitulo,           setPropTitulo          ] = useState('Proposta de Honorários – Sessão de Viabilidade de Holding');
  const [propIntroducao,       setPropIntroducao      ] = useState(PROP_INTRO_DEFAULT);
  const [propQuadros,          setPropQuadros         ] = useState<{ titulo: string; itens: string[] }[]>(PROP_QUADROS_DEFAULT);
  const [propFormato,          setPropFormato         ] = useState('Reunião mediante agendamento prévio');
  const [propDuracao,          setPropDuracao         ] = useState('Entre 1h30 e 2h');
  // Investimento
  const [propModoInv,          setPropModoInv         ] = useState<'A'|'B'|'C'|'D'|'E'>('A');
  const [propInvValorUnico,    setPropInvValorUnico   ] = useState('R$ 4.500,00');
  const [propInvValorOriginal, setPropInvValorOriginal] = useState('');
  const [propInvDesconto,      setPropInvDesconto     ] = useState('');
  const [propInvValorDesconto, setPropInvValorDesconto] = useState('');
  const [propAutoCalcular,     setPropAutoCalcular    ] = useState(false);
  const [propInvVista,         setPropInvVista        ] = useState('');
  const [propInvParcelas,      setPropInvParcelas     ] = useState('');
  const [propInvValorParcela,  setPropInvValorParcela ] = useState('');
  const [propInvTextoParcela,  setPropInvTextoParcela ] = useState('');
  const [propEncerramento,     setPropEncerramento    ] = useState(PROP_ENCERRAMENTO_DEFAULT);

  // Atividades com conteúdo (para o counter e para o relatório)
  const atividadesPreenchidas = atividades.filter(a => a.texto.trim());

  // Botão "Gerar PDF" bloqueado quando falta o conteúdo mínimo da aba atual
  const faltaConteudo =
    aba === 'relatorio' ? atividadesPreenchidas.length === 0 :
    aba === 'proposta'  ? !propTitulo.trim() :
    false;

  // ── Handlers ────────────────────────────────────────────────────────────────

  const adicionar = () => setAtividades(prev => [...prev, { texto: '', horas: '' }]);

  const remover = (i: number) =>
    setAtividades(prev => prev.filter((_, idx) => idx !== i));

  const atualizar = (i: number, texto: string) =>
    setAtividades(prev => prev.map((a, idx) => (idx === i ? { ...a, texto } : a)));

  const atualizarHoras = (i: number, horas: string) =>
    setAtividades(prev => prev.map((a, idx) => (idx === i ? { ...a, horas } : a)));

  // Handlers dos quadros
  const adicionarQuadro = () =>
    setPropQuadros(prev => [...prev, { titulo: '', itens: [''] }]);
  const removerQuadro = (qi: number) =>
    setPropQuadros(prev => prev.filter((_, i) => i !== qi));
  const atualizarQuadroTitulo = (qi: number, titulo: string) =>
    setPropQuadros(prev => prev.map((q, i) => i === qi ? { ...q, titulo } : q));
  const adicionarItemQuadro = (qi: number) =>
    setPropQuadros(prev => prev.map((q, i) => i === qi ? { ...q, itens: [...q.itens, ''] } : q));
  const removerItemQuadro = (qi: number, ii: number) =>
    setPropQuadros(prev => prev.map((q, i) => i === qi ? { ...q, itens: q.itens.filter((_, j) => j !== ii) } : q));
  const atualizarItemQuadro = (qi: number, ii: number, valor: string) =>
    setPropQuadros(prev => prev.map((q, i) => i === qi ? { ...q, itens: q.itens.map((item, j) => j === ii ? valor : item) } : q));

  // Auto-cálculo do desconto
  useEffect(() => {
    if (!propAutoCalcular) return;
    const raw     = propInvValorOriginal.replace(/[R$\s.]/g, '').replace(',', '.');
    const original = parseFloat(raw) || 0;
    const pct      = parseFloat(propInvDesconto) || 0;
    if (original > 0 && pct > 0) {
      const result = original * (1 - pct / 100);
      setPropInvValorDesconto('R$ ' + result.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    }
  }, [propInvValorOriginal, propInvDesconto, propAutoCalcular]);

  const gerarPDFProposta = async () => {
    setGerando(true);
    setErro('');
    try {
      const res = await fetch('/api/gerar-pdf', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          tipo:               'proposta',
          destinatario:       propDestinatario,
          mostrarCliente:     propMostrarCliente,
          logoCliente:        propLogoCliente,
          data:               formatarData(propData),
          dataISO:            propData,
          titulo:             propTitulo,
          introducao:         propIntroducao,
          quadros:            propQuadros,
          formato:            propFormato,
          duracao:            propDuracao,
          modoInv:            propModoInv,
          invValorUnico:      propInvValorUnico,
          invValorOriginal:   propInvValorOriginal,
          invDesconto:        propInvDesconto,
          invValorDesconto:   propInvValorDesconto,
          invVista:           propInvVista,
          invParcelas:        propInvParcelas,
          invValorParcela:    propInvValorParcela,
          invTextoParcela:    propInvTextoParcela,
          encerramento:       propEncerramento,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || `Erro HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href     = url;
      const [pAno, pMes, pDia] = propData.split('-');
      const dataSlug = `${pDia}-${pMes}-${pAno}`;
      link.download = `Proposta-DRS-${(propDestinatario || 'Cliente').replace(/\s+/g, '-')}-${dataSlug}.pdf`;
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

  const gerarPDFHolding = async () => {
    setGerando(true);
    setErro('');
    try {
      const res = await fetch('/api/gerar-pdf', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          tipo:          'holding',
          destinatario:  holdDestinatario,
          mostrarCliente:holdMostrarCliente,
          logoCliente:   holdLogoCliente,
          dataISO:       holdData,
        }),
      });
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error || `Erro HTTP ${res.status}`); }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const [pA, pM, pD] = holdData.split('-');
      link.href = url;
      link.download = `Holding-DRS-${(holdDestinatario || 'Cliente').replace(/\s+/g, '-')}-${pD}-${pM}-${pA}.pdf`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) { setErro(String(err)); }
    finally { setGerando(false); }
  };

  const gerarPDF = async () => {
    setGerando(true);
    setErro('');
    try {
      const res = await fetch('/api/gerar-pdf', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          cliente,
          mes,
          ano,
          logoClienteArquivo,
          atividades:       atividadesPreenchidas.map(a => a.texto),
          horasAtividades:  atividadesPreenchidas.map(a => a.horas),
          horasTotais,
        }),
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

  // Converte YYYY-MM-DD → "22 de Abril de 2026" para exibição no relatório
  function formatarData(iso: string): string {
    if (!iso) return '';
    const [ano, mes, dia] = iso.split('-');
    const MESES_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    return `${dia} de ${MESES_PT[parseInt(mes, 10) - 1] ?? mes} de ${ano}`;
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <Head>
        <title>DRS Advogados — Gerador de Documentos</title>
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
              Relatórios, propostas e holding
            </p>
          </div>

          {/* Formulário */}
          <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* ── Tabs: Relatório / Proposta / Holding ── */}
            <div style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '4px' }}>
              {(['relatorio', 'proposta', 'holding'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setAba(tab)}
                  style={{
                    flex:         1,
                    background:   aba === tab ? '#2e6fd4' : 'transparent',
                    border:       'none',
                    borderRadius: '7px',
                    color:        aba === tab ? '#ffffff' : 'rgba(255,255,255,0.35)',
                    fontSize:     '11px',
                    fontWeight:   700,
                    padding:      '7px 8px',
                    cursor:       'pointer',
                    fontFamily:   'Inter, sans-serif',
                    transition:   'background 0.18s, color 0.18s',
                  }}
                >
                  {tab === 'relatorio' ? 'Relatório' : tab === 'proposta' ? 'Proposta' : 'Holding'}
                </button>
              ))}
            </div>

            {/* ────────────────────────────────────────
                CAMPOS DO RELATÓRIO
            ──────────────────────────────────────── */}
            {aba === 'relatorio' && (<>

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
                Arquivo em <code style={{ color: '#60a5fa', fontSize: '9px' }}>public/clientes/[nome]</code>
                <br />Aceita <code style={{ color: '#60a5fa', fontSize: '9px' }}>.png</code>, <code style={{ color: '#60a5fa', fontSize: '9px' }}>.jpg</code> e <code style={{ color: '#60a5fa', fontSize: '9px' }}>.jpeg</code>
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

            {/* Campo: Total de Horas no Mês */}
            <div>
              <Label>Total de Horas no Mês</Label>
              <input
                type="text"
                value={horasTotais}
                onChange={e => setHorasTotais(e.target.value)}
                placeholder="Ex: 32h"
                style={{ ...inputBase, maxWidth: '140px' }}
                onFocus={e => (e.target.style.borderColor = '#2e6fd4')}
                onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
              <p style={{
                margin: '5px 0 0', fontSize: '10px',
                color: 'rgba(255,255,255,0.22)', lineHeight: 1.5,
              }}>
                Se vazio, a caixinha não aparece no relatório.
              </p>
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

                    {/* Textarea + horas */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <textarea
                        value={atividade.texto}
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
                      {/* Campo de horas desta demanda */}
                      <input
                        type="text"
                        value={atividade.horas}
                        onChange={e => atualizarHoras(i, e.target.value)}
                        placeholder="Horas (ex: 4h, 2h30)"
                        style={{
                          ...inputBase,
                          fontSize:    '11px',
                          padding:     '5px 10px',
                          color:       '#60a5fa',
                        }}
                        onFocus={e => (e.target.style.borderColor = '#2e6fd4')}
                        onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                      />
                    </div>

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

            </>)} {/* /aba === 'relatorio' */}

            {/* ────────────────────────────────────────
                CAMPOS DA PROPOSTA
            ──────────────────────────────────────── */}
            {aba === 'proposta' && (<>

            {/* Destinatário */}
            <div>
              <Label>Destinatário</Label>
              <input
                type="text"
                value={propDestinatario}
                onChange={e => setPropDestinatario(e.target.value)}
                placeholder="Ex: Prezado Dr. João"
                style={inputBase}
                onFocus={e => (e.target.style.borderColor = '#2e6fd4')}
                onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>

            {/* Toggle: exibir cliente na capa */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={propMostrarCliente}
                onChange={e => setPropMostrarCliente(e.target.checked)}
                style={{ accentColor: '#2e6fd4', width: '15px', height: '15px' }}
              />
              <span style={{ fontSize: '12px', color: propMostrarCliente ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)', fontWeight: 600, transition: 'color 0.2s' }}>
                Exibir bloco "Preparado para" na capa
              </span>
            </label>

            {/* Logo do Cliente */}
            <div>
              <Label>Logo do Cliente (arquivo)</Label>
              <input
                type="text"
                value={propLogoCliente}
                onChange={e => setPropLogoCliente(e.target.value.trim())}
                placeholder="Ex: AFIX  (sem extensão)"
                style={inputBase}
                onFocus={e => (e.target.style.borderColor = '#2e6fd4')}
                onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
              <p style={{ margin: '5px 0 0', fontSize: '10px', color: 'rgba(255,255,255,0.22)', lineHeight: 1.5 }}>
                Arquivo em <code style={{ color: '#60a5fa', fontSize: '9px' }}>public/clientes-relatorio/[nome]</code>
                <br />Aceita <code style={{ color: '#60a5fa', fontSize: '9px' }}>.png</code>, <code style={{ color: '#60a5fa', fontSize: '9px' }}>.jpg</code>, <code style={{ color: '#60a5fa', fontSize: '9px' }}>.jpeg</code>
              </p>
            </div>

            {/* Data */}
            <div>
              <Label>Data da Proposta</Label>
              <input
                type="date"
                value={propData}
                onChange={e => setPropData(e.target.value)}
                style={{
                  ...inputBase,
                  maxWidth:     '180px',
                  colorScheme:  'dark',
                }}
                onFocus={e => (e.target.style.borderColor = '#2e6fd4')}
                onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>

            {/* Título */}
            <div>
              <Label>Título da Proposta</Label>
              <input
                type="text"
                value={propTitulo}
                onChange={e => setPropTitulo(e.target.value)}
                placeholder="Ex: Proposta de Honorários – Holding"
                style={inputBase}
                onFocus={e => (e.target.style.borderColor = '#2e6fd4')}
                onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>

            {/* Introdução */}
            <div>
              <Label>Introdução</Label>
              <textarea
                value={propIntroducao}
                onChange={e => setPropIntroducao(e.target.value)}
                rows={4}
                style={{ ...inputBase, resize: 'vertical', minHeight: '80px', lineHeight: 1.5 }}
                onFocus={e => (e.target.style.borderColor = '#2e6fd4')}
                onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>

            {/* Quadros de conteúdo */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <Label>Quadros de Conteúdo <span style={{ color: '#2e6fd4' }}>({propQuadros.length})</span></Label>
                <button
                  onClick={adicionarQuadro}
                  style={{ background: 'rgba(46,111,212,0.12)', border: '1px solid rgba(46,111,212,0.3)', borderRadius: '6px', color: '#60a5fa', fontSize: '11px', fontWeight: 700, padding: '3px 10px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                >
                  + Quadro
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {propQuadros.map((quadro, qi) => (
                  <div key={qi} style={{ background: 'rgba(46,111,212,0.06)', border: '1px solid rgba(46,111,212,0.18)', borderRadius: '10px', padding: '12px' }}>
                    {/* Header do quadro: título + remover */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', fontWeight: 900, color: '#2e6fd4', opacity: 0.7, minWidth: '22px' }}>
                        Q{qi + 1}
                      </span>
                      <input
                        type="text"
                        value={quadro.titulo}
                        onChange={e => atualizarQuadroTitulo(qi, e.target.value)}
                        placeholder="Título do quadro..."
                        style={{ ...inputBase, flex: 1, fontSize: '12px', padding: '7px 10px' }}
                        onFocus={e => (e.target.style.borderColor = '#2e6fd4')}
                        onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                      />
                      <button
                        onClick={() => removerQuadro(qi)}
                        title="Remover quadro"
                        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: '18px', cursor: 'pointer', padding: '2px', lineHeight: 1, transition: 'color 0.2s', fontFamily: 'Inter, sans-serif' }}
                        onMouseEnter={e => ((e.target as HTMLElement).style.color = '#f87171')}
                        onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.25)')}
                      >×</button>
                    </div>

                    {/* Itens do quadro */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', paddingLeft: '22px' }}>
                      {quadro.itens.map((item, ii) => (
                        <div key={ii} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', color: '#2e6fd4', opacity: 0.6, minWidth: '12px', flexShrink: 0 }}>✦</span>
                          <input
                            type="text"
                            value={item}
                            onChange={e => atualizarItemQuadro(qi, ii, e.target.value)}
                            placeholder={`Item ${ii + 1}...`}
                            style={{ ...inputBase, flex: 1, fontSize: '12px', padding: '5px 9px' }}
                            onFocus={e => (e.target.style.borderColor = '#2e6fd4')}
                            onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                          />
                          <button
                            onClick={() => removerItemQuadro(qi, ii)}
                            title="Remover item"
                            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: '16px', cursor: 'pointer', padding: '2px', lineHeight: 1, fontFamily: 'Inter, sans-serif', transition: 'color 0.2s' }}
                            onMouseEnter={e => ((e.target as HTMLElement).style.color = '#f87171')}
                            onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.2)')}
                          >×</button>
                        </div>
                      ))}
                      <button
                        onClick={() => adicionarItemQuadro(qi)}
                        style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#2e6fd4', fontSize: '11px', fontWeight: 700, cursor: 'pointer', padding: '4px 0', fontFamily: 'Inter, sans-serif', marginTop: '2px' }}
                      >
                        + Item
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formato + Duração (opcionais) */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <Label>Formato</Label>
                <input
                  type="text"
                  value={propFormato}
                  onChange={e => setPropFormato(e.target.value)}
                  placeholder="Ex: Reunião online"
                  style={inputBase}
                  onFocus={e => (e.target.style.borderColor = '#2e6fd4')}
                  onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Label>Duração</Label>
                <input
                  type="text"
                  value={propDuracao}
                  onChange={e => setPropDuracao(e.target.value)}
                  placeholder="Ex: 1h30"
                  style={inputBase}
                  onFocus={e => (e.target.style.borderColor = '#2e6fd4')}
                  onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>
            </div>

            {/* Investimento */}
            <div>
              <Label>Modo de Investimento</Label>
              {/* Seletor de modo */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '12px' }}>
                {([
                  { v: 'A', label: 'Valor único simples' },
                  { v: 'E', label: 'Valor mensal' },
                  { v: 'B', label: 'Com desconto à vista' },
                  { v: 'C', label: 'À vista + parcelado' },
                  { v: 'D', label: 'Desconto + parcelamento' },
                ] as const).map(({ v, label }) => (
                  <label key={v} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="radio" name="modoInv" value={v} checked={propModoInv === v} onChange={() => setPropModoInv(v)} style={{ accentColor: '#2e6fd4' }} />
                    <span style={{ fontSize: '11px', fontWeight: propModoInv === v ? 700 : 400, color: propModoInv === v ? '#60a5fa' : 'rgba(255,255,255,0.4)' }}>
                      {label}
                    </span>
                  </label>
                ))}
              </div>

              {/* Modo A */}
              {(propModoInv === 'A' || propModoInv === 'E') && (
                <input type="text" value={propInvValorUnico} onChange={e => setPropInvValorUnico(e.target.value)}
                  placeholder={propModoInv === 'E' ? 'Ex: R$ 4.500,00 (mensal)' : 'Ex: R$ 4.500,00'} style={inputBase}
                  onFocus={e => (e.target.style.borderColor = '#2e6fd4')} onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
              )}

              {/* Modo B ou D — campos de desconto */}
              {(propModoInv === 'B' || propModoInv === 'D') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: propModoInv === 'D' ? '8px' : '0' }}>
                  <input type="text" value={propInvValorOriginal} onChange={e => setPropInvValorOriginal(e.target.value)}
                    placeholder="Valor original  (ex: R$ 2.000,00)" style={inputBase}
                    onFocus={e => (e.target.style.borderColor = '#2e6fd4')} onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="text" value={propInvDesconto} onChange={e => setPropInvDesconto(e.target.value)}
                      placeholder="Desconto %" style={{ ...inputBase, maxWidth: '80px' }}
                      onFocus={e => (e.target.style.borderColor = '#2e6fd4')} onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      <input type="checkbox" checked={propAutoCalcular} onChange={e => setPropAutoCalcular(e.target.checked)} style={{ accentColor: '#2e6fd4' }} />
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Auto</span>
                    </label>
                  </div>
                  <input type="text" value={propInvValorDesconto} onChange={e => setPropInvValorDesconto(e.target.value)}
                    placeholder="Valor com desconto  (ex: R$ 1.600,00)"
                    disabled={propAutoCalcular}
                    style={{ ...inputBase, opacity: propAutoCalcular ? 0.55 : 1 }}
                    onFocus={e => (e.target.style.borderColor = '#2e6fd4')} onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
                </div>
              )}

              {/* Modo C — valor à vista */}
              {propModoInv === 'C' && (
                <input type="text" value={propInvVista} onChange={e => setPropInvVista(e.target.value)}
                  placeholder="Valor à vista  (ex: R$ 6.000,00)" style={{ ...inputBase, marginBottom: '6px' }}
                  onFocus={e => (e.target.style.borderColor = '#2e6fd4')} onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
              )}

              {/* Modo C ou D — parcelamento */}
              {(propModoInv === 'C' || propModoInv === 'D') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" value={propInvParcelas} onChange={e => setPropInvParcelas(e.target.value)}
                      placeholder="Nº" style={{ ...inputBase, maxWidth: '56px' }}
                      onFocus={e => (e.target.style.borderColor = '#2e6fd4')} onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
                    <input type="text" value={propInvValorParcela} onChange={e => setPropInvValorParcela(e.target.value)}
                      placeholder="Valor da parcela" style={{ ...inputBase, flex: 1 }}
                      onFocus={e => (e.target.style.borderColor = '#2e6fd4')} onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
                  </div>
                  <input type="text" value={propInvTextoParcela} onChange={e => setPropInvTextoParcela(e.target.value)}
                    placeholder="Obs. opcional  (ex: sem juros)" style={inputBase}
                    onFocus={e => (e.target.style.borderColor = '#2e6fd4')} onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
                </div>
              )}
            </div>

            {/* Encerramento */}
            <div>
              <Label>Encerramento</Label>
              <textarea
                value={propEncerramento}
                onChange={e => setPropEncerramento(e.target.value)}
                rows={4}
                style={{ ...inputBase, resize: 'vertical', minHeight: '80px', lineHeight: 1.5 }}
                onFocus={e => (e.target.style.borderColor = '#2e6fd4')}
                onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>

            </>)} {/* /aba === 'proposta' */}

            {/* ────────────────────────────────────────
                CAMPOS DA HOLDING
            ──────────────────────────────────────── */}
            {aba === 'holding' && (<>

            {/* Destinatário */}
            <div>
              <Label>Destinatário</Label>
              <input type="text" value={holdDestinatario} onChange={e => setHoldDestinatario(e.target.value)} placeholder="Ex: Dr. João Silva" style={inputBase} onFocus={e => (e.target.style.borderColor = '#2e6fd4')} onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
            </div>

            {/* Toggle cliente */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={holdMostrarCliente} onChange={e => setHoldMostrarCliente(e.target.checked)} style={{ accentColor: '#2e6fd4', width: '15px', height: '15px' }} />
              <span style={{ fontSize: '12px', color: holdMostrarCliente ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)', fontWeight: 600, transition: 'color 0.2s' }}>
                Exibir bloco "Preparado para" na capa
              </span>
            </label>

            {/* Logo */}
            <div>
              <Label>Logo do Cliente (arquivo)</Label>
              <input type="text" value={holdLogoCliente} onChange={e => setHoldLogoCliente(e.target.value.trim())} placeholder="Ex: AFIX  (sem extensão)" style={inputBase} onFocus={e => (e.target.style.borderColor = '#2e6fd4')} onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
              <p style={{ margin: '5px 0 0', fontSize: '10px', color: 'rgba(255,255,255,0.22)', lineHeight: 1.5 }}>
                Arquivo em <code style={{ color: '#60a5fa', fontSize: '9px' }}>public/clientes-relatorio/[nome]</code>
              </p>
            </div>

            </>)} {/* /aba === 'holding' */}

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
              onClick={aba === 'relatorio' ? gerarPDF : aba === 'proposta' ? gerarPDFProposta : gerarPDFHolding}
              disabled={gerando || faltaConteudo}
              style={{
                width:          '100%',
                background:     gerando ? 'rgba(46,111,212,0.5)' : '#2e6fd4',
                border:         'none',
                borderRadius:   '10px',
                color:          '#ffffff',
                fontSize:       '13px',
                fontWeight:     700,
                padding:        '13px 20px',
                cursor:         gerando || faltaConteudo ? 'not-allowed' : 'pointer',
                fontFamily:     'Inter, sans-serif',
                opacity:        faltaConteudo ? 0.5 : 1,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            '8px',
                transition:     'background 0.2s',
              }}
              onMouseEnter={e => {
                if (!gerando && !faltaConteudo)
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
                  {aba === 'relatorio' ? 'Gerar Relatório PDF' : aba === 'proposta' ? 'Gerar Proposta PDF' : 'Gerar Holding PDF'}
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
            {aba === 'relatorio' ? (
              <RelatorioContent
                cliente={cliente}
                mes={mes}
                ano={ano}
                atividades={atividadesPreenchidas.map(a => a.texto)}
                logoClienteArquivo={logoClienteArquivo}
                horasTotais={horasTotais}
                horasAtividades={atividadesPreenchidas.map(a => a.horas)}
              />
            ) : aba === 'holding' ? (
              <HoldingContent
                destinatario={holdDestinatario}
                logoClienteArquivo={holdLogoCliente}
                mostrarCliente={holdMostrarCliente}
              />
            ) : (
              <PropostaContent
                destinatario={propDestinatario}
                mostrarCliente={propMostrarCliente}
                logoClienteArquivo={propLogoCliente}
                data={formatarData(propData)}
                titulo={propTitulo}
                introducao={propIntroducao}
                quadros={propQuadros}
                formato={propFormato}
                duracao={propDuracao}
                modoInvestimento={propModoInv}
                invValorUnico={propInvValorUnico}
                invValorOriginal={propInvValorOriginal}
                invDesconto={propInvDesconto}
                invValorDesconto={propInvValorDesconto}
                invVista={propInvVista}
                invParcelas={propInvParcelas}
                invValorParcela={propInvValorParcela}
                invTextoParcela={propInvTextoParcela}
                encerramento={propEncerramento}
              />
            )}
          </div>
        </main>
      </div>
    </>
  );
}
