import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Minus, Trash2, Clock, Zap, MoreVertical, 
  LogOut, User, Gift, X, Check, CreditCard, Banknote, 
  Receipt, Building, ShieldCheck, Tag, ArrowLeft, Loader2
} from 'lucide-react';
import { bimeApi, value4uApi, config } from './services/api';

export default function App() {
  // Estado da Venda
  const [caixaNumero] = useState('115');
  const [vendedor] = useState({ codigo: '2000', nome: 'CLAYTON BUZINHANI' });
  const [cliente, setCliente] = useState({ codigo: 0, nome: 'CONSUMIDOR FINAL', documento: '' });
  const [itens, setItens] = useState([
    { codigo: '1999', descricao: 'FORD F-75 - 1966', quantidade: 1, valorUnitario: 100.00, desconto: 0 }
  ]);
  const [descontoGlobal, setDescontoGlobal] = useState({ tipo: 'fixo', valor: 0 });
  const [pagamentos, setPagamentos] = useState([]);
  
  // Estado da Integração Value4u
  const [value4uCodigo, setValue4uCodigo] = useState('');
  const [value4uDados, setValue4uDados] = useState(null);
  const [loadingValue4u, setLoadingValue4u] = useState(false);

  // Estados dos Modais
  const [modalConsumidorAberto, setModalConsumidorAberto] = useState(false);
  const [modalDescontoAberto, setModalDescontoAberto] = useState(false);
  const [modalPagamentoAberto, setModalPagamentoAberto] = useState(false);
  const [modalConfigAberto, setModalConfigAberto] = useState(false);
  const [menuMaisOpcoes, setMenuMaisOpcoes] = useState(false);

  // Estados dos Formulários Temporários nos Modais
  const [tempCpf, setTempCpf] = useState('');
  const [tempNome, setTempNome] = useState('CONSUMIDOR FINAL');
  const [tempTipoDesconto, setTempTipoDesconto] = useState('fixo');
  const [tempValorDesconto, setTempValorDesconto] = useState('0,00');
  const [buscaProduto, setBuscaProduto] = useState('');
  const [processandoFinalizacao, setProcessandoFinalizacao] = useState(false);

  // Relógio do Header em tempo real
  const [dataHora, setDataHora] = useState('');
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setDataHora(`${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cálculos de Totais
  const subtotal = itens.reduce((acc, item) => acc + (item.quantidade * item.valorUnitario), 0);
  const descontoItens = itens.reduce((acc, item) => acc + item.desconto, 0);
  const descontoGlobalCalculado = descontoGlobal.tipo === 'fixo' 
    ? descontoGlobal.valor 
    : subtotal * (descontoGlobal.valor / 100);
  const totalDescontos = descontoItens + descontoGlobalCalculado;
  const totalFinal = Math.max(0, subtotal - totalDescontos);
  const totalItensQtd = itens.reduce((acc, item) => acc + item.quantidade, 0);

  // Métodos de Manipulação de Itens
  const alterarQuantidade = (index, delta) => {
    const novos = [...itens];
    novos[index].quantidade += delta;
    if (novos[index].quantidade <= 0) {
      novos.splice(index, 1);
    }
    setItens(novos);
  };

  const removerItem = (index) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const adicionarProdutoBusca = (e) => {
    if (e.key === 'Enter' && buscaProduto.trim()) {
      setItens([...itens, {
        codigo: Math.floor(1000 + Math.random() * 9000).toString(),
        descricao: buscaProduto.toUpperCase(),
        quantidade: 1,
        valorUnitario: 50.00,
        desconto: 0
      }]);
      setBuscaProduto('');
    }
  };

  // 1. Identificar Código Value4u
  const identificarValue4u = async () => {
    if (!value4uCodigo.trim()) {
      alert('Informe o código Value4u');
      return;
    }
    setLoadingValue4u(true);
    try {
      // Chama getQrCodeType e abre purchase/open
      setValue4uDados({
        codigo: value4uCodigo.toUpperCase(),
        status: 'Aberta',
        colaborador: 'Adriano Zanon',
        valorTotal: totalFinal
      });
    } catch (err) {
      alert('Erro ao validar código na Value4u');
    } finally {
      setLoadingValue4u(false);
    }
  };

  const limparValue4u = () => {
    setValue4uCodigo('');
    setValue4uDados(null);
  };

  // 2. Ação Unificada de Fechamento (Salvar e Confirmar)
  const finalizarVendaUnificada = async () => {
    setProcessandoFinalizacao(true);
    try {
      // Passo 1: Se houver voucher Value4u aberto, faz a baixa automática (purchase/close)
      if (value4uDados && value4uDados.status === 'Aberta') {
        await value4uApi.purchaseClose(value4uDados.codigo, totalFinal);
      }

      // Passo 2: Fatura a pré-venda na API Bime Plataform
      const payloadBime = {
        lancamento: 0,
        cliente: cliente.codigo,
        vendedor: parseInt(vendedor.codigo),
        itens: itens,
        pagamentos: pagamentos.length > 0 ? pagamentos : [{ forma: 'Dinheiro', valor: totalFinal }],
        total: totalFinal
      };
      
      // Chamada API Bime
      // await bimeApi.faturarPreVenda(payloadBime);

      alert(`Venda finalizada com sucesso!\n• Baixa do voucher Value4u confirmada\n• Faturamento enviado para a Bime Plataform`);
      
      // Reset da Venda
      setItens([]);
      limparValue4u();
      setPagamentos([]);
      setModalPagamentoAberto(false);
    } catch (err) {
      alert(`Erro no processo de finalização: ${err.message || 'Verifique a conexão com a API'}`);
    } finally {
      setProcessandoFinalizacao(false);
    }
  };

  // Formas de Pagamento
  const formasPagamento = [
    { id: 1, nome: 'Dinheiro', icon: Banknote },
    { id: 2, nome: 'Cheque', icon: Receipt },
    { id: 3, nome: 'Cartão de Crédito', icon: CreditCard },
    { id: 4, nome: 'Crediário', icon: Building },
    { id: 5, nome: 'Vale Alimentação', icon: Tag },
    { id: 6, nome: 'Vale Refeição', icon: Tag },
    { id: 7, nome: 'Duplicata', icon: Receipt },
    { id: 8, nome: 'Boleto', icon: Receipt },
    { id: 9, nome: 'PIX', icon: Zap },
    { id: 10, nome: 'TED', icon: Building },
    { id: 11, nome: 'Sem Pagamento', icon: X },
    { id: 12, nome: 'Outros', icon: MoreVertical },
  ];

  const selecionarForma = (forma) => {
    setPagamentos([{ id: forma.id, nome: forma.nome, valor: totalFinal }]);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800">
      
      {/* ======================================================== */}
      {/* 1. HEADER AZUL IDÊNTICO AO BIME (image 64)                */}
      {/* ======================================================== */}
      <header className="bg-[#2563EB] text-white px-4 py-2.5 flex items-center justify-between shadow-sm select-none">
        <div className="flex items-center space-x-3">
          {/* Logo Bime PDV */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-lg tracking-tight">
              <span className="text-emerald-400">B</span><span className="text-sky-300">i</span>
            </div>
            <span className="font-bold text-lg tracking-tight">
              Bime <span className="text-xs uppercase bg-white/20 px-1.5 py-0.5 rounded font-medium ml-1">PDV</span>
            </span>
          </div>

          <div className="h-5 w-[1px] bg-white/20"></div>

          {/* Badge Caixa */}
          <span className="text-xs font-semibold uppercase tracking-wider bg-white/10 px-2.5 py-1 rounded-md">
            CAIXA #{caixaNumero}
          </span>

          {/* Vendedor */}
          <div className="flex items-center space-x-1.5 text-xs font-medium bg-white/10 px-2.5 py-1 rounded-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="uppercase text-white/80">VENDEDOR</span>
            <span className="font-semibold">{vendedor.nome}</span>
          </div>

          {/* Botão Identificar Consumidor */}
          <button 
            onClick={() => {
              setTempCpf(cliente.documento);
              setTempNome(cliente.nome);
              setModalConsumidorAberto(true);
            }} 
            className="flex items-center space-x-1.5 text-xs font-medium border border-white/40 hover:bg-white/10 transition px-3 py-1 rounded-md"
          >
            <User className="w-3.5 h-3.5" />
            <span>{cliente.nome === 'CONSUMIDOR FINAL' ? 'Identificar Consumidor' : cliente.nome}</span>
          </button>

          {/* Voucher Value4u Badge (se identificado) */}
          {value4uDados && (
            <div className="flex items-center space-x-1 text-xs bg-amber-400 text-amber-950 font-bold px-2.5 py-1 rounded-md shadow-sm">
              <Gift className="w-3.5 h-3.5" />
              <span>VOUCHER VALUE4U: {value4uDados.codigo}</span>
            </div>
          )}
        </div>

        {/* Canto direito do Header */}
        <div className="flex items-center space-x-3">
          <span className="text-xs font-medium text-white/90 tracking-wide font-mono">
            {dataHora || '29/10/2026 10:00:00'}
          </span>

          <button className="flex items-center space-x-1 text-xs bg-white/10 hover:bg-white/20 transition px-2.5 py-1 rounded-md">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Rápido</span>
          </button>

          <div className="relative">
            <button 
              onClick={() => setMenuMaisOpcoes(!menuMaisOpcoes)}
              className="flex items-center space-x-1 text-xs bg-white/10 hover:bg-white/20 transition px-2.5 py-1 rounded-md"
            >
              <MoreVertical className="w-3.5 h-3.5" />
              <span>Mais opções</span>
            </button>
            {menuMaisOpcoes && (
              <div className="absolute right-0 mt-1 w-52 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-1.5 z-50">
                <button 
                  onClick={() => { setMenuMaisOpcoes(false); setModalConfigAberto(true); }}
                  className="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-100 flex items-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                  <span>Configurações da API</span>
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={() => alert('Encerrando sessão PDV')}
            className="flex items-center space-x-1 text-xs bg-white/10 hover:bg-rose-600 transition px-2.5 py-1 rounded-md"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. ÁREA CENTRAL: BUSCA E TABELA DE PRODUTOS               */}
      {/* ======================================================== */}
      <main className="flex-1 flex flex-col p-4 overflow-hidden">
        {/* Campo de Busca de Produto */}
        <div className="relative mb-3">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-blue-500" />
          </div>
          <input
            type="text"
            value={buscaProduto}
            onChange={(e) => setBuscaProduto(e.target.value)}
            onKeyDown={adicionarProdutoBusca}
            placeholder="Buscar produto por nome ou código... (Pressione Enter para adicionar)"
            className="w-full pl-11 pr-4 py-3 bg-white border-2 border-blue-500 rounded-lg text-slate-800 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition"
          />
        </div>

        {/* Grid de Itens */}
        <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          {/* Cabeçalho da Grade */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-blue-600 uppercase tracking-wider">
            <div className="col-span-1">CÓDIGO</div>
            <div className="col-span-5">DESCRIÇÃO</div>
            <div className="col-span-2 text-center">QTD</div>
            <div className="col-span-2 text-right">VLR. UNIT.</div>
            <div className="col-span-1 text-right">DESCONTO</div>
            <div className="col-span-1 text-right">TOTAL</div>
          </div>

          {/* Lista de Itens */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {itens.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8">
                <Tag className="w-12 h-12 text-slate-300 mb-2" />
                <p className="text-sm font-medium">Nenhum item adicionado à venda</p>
                <p className="text-xs text-slate-400 mt-0.5">Utilize a barra de pesquisa acima</p>
              </div>
            ) : (
              itens.map((item, idx) => {
                const totalItem = (item.quantidade * item.valorUnitario) - item.desconto;
                return (
                  <div key={idx} className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-slate-50 transition text-xs font-medium text-slate-800">
                    <div className="col-span-1 font-mono text-slate-500">{item.codigo}</div>
                    <div className="col-span-5 font-semibold text-slate-800 uppercase tracking-tight">{item.descricao}</div>
                    <div className="col-span-2 flex items-center justify-center space-x-1.5">
                      <button 
                        onClick={() => alterarQuantidade(idx, -1)} 
                        className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-bold font-mono">{item.quantidade}</span>
                      <button 
                        onClick={() => alterarQuantidade(idx, 1)} 
                        className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="col-span-2 text-right font-mono font-semibold">
                      R$ {item.valorUnitario.toFixed(2).replace('.', ',')}
                    </div>
                    <div className="col-span-1 text-right font-mono text-slate-500">
                      R$ {item.desconto.toFixed(2).replace('.', ',')}
                    </div>
                    <div className="col-span-1 flex items-center justify-end space-x-2">
                      <span className="font-bold text-slate-900 font-mono">
                        R$ {totalItem.toFixed(2).replace('.', ',')}
                      </span>
                      <button 
                        onClick={() => removerItem(idx)} 
                        className="text-slate-400 hover:text-rose-600 transition" 
                        title="Remover item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* ======================================================== */}
      {/* 3. RODAPÉ DE TOTAIS E BOTÕES DE AÇÃO (image 65)          */}
      {/* ======================================================== */}
      <footer className="bg-white border-t border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-lg select-none">
        <div className="flex items-center space-x-8">
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">ITENS</span>
            <span className="text-lg font-bold text-slate-800">{totalItensQtd}</span>
          </div>
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">SUBTOTAL</span>
            <span className="text-lg font-bold text-slate-800">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
          </div>
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">DESCONTO</span>
            <span className="text-lg font-bold text-slate-800">R$ {totalDescontos.toFixed(2).replace('.', ',')}</span>
          </div>
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">TOTAL</span>
            <span className="text-2xl font-black text-emerald-600">R$ {totalFinal.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={() => alert('Venda colocada em espera')}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-sm transition shadow-sm"
          >
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Aguardar</span>
          </button>

          <button 
            onClick={() => {
              setTempTipoDesconto(descontoGlobal.tipo);
              setTempValorDesconto(descontoGlobal.valor.toFixed(2).replace('.', ','));
              setModalDescontoAberto(true);
            }} 
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-sm transition shadow-sm"
          >
            <span>% Aplicar desconto</span>
          </button>

          <button 
            onClick={() => {
              if (confirm('Deseja realmente cancelar esta venda?')) {
                setItens([]);
                limparValue4u();
              }
            }} 
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-rose-50 hover:text-rose-600 text-slate-700 font-medium text-sm transition shadow-sm"
          >
            <X className="w-4 h-4" />
            <span>Cancelar</span>
          </button>

          {/* Botão Finalizar Venda (Verde Bime Oficial) */}
          <button 
            onClick={() => {
              if (itens.length === 0) {
                alert('Adicione pelo menos um item à venda');
                return;
              }
              setModalPagamentoAberto(true);
            }} 
            className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold text-sm transition shadow-md hover:shadow-lg"
          >
            <Check className="w-5 h-5" />
            <span>Finalizar venda</span>
          </button>
        </div>
      </footer>

      {/* ======================================================== */}
      {/* MODAL 1: IDENTIFICAR CONSUMIDOR (image 63)               */}
      {/* ======================================================== */}
      {modalConsumidorAberto && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Identificar Consumidor</h3>
              <button onClick={() => setModalConsumidorAberto(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">CPF / CNPJ</label>
                <input 
                  type="text" 
                  value={tempCpf} 
                  onChange={(e) => setTempCpf(e.target.value)}
                  placeholder="000.000.000-00" 
                  className="w-full px-3.5 py-2.5 border-2 border-blue-500 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nome / Razão Social</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={tempNome} 
                    onChange={(e) => setTempNome(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 pr-10" 
                  />
                  <button onClick={() => setTempNome('CONSUMIDOR FINAL')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2.5">
              <button 
                onClick={() => setModalConsumidorAberto(false)} 
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  setCliente({ ...cliente, documento: tempCpf, nome: tempNome || 'CONSUMIDOR FINAL' });
                  setModalConsumidorAberto(false);
                }} 
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: DESCONTO GLOBAL (image 67)                      */}
      {/* ======================================================== */}
      {modalDescontoAberto && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Desconto Global</h3>
              <p className="text-xs text-slate-500 mt-0.5">O desconto global incide sobre o subtotal já descontado por item (RN-10).</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Tipo de Desconto</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setTempTipoDesconto('fixo')}
                    className={`flex items-center justify-center space-x-1.5 py-3 rounded-lg text-sm transition ${
                      tempTipoDesconto === 'fixo' 
                        ? 'border-2 border-blue-500 bg-blue-50 text-blue-700 font-bold' 
                        : 'border border-slate-200 text-slate-600 font-medium hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base font-bold">R$</span>
                    <span>Valor Fixo</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setTempTipoDesconto('percentual')}
                    className={`flex items-center justify-center space-x-1.5 py-3 rounded-lg text-sm transition ${
                      tempTipoDesconto === 'percentual' 
                        ? 'border-2 border-blue-500 bg-blue-50 text-blue-700 font-bold' 
                        : 'border border-slate-200 text-slate-600 font-medium hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base font-bold">%</span>
                    <span>Percentual</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Valor</label>
                <input 
                  type="text" 
                  value={tempValorDesconto} 
                  onChange={(e) => setTempValorDesconto(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 font-semibold" 
                />
              </div>
            </div>
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2.5">
              <button onClick={() => setModalDescontoAberto(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition">
                Cancelar
              </button>
              <button 
                onClick={() => {
                  const val = parseFloat(tempValorDesconto.replace(',', '.')) || 0;
                  setDescontoGlobal({ tipo: tempTipoDesconto, valor: val });
                  setModalDescontoAberto(false);
                }} 
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: PAGAMENTO & VALUE4U UNIFICADA (image 66)        */}
      {/* ======================================================== */}
      {modalPagamentoAberto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Topo do Modal */}
            <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50 select-none">
              <div className="flex items-center space-x-2 text-blue-600">
                <CreditCard className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-800">Pagamento</h3>
              </div>
              <button onClick={() => setModalPagamentoAberto(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Cliente */}
              <div>
                <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">CLIENTE</span>
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-4">
                    <label className="block text-[10px] text-slate-500 mb-0.5">CPF / CNPJ</label>
                    <input type="text" readOnly value={cliente.documento || 'Não informado'} className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs text-slate-700" />
                  </div>
                  <div className="col-span-8">
                    <label className="block text-[10px] text-slate-500 mb-0.5">Nome</label>
                    <input type="text" readOnly value={cliente.nome} className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs text-slate-700 font-medium" />
                  </div>
                </div>
              </div>

              {/* Bloco de Integração Value4u */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">Benefício / Voucher Value4u</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    value4uDados 
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-800' 
                      : 'bg-white border-blue-200 text-blue-700'
                  }`}>
                    {value4uDados ? 'Benefício Identificado' : 'Aguardando código'}
                  </span>
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={value4uCodigo}
                    onChange={(e) => setValue4uCodigo(e.target.value.toUpperCase())}
                    placeholder="XXXX-XXXX-XXXX"
                    maxLength={14}
                    className="flex-1 px-3.5 py-2 bg-white border border-blue-300 rounded-md text-xs font-mono font-bold tracking-wider uppercase text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={identificarValue4u}
                    disabled={loadingValue4u}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-md shadow-sm transition flex items-center space-x-1.5"
                  >
                    {loadingValue4u ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Validando...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Identificar</span>
                      </>
                    )}
                  </button>
                  {value4uDados && (
                    <button
                      type="button"
                      onClick={limparValue4u}
                      className="px-2.5 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 text-xs rounded-md"
                      title="Remover"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 mt-2 font-medium">
                  {value4uDados 
                    ? `Colaborador: ${value4uDados.colaborador} | Transação aberta com sucesso.` 
                    : 'Insira o código Value4u para validar o benefício e abrir a compra automaticamente.'
                  }
                </p>
              </div>

              {/* Grid de Formas de Pagamento (Cards com ícones) */}
              <div>
                <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">FORMAS DE PAGAMENTO</span>
                <div className="grid grid-cols-4 gap-2.5">
                  {formasPagamento.map((f) => {
                    const IconComponent = f.icon;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => selecionarForma(f)}
                        className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex flex-col items-center justify-center transition group active:scale-95"
                      >
                        <IconComponent className="w-6 h-6 text-blue-500 group-hover:scale-110 transition" />
                        <span className="text-xs font-medium text-slate-700 mt-1.5">{f.nome}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pagamentos Lançados */}
              <div>
                <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">PAGAMENTOS RECEBIDOS</span>
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 min-h-[60px] text-xs">
                  {pagamentos.length === 0 ? (
                    <span className="text-slate-400">Nenhum pagamento lançado. Clique em uma forma acima para adicionar.</span>
                  ) : (
                    pagamentos.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded border border-slate-200">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          <span className="font-semibold text-slate-800">{p.nome}</span>
                        </div>
                        <span className="font-bold text-slate-900 font-mono">
                          R$ {p.valor.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Rodapé do Modal com Ação Unificada */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 font-medium">Total da Venda: <strong className="text-slate-900 ml-1">R$ {totalFinal.toFixed(2).replace('.', ',')}</strong></span>
                <span className="text-slate-600 font-medium">Valor Recebido: <strong className="text-emerald-600 ml-1">R$ {(pagamentos[0]?.valor || totalFinal).toFixed(2).replace('.', ',')}</strong></span>
              </div>

              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setModalPagamentoAberto(false)} 
                  className="px-5 py-2.5 border border-slate-300 bg-white hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 transition flex items-center space-x-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>

                {/* BOTÃO UNIFICADO: Fecha Value4u + Salva Bime */}
                <button
                  onClick={finalizarVendaUnificada}
                  disabled={processandoFinalizacao}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-lg shadow-md transition flex items-center justify-center space-x-2"
                >
                  {processandoFinalizacao ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processando fechamento e faturamento...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirmar Pagamento e Finalizar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: CONFIGURAÇÕES DA API                             */}
      {/* ======================================================== */}
      {modalConfigAberto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Configurações da API</h3>
              <button onClick={() => setModalConfigAberto(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <p className="text-slate-500">
                Variáveis configuradas no ambiente Vercel (<code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600">.env</code>):
              </p>

              <div className="border-t pt-3">
                <h4 className="font-bold text-blue-700 text-xs uppercase mb-2">Bime Plataform</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-slate-600 mb-0.5">CNPJ / CPF</label>
                    <input type="text" readOnly value={config.bime.cnpjCpf} className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-0.5">URL da API</label>
                    <input type="text" readOnly value={config.bime.apiUrl} className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono bg-slate-50" />
                  </div>
                </div>
              </div>

              <div className="border-t pt-3">
                <h4 className="font-bold text-blue-700 text-xs uppercase mb-2">Value4u</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-slate-600 mb-0.5">Endereço API</label>
                    <input type="text" readOnly value={config.value4u.apiUrl} className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-0.5">Código da Empresa</label>
                    <input type="text" readOnly value={config.value4u.companyCode} className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-0.5">CNPJ da Loja</label>
                    <input type="text" readOnly value={config.value4u.cnpj} className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono bg-slate-50" />
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button onClick={() => setModalConfigAberto(false)} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-sm">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
