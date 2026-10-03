// Motor de cálculo da Apresentação Redecon.
// Só faz contas: não lê tela nem planilha. Recebe números e devolve números.
// Todas as taxas em decimal (5% = 0.05). Meses começam em 1.
(function (raiz) {
  "use strict";

  const mensal = aa => Math.pow(1 + aa, 1 / 12) - 1;         // taxa anual → mensal (composta)
  const fatorReajuste = (mes, reaj) => Math.pow(1 + reaj, Math.floor((mes - 1) / 12)); // reajusta nos meses 13, 25, 37...

  // ---------- Parcela ----------
  // Parcela cheia = crédito × (1 + taxa total) ÷ prazo. Meia parcela = metade.
  function parcela({ credito, prazo, taxaTotal, meia = true }) {
    const cheia = credito * (1 + taxaTotal) / prazo;
    return meia ? cheia / 2 : cheia;
  }

  // Crédito que cabe numa parcela desejada.
  function creditoPelaParcela({ valorParcela, prazo, taxaTotal, meia = true }) {
    return valorParcela * (meia ? 2 : 1) * prazo / (1 + taxaTotal);
  }

  // Taxa de administração ao mês, como a apresentação mostra (taxa adm ÷ prazo).
  const taxaAdmMes = (taxaAdm, prazo) => taxaAdm / prazo;

  // ---------- Linha do tempo da cota ----------
  // Simula mês a mês. Antes da contemplação: parcela reajustada a cada 12 meses.
  // Na contemplação: crédito disponível passa a render; o saldo devedor vira parcelas
  // iguais no prazo restante e passa a reajustar só sobre o saldo.
  // modalidade: "nenhuma" (não contempla), "sorteio" ou "embutido" (lance embutido).
  function simularCota(o) {
    const {
      credito, prazo, taxaTotal, meia = true, reajuste = 0.05,
      mesContemplacao = null, modalidade = "sorteio",
      lanceEmbutido = 0.30, mesesSemPagarLance = 2,
      rendCreditoAm = 0, seguroPrestamista = 0, comSeguro = false
    } = o;
    // O seguro prestamista só entra quando o cliente usa o crédito para comprar um bem.
    const taxaSeguro = comSeguro ? seguroPrestamista : 0;
    const pctPorParcela = (1 + taxaTotal) / prazo / (meia ? 2 : 1);
    const contempla = mesContemplacao && modalidade !== "nenhuma" && mesContemplacao <= prazo;
    const meses = [];
    let pctPago = 0, pagoTotal = 0;
    let saldo = null, creditoDisp = null, creditoNaContemplacao = null, parcelaPos = 0, seguroTotal = 0;
    let fimPagamento = prazo;

    for (let m = 1; m <= prazo; m++) {
      const fator = fatorReajuste(m, reajuste);
      let parcelaMes = 0, seguroMes = 0;

      if (!contempla || m <= mesContemplacao) {
        // Fase de acumulação
        const creditoAtual = credito * fator;
        parcelaMes = creditoAtual * pctPorParcela;
        pctPago += pctPorParcela;
        pagoTotal += parcelaMes;
        const saldoMes = Math.max(0, creditoAtual * (1 + taxaTotal - pctPago));
        const linha = { mes: m, creditoAtual, parcela: parcelaMes, pagoTotal, saldoDevedor: saldoMes, pctPago, fase: "antes" };

        if (contempla && m === mesContemplacao) {
          // Contemplação
          const embutido = modalidade === "embutido" ? creditoAtual * lanceEmbutido : 0;
          creditoNaContemplacao = creditoAtual;
          creditoDisp = creditoAtual - embutido;
          saldo = Math.max(0, saldoMes - embutido);
          const pulos = modalidade === "embutido" ? mesesSemPagarLance : 0;
          fimPagamento = prazo;
          linha.fase = "contemplado";
          linha.creditoDisponivel = creditoDisp;
          linha.embutido = embutido;
          linha.saldoDevedor = saldo;
          linha.mesesRestantes = prazo - m - pulos;
          linha.primeiroPagamentoPos = m + 1 + pulos;
        }
        meses.push(linha);
        continue;
      }

      // Fase após a contemplação
      const ultima = meses[meses.length - 1];
      const primeiroPos = meses.find(x => x.fase === "contemplado").primeiroPagamentoPos;
      // Reajuste anual sobre o saldo devedor (mesmo calendário do grupo)
      if ((m - 1) % 12 === 0) saldo *= (1 + reajuste);
      creditoDisp *= (1 + rendCreditoAm);
      if (m >= primeiroPos && saldo > 0.005) {
        const restantes = prazo - m + 1;
        parcelaPos = saldo / restantes;
        seguroMes = saldo * taxaSeguro;
        saldo -= parcelaPos;
        parcelaMes = parcelaPos;
      }
      pagoTotal += parcelaMes + seguroMes;
      seguroTotal += seguroMes;
      meses.push({ mes: m, creditoAtual: ultima.creditoAtual, parcela: parcelaMes, seguro: seguroMes, pagoTotal,
        saldoDevedor: Math.max(0, saldo), creditoDisponivel: creditoDisp, fase: "depois" });
    }
    const cont = meses.find(x => x.fase === "contemplado") || null;
    return {
      meses, contemplacao: cont, pagoTotal, seguroTotal,
      creditoFinal: contempla ? creditoDisp : meses[meses.length - 1].creditoAtual,
      parcelaInicial: meses[0].parcela,
      parcelaPosInicial: cont ? (meses.find(x => x.fase === "depois" && x.parcela > 0) || {}).parcela || 0 : null
    };
  }

  // Taxa efetiva de quem ainda não foi contemplado:
  // (tudo o que pagou + o que ainda falta pagar) ÷ crédito atual − 1.
  function taxaEfetiva(sim, mes) {
    const l = sim.meses[mes - 1];
    return (l.pagoTotal + l.saldoDevedor) / l.creditoAtual - 1;
  }

  // ---------- Venda da carta contemplada ----------
  // Valor da venda = ágio × crédito líquido na contemplação (já reajustado e sem o lance embutido).
  // Lucro = valor da venda − tudo o que foi pago até a contemplação.
  function vendaCarta({ creditoDisponivel, pagoAteContemplar, agio }) {
    const recebe = creditoDisponivel * agio;
    const lucro = recebe - pagoAteContemplar;
    return { recebe, lucro, lucroPct: pagoAteContemplar ? lucro / pagoAteContemplar : 0 };
  }

  // ---------- Aplicação financeira (CDB) ----------
  function aliquotaIR(dias, tabela) {
    for (const f of tabela) if (dias <= f.ate) return f.aliquota;
    return tabela[tabela.length - 1].aliquota;
  }
  // Cada aporte rende até o mês final e paga IR conforme o próprio prazo.
  // aportes: lista de { mes, valor }. Retorna valor bruto, IR e líquido no mês final.
  function aplicarAportes({ aportes, mesFinal, taxaAa, tabelaIR }) {
    const rm = mensal(taxaAa);
    let bruto = 0, ir = 0, investido = 0;
    for (const a of aportes) {
      if (a.mes > mesFinal || !a.valor) continue;
      const n = mesFinal - a.mes;
      const montante = a.valor * Math.pow(1 + rm, n);
      const rend = montante - a.valor;
      const imposto = tabelaIR ? rend * aliquotaIR(n * 30, tabelaIR) : 0;
      bruto += montante; ir += imposto; investido += a.valor;
    }
    return { investido, bruto, ir, liquido: bruto - ir, ganho: bruto - ir - investido };
  }

  // ---------- Financiamento imobiliário (SAC) ----------
  function financiamentoSAC({ valorImovel, entrada, taxaAa, trAa = 0, prazo }) {
    const financiado = valorImovel * (1 - entrada);
    const i = (1 + mensal(taxaAa)) * (1 + mensal(trAa)) - 1;
    const amort = financiado / prazo;
    let saldo = financiado, juros = 0, primeira = 0, ultima = 0;
    for (let k = 1; k <= prazo; k++) {
      const j = saldo * i;
      const p = amort + j;
      if (k === 1) primeira = p;
      if (k === prazo) ultima = p;
      juros += j; saldo -= amort;
    }
    return { valorEntrada: valorImovel * entrada, financiado, taxaMes: i, primeiraParcela: primeira, ultimaParcela: ultima,
      totalJuros: juros, totalPago: financiado + juros + valorImovel * entrada };
  }

  // ---------- Financiamento imobiliário (Price: parcelas iguais) ----------
  function financiamentoPrice({ valorImovel, entrada, taxaAa, trAa = 0, prazo }) {
    const financiado = valorImovel * (1 - entrada);
    const i = (1 + mensal(taxaAa)) * (1 + mensal(trAa)) - 1;
    const pmt = i === 0 ? financiado / prazo : financiado * i / (1 - Math.pow(1 + i, -prazo));
    const totalJuros = pmt * prazo - financiado;
    return { valorEntrada: valorImovel * entrada, financiado, taxaMes: i, primeiraParcela: pmt, ultimaParcela: pmt,
      totalJuros, totalPago: financiado + totalJuros + valorImovel * entrada };
  }

  // ---------- Previdência: transformar um valor em renda ----------
  function previdencia({ valor, taxaAmLiquida, anos }) {
    const n = anos * 12, r = taxaAmLiquida;
    const renda = r === 0 ? valor / n : valor * r / (1 - Math.pow(1 + r, -n));
    return { renda, totalRecebido: renda * n };
  }
  const rendaVitalicia = ({ valor, taxaAmLiquida }) => valor * taxaAmLiquida;

  // ---------- Aluguel ----------
  const aluguelTradicional = ({ valorImovel, taxaAm }) => valorImovel * taxaAm;
  function shortStay({ diaria, ocupacao, custos, diasMes = 30.4 }) {
    const bruta = diaria * diasMes * ocupacao;
    return { receitaBruta: bruta, custos: bruta * custos, liquido: bruta * (1 - custos) };
  }

  // ---------- Taxa interna de retorno (ao mês) ----------
  // fluxos[t] = dinheiro no mês t (negativo = saída, positivo = entrada). Retorna null se não houver solução.
  function tir(fluxos) {
    const vpl = r => fluxos.reduce((acc, f, t) => acc + f / Math.pow(1 + r, t), 0);
    let lo = -0.99, hi = 10, flo = vpl(lo), fhi = vpl(hi);
    if (flo * fhi > 0) return null;
    for (let k = 0; k < 200; k++) {
      const mid = (lo + hi) / 2, fm = vpl(mid);
      if (Math.abs(fm) < 1e-7) return mid;
      if (fm * flo > 0) { lo = mid; flo = fm; } else { hi = mid; }
    }
    return (lo + hi) / 2;
  }

  // ---------- Funil ----------
  function melhorModalidade(funil, mesesEmDia) {
    const ok = funil.filter(f => f.meses <= mesesEmDia);
    return ok.reduce((a, b) => (b.concorrencia < a.concorrencia ? b : a), ok[0]);
  }

  const Motor = { mensal, fatorReajuste, parcela, creditoPelaParcela, taxaAdmMes, simularCota, taxaEfetiva,
    vendaCarta, aliquotaIR, aplicarAportes, financiamentoSAC, financiamentoPrice, previdencia, rendaVitalicia,
    aluguelTradicional, shortStay, melhorModalidade, tir };
  if (typeof module !== "undefined" && module.exports) module.exports = Motor;
  else raiz.Motor = Motor;
})(typeof window !== "undefined" ? window : globalThis);
