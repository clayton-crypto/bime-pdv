// Arquivo de configuração de APIs consumindo as variáveis de ambiente (Vercel ou .env)
export const config = {
  bime: {
    apiUrl: import.meta.env.VITE_BIME_API_URL || 'https://api.serverlondrisoft.com:9050/bimeplataform/',
    authUrl: import.meta.env.VITE_BIME_AUTH_URL || 'https://api.serverlondrisoft.com:8006/Authetication',
    cnpjCpf: import.meta.env.VITE_BIME_CNPJ_CPF || '04361421000107',
    token: import.meta.env.VITE_BIME_TOKEN || 'TfC6WZt0ncWWar85oedmqz5NmKhiSZKcskOP0tQaDJRy3LzDvUjNbeOtzjlCHBIO',
  },
  value4u: {
    apiUrl: import.meta.env.VITE_VALUE4U_API_URL || 'http://integration.value4u.com.br',
    token: import.meta.env.VITE_VALUE4U_TOKEN || 'qHtRjNo1HU',
    companyCode: import.meta.env.VITE_VALUE4U_COMPANY_CODE || '9WgTo',
    cnpj: import.meta.env.VITE_VALUE4U_CNPJ || '04361421000107',
  }
};

// Serviço Bime Plataform
export const bimeApi = {
  // Autenticação de operador
  async autenticar(email, password) {
    const res = await fetch(config.bime.authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  // Busca de produtos por nome ou código
  async buscarProdutos(termo) {
    const url = `${config.bime.apiUrl}BuscarProdutos?termo=${encodeURIComponent(termo)}`;
    const res = await fetch(url, {
      headers: {
        'cnpjcpf': config.bime.cnpjCpf,
        'token': config.bime.token
      }
    });
    return res.json();
  },

  // Consulta de prazos de pagamento cadastrados
  async listarPrazos() {
    const url = `${config.bime.apiUrl}ConsultarPrazos`;
    const res = await fetch(url, {
      headers: {
        'cnpjcpf': config.bime.cnpjCpf,
        'token': config.bime.token
      }
    });
    return res.json();
  },

  // Faturamento e Gravação da Pré-venda
  async faturarPreVenda(vendaData) {
    const url = `${config.bime.apiUrl}FaturarPrevenda`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cnpjcpf': config.bime.cnpjCpf,
        'token': config.bime.token
      },
      body: JSON.stringify(vendaData)
    });
    return res.json();
  }
};

// Serviço Value4u
export const value4uApi = {
  // 1. Identificar o tipo do voucher / QR Code
  async getQrCodeType(codigo) {
    const url = `${config.value4u.apiUrl}/getQrCodeType?token=${config.value4u.token}&companyCode=${config.value4u.companyCode}&code=${codigo}`;
    const res = await fetch(url);
    return res.json();
  },

  // 2. Abertura do voucher
  async purchaseOpen(codigo, valorTotal, quantidade, colaborador, documentoItem = '1999') {
    const url = `${config.value4u.apiUrl}/purchase/open`;
    const body = [{
      codigoColaborador: colaborador?.codigo || "2000",
      nomeColaborador: colaborador?.nome || "Operador",
      codigoValidacao: codigo,
      valorVenda: valorTotal,
      quantidade: quantidade,
      codigoEmpresa: config.value4u.companyCode,
      identificadorExternoProduto: documentoItem,
      numeroSequencialItemVenda: 1,
      bloquearResgate: false,
      dataHoraVenda: new Date().toISOString()
    }];

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.value4u.token}`
      },
      body: JSON.stringify(body)
    });
    return res.json();
  },

  // 3. Fechamento automático no Salvar (Baixa do benefício)
  async purchaseClose(codigo, valorTotal, formaPagamentoDesc = "CREDITO NATHALIA", formaId = "1000") {
    const url = `${config.value4u.apiUrl}/purchase/close`;
    const body = {
      chaveAutenticacao: codigo,
      metodoPagamento: [{
        identificadorExternoFormaPagamento: formaId,
        valorTotal: valorTotal,
        descricaoFormaPagamento: formaPagamentoDesc
      }]
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.value4u.token}`
      },
      body: JSON.stringify(body)
    });
    return res.json();
  },

  // 4. Cancelamento de compra aberta
  async purchaseCancel(codigo) {
    const url = `${config.value4u.apiUrl}/purchase/cancel`;
    const body = {
      codigoEmpresa: config.value4u.companyCode,
      codigoValidacao: [codigo]
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.value4u.token}`
      },
      body: JSON.stringify(body)
    });
    return res.json();
  }
};
