import {makeProject} from '@motion-canvas/core';

import hook from './scenes/01-hook?scene';
import intro from './scenes/02-intro?scene';
import problem from './scenes/03-problem?scene';
import supervisor from './scenes/04-supervisor?scene';
import workflow from './scenes/05-workflow?scene';
import handoff from './scenes/06-handoff?scene';
import council from './scenes/07-council?scene';
import decision from './scenes/08-decision?scene';
import hybrid from './scenes/09-hybrid?scene';
import outro from './scenes/10-outro?scene';

import './fonts';
import './global.css';

export default makeProject({
  scenes: [
    hook,
    intro,
    problem,
    supervisor,
    workflow,
    handoff,
    council,
    decision,
    hybrid,
    outro,
  ],
  background: '#1a1612',
});
