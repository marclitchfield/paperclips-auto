(function() {

  const ACCEPT_OFFER = false;

  actions = [
    {
      description: 'add processor',
      timeout: 100,
      control: 'btnAddProc',
      condition: () => exists('processorDisplay')
        && (val('processors') < val('memory')/2 
          || val('memory') >= 250)
    },
    {
      description: 'add memory',
      timeout: 100,
      control: 'btnAddMem',
      condition: () => exists('memoryDisplay') && val('memory') < 250
    },
    {
      description: (control) => 'project: ' + control.querySelector('span').innerText,
      control: () => [].find.call(document.querySelectorAll('.projectButton:enabled'), (p) => 
        p.querySelector('span').innerText.trim() !== (ACCEPT_OFFER ? 'Reject' : 'Accept')) || {},
      condition: () => true
    },
    {
      description: '# buy wire',
      phase: 1,
      control: 'btnBuyWire',
      condition: () => val('wire') === 0
    },
    {
      description: 'expand marketing',
      phase: 1,
      control: 'btnExpandMarketing',
      condition: () => val('funds') > val('adCost') + val('wireCost')
    },    
    {
      description: '# lower price',
      phase: 1,
      timeout: 2000,
      control: 'btnLowerPrice',
      condition: () => val('unsoldClips') > Math.log10(val('clips'))*100 && val('margin') > 0.02
    },
    {
      description: '# raise price',
      phase: 1,
      timeout: 2000,
      control: 'btnRaisePrice',
      condition: () => val('unsoldClips') < Math.log10(val('clips'))*10
        && val('wire') > 0 && val('margin') < 0.10
    },
    {
      description: 'improve investments',
      phase: 1,
      control: 'btnImproveInvestments',
      condition: () => exists('investmentEngine')
    },
    {
      description: 'investment strategy',
      phase: 1,
      control: 'investStrat',
      condition: () => exists('investmentEngine') && el('investStrat').selectedIndex != 2,
      perform: (control) => control.selectedIndex = 2     
    },
    {
      description: 'withdraw',
      phase: 1,
      control: 'btnWithdraw',
      condition: () => exists('investmentEngine') 
        && ((val('investmentBankroll') > 1000000 && val('secValue') > 0)
        || val('avgSales') === 0)
    },
    {
      description: 'invest',
      phase: 1,
      control: 'btnInvest',
      timeout: 10000,
      condition: () => exists('investmentEngine')
        && ((val('portValue') < 2000000
        && val('funds') > 10000 
        && val('wire') > 3000) || val('portValue') === 0)
    },
    {
      description: 'buy autoclippers',
      phase: 1,
      control: 'btnMakeClipper',
      condition: () => val('clipmakerLevel2') < Math.min(val('marketingLvl')*10, 100)
        && val('funds') > val('clipperCost') + val('wireCost')
    },
    {
      description: 'buy megaclippers',
      phase: 1,
      control: 'btnMakeMegaClipper',
      condition: () => val('funds') > val('megaClipperCost') + val('wireCost')
        && val('megaClipperLevel') < 105
    },    
    {
      description: '# make paperclip',
      phase: 1,
      control: 'btnMakePaperclip',
      condition: () => val('clipmakerLevel2') < 20
    },
    {
      description: 'final paperclips...',
      phase: 4,
      control: 'btnMakePaperclip',
      condition: () => true
    },
    {
      description: 'make solar farm',
      phase: 2,
      control: 'btnMakeFarm',
      condition: () => val('powerConsumptionRate')+500 >= val('powerProductionRate')
    },
    {
      description: 'make battery tower',
      phase: 2,
      control: 'btnMakeBattery',
      condition: () => val('maxStorage') <= val('powerProductionRate')*100
    },
    {
      description: 'make harvester',
      phase: 2,
      timeout: 2,
      control: 'btnMakeHarvester',
      condition: () => ((val('powerConsumptionRate') < val('powerProductionRate')
        && val('harvesterLevelDisplay') <= val('factoryLevelDisplay')*200))
    },
    {
      description: 'make wire drone',
      phase: 2,
      timeout: 2,
      control: 'btnMakeWireDrone',
      condition: () => val('powerConsumptionRate') < val('powerProductionRate')
        && val('wireDroneLevelDisplay') <= val('factoryLevelDisplay')*200
    },  
    {
      description: 'make factory',
      phase: 2,
      control: 'btnMakeFactory',
      condition: () => (val('powerConsumptionRate')+500 < val('powerProductionRate'))
        || val('factoryLevelDisplay') === 0
    },
    {
      description: 'increase probe trust',
      phase: 3,
      control: 'btnIncreaseProbeTrust',
      condition: () => true
    },
    {
      description: 'increase max trust',
      phase: 3,
      control: 'btnIncreaseMaxTrust',
      condition: () => true
    },
    {
      description: 'raise probe speed',
      phase: 3,
      control: 'btnRaiseProbeSpeed',
      condition: () => val('probeSpeedDisplay') < (val('probeTrustUsedDisplay')/10)
    },
    {
      description: 'raise probe nav',
      phase: 3,
      control: 'btnRaiseProbeNav',
      condition: () => val('probeNavDisplay') < (val('probeTrustUsedDisplay')/30)
    },
    {
      description: 'raise probe rep',
      phase: 3,
      control: 'btnRaiseProbeRep',
      condition: () => val('probeRepDisplay') < (val('probeTrustUsedDisplay')/4)
    },
    {
      description: 'raise probe haz',
      phase: 3,
      control: 'btnRaiseProbeHaz',
      condition: () => val('probeHazDisplay') < (val('probeTrustUsedDisplay')/4)
    },
    {
      description: 'raise probe fac',
      phase: 3,
      control: 'btnRaiseProbeFac',
      condition: () => val('probeFacDisplay') === 0
    },
    {
      description: 'raise probe harv',
      phase: 3,
      control: 'btnRaiseProbeHarv',
      condition: () => val('probeHarvDisplay') === 0
    },
    {
      description: 'raise probe wire',
      phase: 3,
      control: 'btnRaiseProbeWire',
      condition: () => val('probeWireDisplay') === 0
    },
    {
      description: 'raise probe combat',
      phase: 3,
      control: 'btnRaiseProbeCombat',
      condition: () => val('probeCombatDisplay') < (val('probeTrustUsedDisplay')/3)
    },
    {
      description: 'launch probe',
      phase: 3,
      control: 'btnMakeProbe',
      condition: () => val('probesTotalDisplay') === 0 && val('probeTrustUsedDisplay') >= 20
    },
    {
      description: 'entertain swarm',
      control: 'btnEntertainSwarm',
      condition: () => exists('entertainButtonDiv'),
    },
    {
      description: 'synchronize swarm',
      control: 'btnSynchSwarm',
      condition: () => exists('synchButtonDiv')
    },
    {
      description: 'pick strategy',
      control: 'stratPicker',
      condition: () => exists('tournamentManagement')
        && el('stratPicker').selectedIndex !== Math.min(6, el('stratPicker').querySelectorAll('option').length-1),
      perform: (control) => control.selectedIndex = Math.min(6, control.querySelectorAll('option').length - 1)
    },
    {
      description: '# run tournament',
      control: 'btnRunTournament',
      condition: () => exists('tournamentManagement')
    },
    {
      description: '# new tournament',
      control: 'btnNewTournament',
      condition: () => exists('tournamentManagement')
    },
    {
      description: 'swarm computing adjustment',
      control: 'slider',
      condition: () => exists('tournamentManagement') && parseFloat(el('slider').value) !== 150,
      perform: (control) => control.value = 150
    },    
    {
      description: '# q compute',
      control: 'btnQcompute',
      condition: () => {
        var chips = document.querySelectorAll('.qChip');
        if (chips.length > 0) {
          const q = [].reduce.call(chips, function(sum, el) { 
            return sum + parseFloat(el.style.opacity) 
          }, 0) / chips.length;
          return q > 0;
        }
      }
    }
  ]

  function el(id) {
    return document.getElementById(id);
  }

  function val(id) {
    return parseFloat(el(id).innerHTML.replace(/,/g, ''));
  }

  function exists(id) {
    return el(id) !== null && el(id).style.display !== 'none';
  }

  function enabled(id) {
    return exists(id) && !el(id).disabled;
  }

  function detectPhase() {
    if (exists('businessDiv'))
      return 1;
    if (exists('powerDiv'))
      return 2;
    if (exists('probeDesignDiv'))
      return 3;
    
    return 4;
  }

  function updateActionPointer(control) {
    const left = control.offsetLeft;
    const top = control.offsetTop;
    actionPointer.style = `position:absolute;border-radius:4px;height:8px;width:8px;background-color:red;left:${left}px;top:${top}px`;
    clearTimeout(window.actionPointerTimeoutId);

    window.actionPointerTimeoutId = setTimeout(() => {
      actionPointer.style = '';
    }, 3000);
  }

  function skipForTimeout(action) {
    if (!action.timeout)
      return false;
    const now = Date.now();
    if (now < action.valid_time) {
      return true;
    } else {
      action.valid_time = now + action.timeout;
      return false;
    }
  }
  
  function autoLoop() {
    var currentPhase = detectPhase();
    actions.some(function(action) {
      if (action.phase !== undefined && action.phase !== currentPhase)
        return false;

      const control = typeof(action.control) === 'function' ? action.control() : el(action.control);
      if (control !== null && enabled(control.id) && !skipForTimeout(action) && action.condition(control)) {
        if (typeof(action.perform) === 'function') {
          action.perform(control);
        } else {
          control.click();
        }

        updateActionPointer(control);

        if (action.description && action.description.indexOf('#') !== 0) {
          console.log(typeof(action.description) === 'function' 
          ? action.description(control) : action.description);
        }
        return true;
      }
      return false;
    });
  }

  const actionPointer = document.createElement('div');
  actionPointer.id = 'actionPointer';
  document.body.appendChild(actionPointer);

  setInterval(autoLoop, 47);

})();