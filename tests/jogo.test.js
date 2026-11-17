const test = require('node:test');
const assert = require('node:assert/strict');
const { FROTA, criarTabuleiro, posicionarNavio, frotaCompleta, navioAfundado, atirar, obterCasa } = require('../src/jogo.js');

const posicoes = [
  { tipo: 'porta_avioes', linha: 0, coluna: 0, orientacao: 'horizontal' },
  { tipo: 'encouracado', linha: 2, coluna: 0, orientacao: 'vertical' },
  { tipo: 'submarino', linha: 9, coluna: 7, orientacao: 'horizontal' },
  { tipo: 'destroier', linha: 5, coluna: 9, orientacao: 'vertical' }
];
const montado = () => posicoes.reduce((tabuleiro, navio) => posicionarNavio(tabuleiro, navio), criarTabuleiro());
const casasComNavio = tabuleiro => {
  const casas = [];
  for (let l = 0; l < 10; l++) for (let c = 0; c < 10; c++) if (obterCasa(tabuleiro, l, c).navio) casas.push([l, c]);
  return casas;
};

test('BN01: tabuleiro 10 x 10 começa vazio e sem frota', () => {
  const tabuleiro = criarTabuleiro();
  assert.equal(tabuleiro.tamanho, 10);
  assert.deepEqual(casasComNavio(tabuleiro), []);
  assert.equal(frotaCompleta(tabuleiro), false);
  assert.deepEqual(obterCasa(tabuleiro, 9, 9), { navio: null, atingida: false });
});

test('BN02: frota tem um navio de cada tipo com 5, 4, 3 e 2 casas', () => {
  assert.deepEqual(FROTA, { porta_avioes: 5, encouracado: 4, submarino: 3, destroier: 2 });
  const tabuleiro = montado();
  assert.equal(frotaCompleta(tabuleiro), true);
  assert.equal(casasComNavio(tabuleiro).length, 14);
});

test('BN03: posicionamento horizontal e vertical ocupa as casas corretas', () => {
  const tabuleiro = montado();
  for (let c = 0; c < 5; c++) assert.equal(obterCasa(tabuleiro, 0, c).navio, 'porta_avioes');
  assert.equal(obterCasa(tabuleiro, 0, 5).navio, null);
  for (let l = 2; l < 6; l++) assert.equal(obterCasa(tabuleiro, l, 0).navio, 'encouracado');
  assert.equal(obterCasa(tabuleiro, 6, 0).navio, null);
  assert.equal(obterCasa(tabuleiro, 9, 9).navio, 'submarino');
  assert.equal(obterCasa(tabuleiro, 6, 9).navio, 'destroier');
});

test('BN04: navio fora do tabuleiro é recusado', () => {
  const tabuleiro = criarTabuleiro();
  assert.throws(() => posicionarNavio(tabuleiro, { tipo: 'porta_avioes', linha: 0, coluna: 6, orientacao: 'horizontal' }), RangeError);
  assert.throws(() => posicionarNavio(tabuleiro, { tipo: 'encouracado', linha: 7, coluna: 0, orientacao: 'vertical' }), RangeError);
  assert.throws(() => posicionarNavio(tabuleiro, { tipo: 'destroier', linha: -1, coluna: 0, orientacao: 'vertical' }), RangeError);
  assert.equal(tabuleiro.navios.length, 0);
});

test('BN05: navios não podem se sobrepor, mas podem encostar', () => {
  const tabuleiro = posicionarNavio(criarTabuleiro(), posicoes[0]);
  assert.throws(() => posicionarNavio(tabuleiro, { tipo: 'submarino', linha: 0, coluna: 4, orientacao: 'vertical' }), /sobrepor/);
  assert.equal(tabuleiro.navios.length, 1);
  posicionarNavio(tabuleiro, { tipo: 'submarino', linha: 1, coluna: 0, orientacao: 'horizontal' });
  assert.equal(obterCasa(tabuleiro, 1, 0).navio, 'submarino');
});

