// Every rule a Stop hook enforces, for the code that has to know all of them:
// the mod that hides a refused reply checks a reply against each.
//
// label-leads.mjs is out while the guidelines are not injected: without them
// a reply rarely carries a bold lead to refuse.

import { rule as checkNoise } from './check-noise.mjs'
import { rule as gitNoise } from './git-noise.mjs'

export const RULES = [gitNoise, checkNoise]
