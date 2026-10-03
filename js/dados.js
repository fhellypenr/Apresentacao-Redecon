// Leitura dos dados da planilha Google, com reserva para uso sem internet.
(function () {
  const CHAVE_CACHE = "redecon_dados_v1";

  // ---------- CSV ----------
  function lerCSV(texto) {
    const linhas = [];
    let linha = [], campo = "", aspas = false;
    for (let i = 0; i < texto.length; i++) {
      const c = texto[i];
      if (aspas) {
        if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
        else if (c === '"') aspas = false;
        else campo += c;
      } else if (c === '"') aspas = true;
      else if (c === ",") { linha.push(campo); campo = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && texto[i + 1] === "\n") i++;
        linha.push(campo); linhas.push(linha); linha = []; campo = "";
      } else campo += c;
    }
    if (campo !== "" || linha.length) { linha.push(campo); linhas.push(linha); }
    return linhas;
  }

  // Converte o texto exibido pela planilha (formato brasileiro) em número.
  // "80,00%" → 0.8 · "R$ 1.000.000" → 1000000 · "13,75" → 13.75 · "SAC" → "SAC"
  function lerValor(bruto) {
    if (bruto === undefined || bruto === null) return null;
    let s = String(bruto).trim();
    if (s === "" || s.startsWith("#")) return null;
    const pct = s.endsWith("%");
    let num = s.replace(/R\$|US\$|%/g, "").replace(/\s/g, "");
    if (/^-?[\d.]*,\d+$/.test(num)) num = num.replace(/\./g, "").replace(",", ".");
    else if (/^-?\d{1,3}(\.\d{3})+$/.test(num)) num = num.replace(/\./g, "");
    if (num !== "" && !isNaN(Number(num))) {
      const n = Number(num);
      return pct ? n / 100 : n;
    }
    return s;
  }

  async function baixarAba(aba) {
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.planilhaId}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(aba)}`;
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error("Planilha indisponível (" + r.status + ")");
    const texto = await r.text();
    if (texto.trim().startsWith("<")) throw new Error("Planilha não compartilhada");
    return lerCSV(texto);
  }

  function porChave(linhas, colChave, colValor) {
    const out = {};
    linhas.slice(1).forEach(l => {
      const k = (l[colChave] || "").trim();
      if (k) out[k] = lerValor(l[colValor]);
    });
    return out;
  }

  function montar(abas) {
    const d = {};
    d.parametros = porChave(abas.Parametros, 0, 2);
    d.indices = {};
    abas.Indices.slice(1).forEach(l => {
      const k = (l[0] || "").trim();
      if (k) d.indices[k] = { data: (l[3] || "").trim() || null, valor: lerValor(l[4]) };
    });
    d.prazos = abas.Prazos.slice(1).filter(l => l[0]).map(l => ({
      prazo: lerValor(l[0]), taxa_adm: lerValor(l[1]), fundo_reserva: lerValor(l[2])
    }));
    d.funil = abas.Funil.slice(1).filter(l => l[1]).map(l => ({
      modalidade: l[1].trim(), condicao: (l[2] || "").trim(), meses: lerValor(l[3]) || 0,
      concorrencia: lerValor(l[4]), obs: (l[5] || "").trim()
    }));
    d.ir = abas.IR.slice(1).filter(l => l[0]).map(l => ({ ate: lerValor(l[0]), aliquota: lerValor(l[1]) }));
    d.institucional = {};
    d.inst_rot = {};
    abas.Institucional.slice(1).forEach(l => {
      if (!l[0]) return;
      const v = (l[3] || "").trim();
      if (v && !v.startsWith("#")) d.institucional[l[0].trim()] = v;
      if ((l[2] || "").trim()) d.inst_rot[l[0].trim()] = l[2].trim();
    });
    // Casos reais: só entram os autorizados (coluna F = "sim")
    d.casos = (abas.Casos || []).slice(1).filter(l => l[0] && /^s/i.test((l[5] || "").trim())).map(l => ({
      titulo: l[0].trim(), perfil: (l[1] || "").trim(), credito: (l[2] || "").trim(),
      fez: (l[3] || "").trim(), resultado: (l[4] || "").trim()
    }));
    d.cidades = (abas.Cidades || []).slice(1).filter(l => l[0]).map(l => ({
      cidade: l[0].trim(), diaria_usd: lerValor(l[1]), ocupacao: lerValor(l[2]), fonte: (l[3] || "").trim()
    })).filter(c => c.cidade);
    d.alternativas = (abas.Alternativas || []).slice(1).filter(l => l[0] && l[1]).map(l => ({
      nome: l[0].trim(), taxa_am: lerValor(l[1]), obs: (l[2] || "").trim()
    })).filter(a => a.taxa_am > 0);
    d.textos = {};
    abas.Textos.slice(1).forEach(l => { if (l[0]) d.textos[l[0].trim()] = (l[2] || "").trim(); });
    return d;
  }

  // Junta o que veio da planilha com a reserva: o que estiver vazio na planilha usa a reserva.
  function completar(d, base) {
    const out = JSON.parse(JSON.stringify(base));
    for (const grupo of ["parametros", "institucional", "inst_rot", "textos"]) {
      for (const [k, v] of Object.entries(d[grupo] || {})) if (v !== null && v !== "") out[grupo][k] = v;
    }
    for (const k of Object.keys(d.indices || {})) if (d.indices[k].valor !== null) out.indices[k] = d.indices[k];
    for (const lista of ["prazos", "funil", "ir", "cidades", "alternativas"]) if (d[lista] && d[lista].length) out[lista] = d[lista];
    if (d.casos) out.casos = d.casos; // lista de casos pode ficar vazia de propósito
    return out;
  }

  // Valores derivados: tudo que é calculado a partir dos parâmetros.
  function derivar(d) {
    const p = d.parametros;
    const selicAuto = d.indices.selic && d.indices.selic.valor != null ? d.indices.selic.valor / 100 : null;
    p.selic = selicAuto != null ? selicAuto : (p.selic_manual != null ? p.selic_manual : p.selic_auto);
    p.selic_data = d.indices.selic ? d.indices.selic.data : null;
    p.rend_credito_aa = p.selic * p.pct_selic_credito;
    p.rend_credito_am = Math.pow(1 + p.rend_credito_aa, 1 / 12) - 1;
    const cdi = d.indices.cdi && d.indices.cdi.valor != null ? d.indices.cdi.valor / 100 : p.cdi_auto;
    p.cdi = cdi;
    const dolar = d.indices.dolar && d.indices.dolar.valor != null ? d.indices.dolar.valor : null;
    p.st_diaria_brl = dolar ? p.st_diaria_usd * dolar : null;
    d.funil.sort((a, b) => a.meses - b.meses || b.concorrencia - a.concorrencia);
    return d;
  }

  window.Dados = {
    atual: null,
    origem: "padrao", // "planilha" | "salvo" | "padrao"
    quando: null,
    async carregar() {
      try {
        const abas = {};
        await Promise.all(CONFIG.abas.map(async a => { abas[a] = await baixarAba(a); }));
        await baixarAba("Cidades").then(x => { abas.Cidades = x; }).catch(() => {});
        await baixarAba("Alternativas").then(x => { abas.Alternativas = x; }).catch(() => {});
        await baixarAba("Casos").then(x => { abas.Casos = x; }).catch(() => {});
        const d = completar(montar(abas), DADOS_PADRAO);
        this.atual = derivar(d);
        this.origem = "planilha";
        this.quando = new Date().toISOString();
        try { localStorage.setItem(CHAVE_CACHE, JSON.stringify({ quando: this.quando, dados: d })); } catch (e) {}
      } catch (erro) {
        let salvo = null;
        try { salvo = JSON.parse(localStorage.getItem(CHAVE_CACHE)); } catch (e) {}
        if (salvo && salvo.dados) {
          this.atual = derivar(salvo.dados);
          this.origem = "salvo";
          this.quando = salvo.quando;
        } else {
          this.atual = derivar(JSON.parse(JSON.stringify(DADOS_PADRAO)));
          this.origem = "padrao";
          this.quando = DADOS_PADRAO.atualizadoEm;
        }
        this.erro = erro.message;
      }
      return this.atual;
    },
    lerValor
  };
})();
