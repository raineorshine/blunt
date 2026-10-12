// Every rule a Stop hook enforces, for the code that has to know all of them:
// the mod that hides a refused reply checks a reply against each.

import { rule as checkNoise } from './check-noise.mjs'
import { rule as gitNoise } from './git-noise.mjs'
import { rule as labelLeads } from './label-leads.mjs'

export const RULES = [gitNoise, checkNoise, labelLeads]
