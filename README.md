# Bime PDV (React + Vite + Tailwind CSS)

Interface moderna de PDV para o ecossistema Bime Plataform com integração nativa ao parceiro Value4u.

## 🚀 Como Executar Localmente

1. Entre na pasta do projeto:
```bash
cd bime-pdv-react
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

Abra no navegador em: `http://localhost:3000`

---

## ☁️ Como Publicar no Vercel

### Opção 1: Pela Interface Web do Vercel (GitHub/GitLab)
1. Suba esta pasta para um repositório no seu GitHub.
2. No painel do [Vercel](https://vercel.com), clique em **"Add New"** -> **"Project"** e selecione o repositório.
3. Em **Build and Output Settings**, o Vercel detectará automaticamente o framework `Vite`.
4. Em **Environment Variables**, cadastre as seguintes variáveis (com base no seu `.env.example`):
   - `VITE_BIME_API_URL`
   - `VITE_BIME_AUTH_URL`
   - `VITE_BIME_CNPJ_CPF`
   - `VITE_BIME_TOKEN`
   - `VITE_VALUE4U_API_URL`
   - `VITE_VALUE4U_TOKEN`
   - `VITE_VALUE4U_COMPANY_CODE`
   - `VITE_VALUE4U_CNPJ`
5. Clique em **"Deploy"**.

### Opção 2: Pelo Terminal via Vercel CLI
```bash
cd bime-pdv-react
npx vercel
```
Siga as instruções na tela e depois configure as variáveis no painel da Vercel.

---

## ⚙️ Variáveis de Ambiente Suportadas

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `VITE_BIME_API_URL` | Endpoint base da API Bime | `https://api.serverlondrisoft.com:9050/bimeplataform/` |
| `VITE_BIME_AUTH_URL` | Endpoint de autenticação | `https://api.serverlondrisoft.com:8006/Authetication` |
| `VITE_BIME_CNPJ_CPF` | CNPJ ou CPF da loja credenciada | `04361421000107` |
| `VITE_BIME_TOKEN` | Token secreto Bime Plataform | `TfC6WZ...` |
| `VITE_VALUE4U_API_URL` | Endpoint base da Value4u | `http://integration.value4u.com.br` |
| `VITE_VALUE4U_TOKEN` | Token de 10 dígitos da Value4u | `qHtRjNo1HU` |
| `VITE_VALUE4U_COMPANY_CODE` | Código da empresa (5 dígitos) | `9WgTo` |
| `VITE_VALUE4U_CNPJ` | CNPJ da loja na Value4u (14 dígitos)| `04361421000107` |

---

## ✨ Recursos Implementados
- **Design 100% Idêntico ao Bime PDV** (Paleta oficial, tipografia Inter, cartões com ícones).
- **Modal de Identificação do Consumidor** (CPF/CNPJ e Nome).
- **Modal de Desconto Global** (Alternador entre Valor Fixo e Percentual).
- **Voucher Value4u Integrado:**
  - Campo com validação e botão **Identificar**.
  - **Fluxo Unificado:** O botão "Confirmar Pagamento e Finalizar" dispara o fechamento na Value4u e o faturamento na API do Bime simultaneamente.
