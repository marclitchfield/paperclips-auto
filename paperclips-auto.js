(function() {

  const ACCEPT_OFFER = false;
  let cache = {};

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
      timeout: 62,
      control: 'btnAddMem',
      condition: () => exists('memoryDisplay') && val('memory') < 250
    },
    {
      description: (control) => 'project: ' + control.querySelector('span').innerText,
      timeout: 62,
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
        && (val('investmentBankroll') + val('funds') > [].reduce.call(document.querySelectorAll('.projectButton'), (min, el) => { 
          const match = el.innerText.match(/\(\$(.*)\)/);
          return Math.min(min, match ? match[1].replace(/,/g, '') : min);
        }, 50000000)
          || val('clipmakerRate') === 0)
    },
    {
      description: 'invest',
      phase: 1,
      control: 'btnInvest',
      timeout: 10000,
      condition: () => exists('investmentEngine')
        && ((val('portValue') < 10000000
        && val('funds') > 900000
        && val('wire') > 10000) || val('portValue') === 0)
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
      condition: () => exists('megaClipperDiv')
        && val('funds') > val('megaClipperCost') + val('wireCost')
        && val('megaClipperLevel') < 105
    },
    {
      description: '# make paperclip',
      phase: 1,
      control: 'btnMakePaperclip',
      condition: () => val('clipmakerLevel2') < 20
    },
    {
      description: 'make factory',
      phase: 2,
      timeout: 120,
      control: 'btnMakeFactory',
      condition: () => exists('factoryDiv')
        && (val('factoryLevelDisplay') < 220)
        && ((val('powerConsumptionRate')+100) <= val('powerProductionRate')
          || val('factoryLevelDisplay') === 0)
    },
    {
      description: '# make battery tower',
      phase: 2,
      control: 'btnMakeBattery',
      condition: () => exists('powerDiv')
        && val('maxStorage') <= val('powerProductionRate')*100
    },
    {
      description: '# make harvester',
      control: 'btnMakeHarvester',
      phase: 2,
      timeout: 62,
      condition: () => exists('harvesterDiv') 
        && (val('harvesterLevelDisplay') < 2.5 * val('factoryLevelDisplay') ** 2)
        && (((val('powerConsumptionRate')+100) <= val('powerProductionRate'))
          || val('harvesterLevelDisplay') === 0)
        && (val('availableMatterDisplay') > 0)
    },
    {
      description: '# make wire drone',
      phase: 2,
      timeout: 62,
      control: 'btnMakeWireDrone',
      condition: () => exists('wireDroneDiv')
        && (val('wireDroneLevelDisplay') < 2.5 * val('factoryLevelDisplay') ** 2)
        && (((val('powerConsumptionRate')+100) <= val('powerProductionRate'))
          || val('wireDroneLevelDisplay') === 0)
    },
    {
      description: '# make wire drone x 1000',
      phase: 2,
      timeout: 62,
      control: 'btnWireDronex1000',
      condition: () => exists('wireDroneDiv')
        && val('availableMatterDisplay') === 0
        && val('acquiredMatterDisplay') !== 0
        && val('wireDroneLevelDisplay') < 50000
        && val('factoryLevelDisplay') > 200
    },
    {
      description: 'factory reboot',
      phase: 2,
      control: 'btnFactoryReboot',
      condition: () => val('clipmakerRate') === 0
        && val('availableMatterDisplay') === 0
        && val('acquiredMatterDisplay') === 0
    },
    {
      description: '# make solar farm',
      phase: 2,
      control: 'btnMakeFarm',
      condition: () => exists('powerDiv')
        && (val('powerConsumptionRate')+val('harvesterLevelDisplay')+200) >= val('powerProductionRate')
        && ((val('harvesterLevelDisplay') > 0 && val('wireDroneLevelDisplay') > 0)
          || val('powerProductionRate') == 0)
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
      condition: () => val('probeSpeedDisplay') < Math.min(5, Math.floor(val('probeTrustDisplay') 
        * 0.2 * (exists('combatButtonDiv') ? 0.8 : 1)))
    },
    {
      description: 'lower probe speed',
      phase: 3,
      control: 'btnLowerProbeSpeed',
      condition: () => val('probeSpeedDisplay') > Math.floor(val('probeTrustDisplay') 
        * 0.2 * (exists('combatButtonDiv') ? 0.8 : 1))
    },
    {
      description: 'raise probe nav',
      phase: 3,
      control: 'btnRaiseProbeNav',
      condition: () => val('probeNavDisplay') < Math.min(10, Math.floor(val('probeTrustDisplay') 
        * 0.1 * (exists('combatButtonDiv') ? 0.8 : 1)))
    },
    {
      description: 'lower probe nav',
      phase: 3,
      control: 'btnLowerProbeNav',
      condition: () => val('probeNavDisplay') > Math.floor(val('probeTrustDisplay') 
        * 0.1 * (exists('combatButtonDiv') ? 0.8 : 1))
    },
    {
      description: 'raise probe rep',
      phase: 3,
      control: 'btnRaiseProbeRep',
      condition: () => val('probeRepDisplay') < Math.min(10, Math.floor(val('probeTrustDisplay') 
        * 0.3 * (exists('combatButtonDiv') ? 0.8 : 1)))
    },
    {
      description: 'lower probe rep',
      phase: 3,
      control: 'btnLowerProbeRep',
      condition: () => val('probeRepDisplay') > Math.floor(val('probeTrustDisplay') 
        * 0.3 * (exists('combatButtonDiv') ? 0.8 : 1))
    },
    {
      description: 'raise probe haz',
      phase: 3,
      control: 'btnRaiseProbeHaz',
      condition: () => val('probeHazDisplay') < Math.min(10, Math.floor(val('probeTrustDisplay') 
        * 0.3 * (exists('combatButtonDiv') ? 0.8 : 1)))
    },
    {
      description: 'lower probe haz',
      phase: 3,
      control: 'btnLowerProbeHaz',
      condition: () => val('probeHazDisplay') > Math.floor(val('probeTrustDisplay') 
        * 0.3 * (exists('combatButtonDiv') ? 0.8 : 1))
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
      condition: () => exists('combatButtonDiv')
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
      condition: () => exists('entertainButtonDiv')
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
          const q = [].reduce.call(chips, (sum, el) => sum + parseFloat(el.style.opacity) 
, 0) / chips.length;
          return q > 0;
        }
      }
    },
    {
      description: 'make paperclip',
      phase: 4,
      control: 'btnMakePaperclip',
      condition: () => true
    },
  ]

  function el(id) {
    if (id in cache) {
      return cache[id];
    }
    const element = document.getElementById(id);
    cache[id] = element;
    return element;
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
    actionPointer.style.left = control.offsetLeft;
    actionPointer.style.top = control.offsetTop;
    actionPointer.style.display = 'block';
    clearTimeout(window.actionPointerTimeoutId);

    window.actionPointerTimeoutId = setTimeout(() => {
      actionPointer.style.display = 'none';
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
    cache = {};
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

        if (action.description) {
          const desc = typeof(action.description) === 'function' ? action.description(control) : action.description;
          if (desc.indexOf('#') !== 0)
            console.log(desc);
        }
        return true;
      }
      return false;
    });
  }

  const actionPointer = document.createElement('div');
  actionPointer.id = 'actionPointer';
  actionPointer.style = 'position:absolute;border-radius:4px;height:8px;width:8px;background-color:red;display:none';
  document.body.appendChild(actionPointer);

  setInterval(autoLoop, 30);

})();