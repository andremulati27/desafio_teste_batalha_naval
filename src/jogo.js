const TAMANHO = 10;
const FROTA = { porta_avioes: 5, encouracado: 4, submarino: 3, destroier: 2 };
const chave = (l, c) => `${l},${c}`;
const dentro = (l, c) => Number.isInteger(l) && Number.isInteger(c) && l >= 0 && l < TAMANHO && c >= 0 && c < TAMANHO;

function criarTabuleiro() {
  return { tamanho: TAMANHO, navios: [], tiros: new Set(), acertos: 0, fimDeJogo: false };
}

function navioNaCasa(tabuleiro, l, c) {
  return tabuleiro.navios.find(navio => navio.casas.some(([nl, nc]) => nl === l && nc === c)) || null;
}

function posicionarNavio(tabuleiro, { tipo, linha, coluna, orientacao }) {
  if (!Object.hasOwn(FROTA, tipo)) throw new TypeError('Tipo de navio inválido');
  if (orientacao !== 'horizontal' && orientacao !== 'vertical') throw new TypeError('Orientação deve ser horizontal ou vertical');
  if (tabuleiro.navios.some(navio => navio.tipo === tipo)) throw new Error('Navio já posicionado');
  const casas = Array.from({ length: FROTA[tipo] }, (_, i) => orientacao === 'horizontal' ? [linha, coluna + i] : [linha + i, coluna]);
  if (casas.some(([l, c]) => !dentro(l, c))) throw new RangeError('Navio fora do tabuleiro');
  if (casas.some(([l, c]) => navioNaCasa(tabuleiro, l, c))) throw new Error('Navios não podem se sobrepor');
  tabuleiro.navios.push({ tipo, tamanho: FROTA[tipo], casas, atingidas: new Set() });
  return tabuleiro;
}

function frotaCompleta(tabuleiro) {
  return Object.keys(FROTA).every(tipo => tabuleiro.navios.some(navio => navio.tipo === tipo));
}

function navioAfundado(tabuleiro, tipo) {
  const navio = tabuleiro.navios.find(n => n.tipo === tipo);
  if (!navio) throw new Error('Navio não posicionado');
  return navio.atingidas.size === navio.tamanho;
}

function atirar(tabuleiro, linha, coluna) {
  if (!dentro(linha, coluna)) throw new RangeError('Coordenada inválida');
  if (!frotaCompleta(tabuleiro)) throw new Error('A frota precisa estar completa antes dos tiros');
  if (tabuleiro.fimDeJogo) throw new Error('Partida encerrada');
  const id = chave(linha, coluna);
  const navio = navioNaCasa(tabuleiro, linha, coluna);
  if (tabuleiro.tiros.has(id)) return { resultado: 'repetido', navio: navio ? navio.tipo : null, fimDeJogo: false };
  tabuleiro.tiros.add(id);
  if (!navio) return { resultado: 'agua', navio: null, fimDeJogo: false };
  navio.atingidas.add(id);
  tabuleiro.acertos++;
  tabuleiro.fimDeJogo = tabuleiro.navios.every(n => n.atingidas.size === n.tamanho);
  const resultado = navio.atingidas.size === navio.tamanho ? 'afundou' : 'acerto';
  return { resultado, navio: navio.tipo, fimDeJogo: tabuleiro.fimDeJogo };
}

function obterCasa(tabuleiro, linha, coluna) {
  if (!dentro(linha, coluna)) throw new RangeError('Coordenada inválida');
  const navio = navioNaCasa(tabuleiro, linha, coluna);
  return { navio: navio ? navio.tipo : null, atingida: tabuleiro.tiros.has(chave(linha, coluna)) };
}

module.exports = { FROTA, criarTabuleiro, posicionarNavio, frotaCompleta, navioAfundado, atirar, obterCasa };