test('BN06: tipo repetido, tipo desconhecido e orientação inválida são recusados', () => {
  const tabuleiro = posicionarNavio(criarTabuleiro(), posicoes[0]);
  assert.throws(() => posicionarNavio(tabuleiro, { tipo: 'porta_avioes', linha: 5, coluna: 0, orientacao: 'horizontal' }), /já posicionado/);
  assert.throws(() => posicionarNavio(tabuleiro, { tipo: 'hidroaviao', linha: 5, coluna: 0, orientacao: 'horizontal' }), TypeError);
  assert.throws(() => posicionarNavio(tabuleiro, { tipo: 'destroier', linha: 5, coluna: 0, orientacao: 'diagonal' }), TypeError);
});

test('BN07: tiro antes da frota completa é recusado', () => {
  const tabuleiro = posicionarNavio(criarTabuleiro(), posicoes[0]);
  assert.throws(() => atirar(tabuleiro, 0, 0), /frota/);
});

test('BN08: tiro na água é registrado', () => {
  const tabuleiro = montado();
  assert.deepEqual(atirar(tabuleiro, 5, 5), { resultado: 'agua', navio: null, fimDeJogo: false });
  assert.deepEqual(obterCasa(tabuleiro, 5, 5), { navio: null, atingida: true });
  assert.equal(tabuleiro.acertos, 0);
});

test('BN09: acerto informa o navio atingido sem afundá-lo', () => {
  const tabuleiro = montado();
  assert.deepEqual(atirar(tabuleiro, 0, 2), { resultado: 'acerto', navio: 'porta_avioes', fimDeJogo: false });
  assert.equal(obterCasa(tabuleiro, 0, 2).atingida, true);
  assert.equal(navioAfundado(tabuleiro, 'porta_avioes'), false);
  assert.equal(tabuleiro.acertos, 1);
});

test('BN10: atingir todas as casas de um navio o afunda', () => {
  const tabuleiro = montado();
  assert.equal(atirar(tabuleiro, 5, 9).resultado, 'acerto');
  assert.deepEqual(atirar(tabuleiro, 6, 9), { resultado: 'afundou', navio: 'destroier', fimDeJogo: false });
  assert.equal(navioAfundado(tabuleiro, 'destroier'), true);
  assert.equal(navioAfundado(tabuleiro, 'submarino'), false);
});

test('BN11: tiro repetido não altera o estado', () => {
  const tabuleiro = montado();
  atirar(tabuleiro, 0, 0);
  atirar(tabuleiro, 4, 4);
  assert.equal(atirar(tabuleiro, 0, 0).resultado, 'repetido');
  assert.equal(atirar(tabuleiro, 4, 4).resultado, 'repetido');
  assert.equal(tabuleiro.acertos, 1);
  assert.equal(tabuleiro.tiros.size, 2);
});

test('BN12: afundar toda a frota encerra a partida', () => {
  const tabuleiro = montado();
  const casas = casasComNavio(tabuleiro);
  let ultimo;
  for (const [l, c] of casas) ultimo = atirar(tabuleiro, l, c);
  assert.equal(ultimo.resultado, 'afundou');
  assert.equal(ultimo.fimDeJogo, true);
  assert.equal(tabuleiro.acertos, 14);
  assert.ok(Object.keys(FROTA).every(tipo => navioAfundado(tabuleiro, tipo)));
  assert.throws(() => atirar(tabuleiro, 5, 5), /encerrada/);
});

test('BN13: coordenadas fora de 0..9 lançam RangeError', () => {
  const tabuleiro = montado();
  assert.throws(() => atirar(tabuleiro, 10, 0), RangeError);
  assert.throws(() => atirar(tabuleiro, 0, -1), RangeError);
  assert.throws(() => atirar(tabuleiro, 1.5, 0), RangeError);
  assert.throws(() => obterCasa(tabuleiro, 0, 10), RangeError);
});
