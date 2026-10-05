// Máscara de dinheiro para os campos de valor: mostra sempre no formato 500.000,00.
// - Ao entrar no campo, o valor fica selecionado: é só digitar o novo valor.
// - Pontos de milhar entram sozinhos; ",00" fica fixo no final.
// - Para digitar centavos, aperte "," (ou "." do teclado numérico).
// Qualquer campo com a classe "campo-moeda" recebe a máscara (inclusive os criados depois).
(function () {
  "use strict";
  const milhar = s => s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  // Lê o texto como reais e centavos (aceita "500000", "500.000", "500.000,5", "R$ 1.000,00")
  function partes(texto) {
    const v = String(texto == null ? "" : texto);
    const ci = v.indexOf(",");
    const a = ci >= 0 ? v.slice(0, ci) : v, b = ci >= 0 ? v.slice(ci + 1) : "";
    const inteiro = a.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
    let cents = b.replace(/\D/g, "");
    cents = cents.length > 2 ? cents.slice(-2) : (cents + "00").slice(0, 2);
    return { inteiro, cents, vazio: !inteiro && !b.replace(/\D/g, "") };
  }
  function ler(texto) {
    const p = partes(texto);
    return p.vazio ? 0 : Number((p.inteiro || "0") + "." + p.cents);
  }
  function formatar(valor) {
    if (valor === "" || valor == null || isNaN(valor)) return "";
    const [i, c] = Math.abs(Number(valor)).toFixed(2).split(".");
    return (valor < 0 ? "-" : "") + milhar(i) + "," + c;
  }
  const ehMoeda = el => el && el.classList && el.classList.contains("campo-moeda");
  let recemFocado = null;

  // Eventos em captura: a máscara roda antes dos cálculos de cada tela
  document.addEventListener("focusin", e => {
    const el = e.target;
    if (!ehMoeda(el)) return;
    recemFocado = el;
    setTimeout(() => { if (document.activeElement === el) el.select(); }, 0);
  }, true);
  // O clique que dá o foco não desfaz a seleção; cliques depois disso no ",00" voltam o cursor para os reais
  document.addEventListener("pointerup", e => {
    const el = e.target;
    if (!ehMoeda(el)) return;
    if (recemFocado === el) { recemFocado = null; setTimeout(() => el.select(), 0); return; }
    const ci = el.value.indexOf(",");
    if (ci >= 0 && el.selectionStart === el.selectionEnd && el.selectionStart > ci) el.setSelectionRange(ci, ci);
  }, true);

  document.addEventListener("keydown", e => {
    const el = e.target;
    if (!ehMoeda(el)) return;
    recemFocado = null;
    const v = el.value, ci = v.indexOf(","), ini = el.selectionStart, fim = el.selectionEnd;
    if (e.key === "," || e.key === "." || e.key === "Decimal") {
      // vai para os centavos e seleciona, para digitar por cima
      e.preventDefault();
      if (ci >= 0) el.setSelectionRange(ci + 1, v.length);
      return;
    }
    if (ini !== fim) return;
    // Backspace nos centavos: zera os centavos; se já estão zerados, apaga o último dígito dos reais
    if (e.key === "Backspace" && ci >= 0 && ini > ci) {
      e.preventDefault();
      const p = partes(v);
      let inteiro = p.inteiro;
      if (p.cents === "00") inteiro = inteiro.slice(0, -1);
      if (!inteiro && p.cents === "00") { el.value = ""; }
      else {
        el.value = milhar(inteiro || "0") + ",00";
        const nci = el.value.indexOf(",");
        el.setSelectionRange(nci, nci);
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }
    // Delete logo antes da vírgula pula para os centavos
    if (e.key === "Delete" && ci >= 0 && ini === ci) el.setSelectionRange(ci + 1, ci + 1);
  }, true);

  document.addEventListener("input", e => {
    const el = e.target;
    if (!ehMoeda(el)) return;
    const v = el.value, caret = el.selectionStart, ci = v.indexOf(",");
    const p = partes(v);
    if (p.vazio) { el.value = ""; return; }
    // Quantos dígitos dos reais estavam antes do cursor (para devolver o cursor no mesmo lugar)
    const noInteiro = ci < 0 || caret <= ci;
    const digitosAntes = noInteiro ? v.slice(0, caret).replace(/\D/g, "").replace(/^0+(?=\d)/, "").length : 0;
    const novo = milhar(p.inteiro || "0") + "," + p.cents;
    el.value = novo;
    let pos = novo.length;
    if (noInteiro) {
      pos = 0;
      for (let n = 0; pos < novo.length && n < digitosAntes; pos++) if (/\d/.test(novo[pos])) n++;
      if (digitosAntes === 0) pos = 0;
    }
    try { el.setSelectionRange(pos, pos); } catch (err) {}
  }, true);

  window.Moeda = { ler, formatar };
})();
