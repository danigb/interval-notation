// shorthand tonal notation (with quality after number)
var IVL_TNL = '([-+]?)(\\d+)(d{1,4}|m|M|P|A{1,4})'
// standard shorthand notation (with quality before number)
var IVL_STR = '(AA|A|P|M|m|d|dd)([-+]?)(\\d+)'
var COMPOSE = '(?:(' + IVL_TNL + ')|(' + IVL_STR + '))'
var IVL_REGEX = new RegExp('^' + COMPOSE + '$')

/**
 * Parse a string with an interval in shorthand notation (https://en.wikipedia.org/wiki/Interval_(music)#Shorthand_notation)
 * and returns an object with interval properties.
 *
 * @param {String} str - the string with the interval
 * @param {Boolean} strict - (Optional) if its false, it doesn't check if the
 * interval is valid or not. For example, parse('P2') returns null
 * (because a perfect second is not a valid interval), but
 * parse('P2', false) it returns { num: 2, dir: 1, q: 'P'... }
 * @return {Object} an object properties or null if not valid interval string
 * The returned object contains:
 * - `num`: the interval number
 * - `q`: the interval quality string (M is major, m is minor, P is perfect...)
 * - `simple`: the simplified number (from 1 to 7)
 * - `dir`: the interval direction (1 ascending, -1 descending)
 * - `type`: the interval type (P is perfectable, M is majorable)
 * - `alt`: the alteration, a numeric representation of the quality
 * - `oct`: the number of octaves the interval spans. 0 for simple intervals.
 * - `size`: the size of the interval in semitones
 * @example
 * var parse = require('interval-notation').parse
 * parse('M3')
 * // => { num: 3, q: 'M', dir: 1, simple: 3,
 * //      type: 'M', alt: 0, oct: 0, size: 4 }
 */
export function parse (str, strict) {
  if (typeof str !== 'string') return null
  var m = IVL_REGEX.exec(str)
  if (!m) return null
  var i = { num: +(m[3] || m[8]), q: m[4] || m[6] }
  i.dir = (m[2] || m[7]) === '-' ? -1 : 1
  var step = (i.num - 1) % 7
  i.simple = step + 1
  i.type = TYPES[step]
  i.alt = qToAlt(i.type, i.q)
  i.oct = Math.floor((i.num - 1) / 7)
  i.size = i.dir * (SIZES[step] + i.alt + 12 * i.oct)
  if (strict !== false) {
    if (i.type === 'M' && i.q === 'P') return null
  }
  return i
}
var SIZES = [0, 2, 4, 5, 7, 9, 11]

var TYPES = 'PMMPPMM'
/**
 * Get the type of interval. Can be perfectavle ('P') or majorable ('M')
 * @param {Integer} num - the interval number
 * @return {String} `P` if it's perfectable, `M` if it's majorable.
 */
export function type (num) {
  return TYPES[(num - 1) % 7]
}

function dirStr (dir) { return dir === -1 ? '-' : '' }
function num (simple, oct) { return simple + 7 * oct }

/**
 * Build a shorthand interval notation string from properties.
 *
 * @param {Integer} simple - the interval simple number (from 1 to 7)
 * @param {Integer} alt - the quality expressed in numbers. 0 means perfect
 * or major, depending of the interval number.
 * @param {Integer} oct - the number of octaves the interval spans.
 * 0 por simple intervals. Positive number.
 * @param {Integer} dir - the interval direction: 1 ascending, -1 descending.
 * @example
 * var interval = require('interval-notation')
 * interval.shorthand(3, 0, 0, 1) // => 'M3'
 * interval.shorthand(3, -1, 0, -1) // => 'm-3'
 * interval.shorthand(3, 1, 1, 1) // => 'A10'
 */
export function shorthand (simple, alt, oct, dir) {
  return altToQ(simple, alt) + dirStr(dir) + num(simple, oct)
}
/**
 * Build a special shorthand interval notation string from properties.
 * The special shorthand interval notation changes the order or the standard
 * shorthand notation so instead of 'M-3' it returns '-3M'.
 *
 * The standard shorthand notation has a string 'A4' (augmented four) that can't
 * be differenciate from 'A4' (the A note in 4th octave), so the purpose of this
 * notation is avoid collisions
 *
 * @param {Integer} simple - the interval simple number (from 1 to 7)
 * @param {Integer} alt - the quality expressed in numbers. 0 means perfect
 * or major, depending of the interval number.
 * @param {Integer} oct - the number of octaves the interval spans.
 * 0 por simple intervals. Positive number.
 * @param {Integer} dir - the interval direction: 1 ascending, -1 descending.
 * @example
 * var interval = require('interval-notation')
 * interval.build(3, 0, 0, 1) // => '3M'
 * interval.build(3, -1, 0, -1) // => '-3m'
 * interval.build(3, 1, 1, 1) // => '10A'
 */
export function build (simple, alt, oct, dir) {
  return dirStr(dir) + num(simple, oct) + altToQ(simple, alt)
}

/**
 * Get an alteration number from an interval quality string.
 * It accepts the standard `dmMPA` but also sharps and flats.
 *
 * @param {Integer|String} num - the interval number or a string representing
 * the interval type ('P' or 'M')
 * @param {String} quality - the quality string
 * @return {Integer} the interval alteration
 * @example
 * qToAlt('M', 'm') // => -1 (for majorables, 'm' is -1)
 * qToAlt('P', 'A') // => 1 (for perfectables, 'A' means 1)
 * qToAlt('M', 'P') // => null (majorables can't be perfect)
 */
export function qToAlt (num, q) {
  var t = typeof num === 'number' ? type(num) : num
  if (q === 'M' && t === 'M') return 0
  if (q === 'P' && t === 'P') return 0
  if (q === 'm' && t === 'M') return -1
  if (/^A+$/.test(q)) return q.length
  if (/^d+$/.test(q)) return t === 'P' ? -q.length : -q.length - 1
  return null
}

function fillStr (s, n) { return Array(Math.abs(n) + 1).join(s) }
/**
 * Get interval quality from interval type and alteration
 *
 * @function
 * @param {Integer|String} num - the interval number of the the interval
 * type ('M' for majorables, 'P' for perfectables)
 * @param {Integer} alt - the interval alteration
 * @return {String} the quality string
 * @example
 * altToQ('M', 0) // => 'M'
 */
export function altToQ (num, alt) {
  var t = typeof num === 'number' ? type(Math.abs(num)) : num
  if (alt === 0) return t === 'M' ? 'M' : 'P'
  else if (alt === -1 && t === 'M') return 'm'
  else if (alt > 0) return fillStr('A', alt)
  else if (alt < 0) return fillStr('d', t === 'P' ? alt : alt + 1)
  else return null
}

