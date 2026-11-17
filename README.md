# Desafio: testes de Batalha Naval

## Colaboradores

- André Filipe Caetano Mulati 24011149-2
- Pedro Massaki Carnelossi 24036481-2

## Especificação adotada

Tabuleiro **10 × 10**, com coordenadas `linha, coluna` de `0` a `9`. A frota tem exatamente um navio de cada tipo:

| Navio | Tipo na API | Casas |
| --- | --- | --- |
| Porta-aviões | `porta_avioes` | 5 |
| Encouraçado | `encouracado` | 4 |
| Submarino | `submarino` | 3 |
| Destroier (ou hidroavião) | `destroier` | 2 |

A frota completa ocupa 14 casas. Cada navio é posicionado a partir da casa inicial, na horizontal (para a direita) ou na vertical (para baixo). Navios não podem sair do tabuleiro nem se sobrepor; nesta variante, podem encostar uns nos outros. Cada tipo só pode ser posicionado uma vez.

Os tiros só começam com a frota completa. Um tiro em casa vazia é `agua`; em casa com navio é `acerto`; o tiro que atinge a última casa ainda intacta de um navio é `afundou`. Tiro em casa já atingida é `repetido` e não altera o estado. Quando todos os navios afundam, a partida termina e novos tiros são recusados.

## API implementada em `src/jogo.js`

Exportações CommonJS:

- `FROTA`: objeto com o tamanho de cada tipo de navio.
- `criarTabuleiro()`: retorna um tabuleiro 10 × 10 vazio, com `{ tamanho, navios, tiros, acertos, fimDeJogo }`.
- `posicionarNavio(tabuleiro, { tipo, linha, coluna, orientacao })`: posiciona o navio e retorna o tabuleiro. Tipo desconhecido ou orientação diferente de `horizontal`/`vertical` lança `TypeError`; navio fora do tabuleiro lança `RangeError`; sobreposição ou tipo repetido lança `Error`.
- `frotaCompleta(tabuleiro)`: retorna `true` quando os quatro navios estão posicionados.
- `atirar(tabuleiro, linha, coluna)`: retorna `{ resultado, navio, fimDeJogo }`, com `resultado` igual a `agua`, `acerto`, `afundou` ou `repetido`. Coordenada inválida lança `RangeError`; tiro com frota incompleta ou depois do fim lança `Error`.
- `navioAfundado(tabuleiro, tipo)`: retorna `true` se todas as casas do navio foram atingidas.
- `obterCasa(tabuleiro, linha, coluna)`: retorna `{ navio, atingida }`, em que `navio` é o tipo ou `null`.

## Casos de teste

| ID | Cenário e resultado esperado |
| --- | --- |
| BN01 | Tabuleiro novo é 10 × 10, sem navios e com a frota incompleta. |
| BN02 | Frota tem um navio de cada tipo, com 5, 4, 3 e 2 casas (14 no total). |
| BN03 | Posicionamento horizontal e vertical ocupa exatamente as casas esperadas. |
| BN04 | Navio que sai do tabuleiro (pela direita, por baixo ou por coordenada negativa) lança `RangeError`. |
| BN05 | Sobreposição é recusada; navios encostados são aceitos. |
| BN06 | Tipo repetido, tipo desconhecido e orientação inválida são recusados. |
| BN07 | Tiro antes de a frota estar completa é recusado. |
| BN08 | Tiro na água é registrado e não conta acerto. |
| BN09 | Acerto informa o navio atingido sem afundá-lo. |
| BN10 | Atingir todas as casas de um navio retorna `afundou`. |
| BN11 | Tiro repetido retorna `repetido` e não altera tiros nem acertos. |
| BN12 | Afundar toda a frota (14 acertos) encerra a partida; tiro posterior é recusado. |
| BN13 | Coordenada fora de `0..9` ou não inteira lança `RangeError`. |

## Como os testes funcionam

`tests/jogo.test.js` monta sempre a mesma frota em posições conhecidas (porta-aviões na linha 0, encouraçado na coluna 0, submarino no canto inferior direito e destroier na coluna 9) e executa `src/jogo.js` com tiros escolhidos para cada cenário. Usa `node:test` e `node:assert/strict`; execute `npm test` com Node.js 20 ou superior. **Resultado verificado: 13 testes aprovados.**
