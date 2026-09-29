// Tabele znaków wspólne dla konwertera i parsera.
export const SUP = { ',': ',', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', n: 'ⁿ', i: 'ⁱ', x: 'ˣ', y: 'ʸ', a: 'ᵃ', b: 'ᵇ', c: 'ᶜ', d: 'ᵈ', e: 'ᵉ', k: 'ᵏ', m: 'ᵐ', t: 'ᵗ' }
export const SUB = { ',': ',', '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉', '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎', a: 'ₐ', e: 'ₑ', o: 'ₒ', x: 'ₓ', i: 'ᵢ', n: 'ₙ', k: 'ₖ', m: 'ₘ', t: 'ₜ' }

export const GREEK = { alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', varepsilon: 'ε', zeta: 'ζ', eta: 'η', theta: 'θ', vartheta: 'θ', iota: 'ι', kappa: 'κ', lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ', upsilon: 'υ', phi: 'φ', varphi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω', Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ', Pi: 'Π', Sigma: 'Σ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω' }

// [komenda, unicode, ascii]
export const SYM = [
  ['cdot', '·', '*'], ['times', '×', 'x'], ['div', '÷', '/'], ['pm', '±', '+/-'], ['mp', '∓', '-/+'],
  ['leq', '≤', '<='], ['le', '≤', '<='], ['geq', '≥', '>='], ['ge', '≥', '>='], ['neq', '≠', '!='], ['ne', '≠', '!='],
  ['approx', '≈', '~='], ['equiv', '≡', '==='], ['sim', '~', '~'], ['propto', '∝', '~'],
  ['infty', '∞', 'inf'], ['iint', '∬', 'iint'], ['oint', '∮', 'oint'], ['int', '∫', 'int'], ['sum', '∑', 'SUMA'], ['prod', '∏', 'ILOCZYN'],
  ['partial', '∂', 'd'], ['nabla', '∇', 'nabla'], ['to', '→', '->'], ['rightarrow', '→', '->'], ['leftarrow', '←', '<-'],
  ['Rightarrow', '⇒', '=>'], ['implies', '⇒', '=>'], ['Leftrightarrow', '⇔', '<=>'], ['iff', '⇔', '<=>'], ['mapsto', '↦', '|->'],
  ['notin', '∉', ' nie należy do '], ['in', '∈', ' należy do '], ['subseteq', '⊆', ' zaw.= '], ['subset', '⊂', ' zaw. '], ['cup', '∪', ' suma '], ['cap', '∩', ' iloczyn '],
  ['emptyset', '∅', 'zb.pusty'], ['varnothing', '∅', 'zb.pusty'], ['setminus', '∖', ' \\ '],
  ['forall', '∀', 'dla każdego '], ['exists', '∃', 'istnieje '], ['neg', '¬', '~'], ['land', '∧', ' i '], ['lor', '∨', ' lub '], ['wedge', '∧', ' i '], ['vee', '∨', ' lub '],
  ['angle', '∠', 'kąt '], ['perp', '⊥', ' prost. '], ['parallel', '∥', ' || '], ['triangle', '△', 'trójkąt '], ['degree', '°', '°'],
  ['ldots', '…', '...'], ['cdots', '⋯', '...'], ['dots', '…', '...'],
  ['langle', '⟨', '<'], ['rangle', '⟩', '>'], ['lfloor', '⌊', 'floor('], ['rfloor', '⌋', ')'], ['lceil', '⌈', 'ceil('], ['rceil', '⌉', ')'],
  ['quad', '  ', '  '], ['qquad', '    ', '    '],
]
export const BB = { R: 'ℝ', N: 'ℕ', Z: 'ℤ', Q: 'ℚ', C: 'ℂ' }

