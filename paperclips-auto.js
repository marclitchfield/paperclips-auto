(function() {

  actions = [
    {
      description: 'add processor',
      control: 'btnAddProc',
      condition: () => (val('processors') < val('memory')/2)
                     || val('memory') >= 250
    },
    {
      description: 'add memory',
      control: 'btnAddMem',
      condition: () => val('memory') < 250
    },    
    {
      description: (control) => 'buy project: ' + control.querySelector('span').innerText,
      control: () => document.querySelector('.projectButton:enabled'),
      condition: () => true
    },
    {
      phase: 0,
      control: 'btnBuyWire',
      condition: () => val('wire') === 0
    },
    {
      phase: 0,
      description: 'expand marketing',
      control: 'btnExpandMarketing',
      condition: () => val('funds') > val('adCost') + val('wireCost')
    },    
    {
      phase: 0,
      timeout: 2000,
      control: 'btnLowerPrice',
      condition: () => val('unsoldClips') > Math.log10(val('clips'))*100 && val('margin') > 0.02
    },
    {
      phase: 0,
      timeout: 2000,
      control: 'btnRaisePrice',
      condition: () => val('unsoldClips') < Math.log10(val('clips'))*10
                    && val('wire') > 0 && val('margin') < 0.10
    },
    {
      phase: 0,
      description: 'improve investments',
      control: 'btnImproveInvestments',
      condition: () => exists('investmentEngine')
    },
    {
      phase: 0,
      description: 'investment strategy',
      control: 'investStrat',
      condition: () => exists('investmentEngine') && el('investStrat').selectedIndex != 2,
      perform: (control) => control.selectedIndex = 2     
    },
    {
      phase: 0,
      description: 'withdraw',
      control: 'btnWithdraw',
      condition: () => exists('investmentEngine') 
                  && ((val('investmentBankroll') > 1000000 && val('secValue') > 0)
                    || val('avgSales') === 0)
    },
    {
      phase: 0,
      description: 'invest',
      control: 'btnInvest',
      timeout: 10000,
      condition: () => exists('investmentEngine')
        && ((val('portValue') < 2000000
        && val('funds') > 10000 && val('funds') < 1000000 
        && val('wire') > 3000) || val('portValue') === 0)
    },
    {
      phase: 0,
      description: 'buy autoclippers',
      control: 'btnMakeClipper',
      condition: () => val('clipmakerLevel2') < Math.min(val('marketingLvl')*10, 100)
                    && val('funds') > val('clipperCost') + val('wireCost')
    },
    {
      phase: 0,
      description: 'buy megaclippers',
      control: 'btnMakeMegaClipper',
      condition: () => val('funds') > val('megaClipperCost') + val('wireCost')
    },    
    {
      phase: 0,
      control: 'btnMakePaperclip',
      condition: () => val('clipmakerLevel2') < 20
    },
    {
      phase: 1,
      description: 'make solar farm',
      control: 'btnMakeFarm',
      condition: () => val('powerConsumptionRate')+500 >= val('powerProductionRate')
    },
    {
      phase: 1,
      description: 'make battery tower',
      control: 'btnMakeBattery',
      condition: () => val('maxStorage') <= val('powerProductionRate')*100
    },
    {
      phase: 1,
      description: 'make harvester',
      control: 'btnMakeHarvester',
      timeout: 2,
      condition: () => ((val('powerConsumptionRate') < val('powerProductionRate')
                    && val('harvesterLevelDisplay') <= val('factoryLevelDisplay')*500))
    },
    {
      phase: 1,
      timeout: 2,
      description: 'make wire drone',
      control: 'btnMakeWireDrone',
      condition: () => val('powerConsumptionRate') < val('powerProductionRate')
                    && val('wireDroneLevelDisplay') <= val('factoryLevelDisplay')*500
    },  
    {
      phase: 1,
      description: 'make factory',
      control: 'btnMakeFactory',
      condition: () => (val('powerConsumptionRate')+500 < val('powerProductionRate'))
                     || val('factoryLevelDisplay') === 0
    },
    {
      description: 'pick strategy',
      control: 'stratPicker',
      condition: () => exists('tournamentManagement')
                    && el('stratPicker').selectedIndex < el('stratPicker').querySelectorAll('option').length-1,
      perform: (control) => control.selectedIndex = control.querySelectorAll('option').length - 1
    },
    {
      control: 'btnRunTournament',
      condition: () => exists('tournamentManagement')
    },
    {
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
      return 0;
    if (exists('powerDiv'))
      return 1;
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

      if (action.condition()) {
        const control = typeof(action.control) === 'function' ? action.control() : el(action.control);
        if (control !== null && enabled(control.id) && !skipForTimeout(action)) {
          if (typeof(action.perform) === 'function') {
            action.perform(control);
          } else {
            control.click();
          }

          updateActionPointer(control);

          if (action.description) {
            console.log(typeof(action.description) === 'function' 
            ? action.description(control) : action.description);
          }

          return true;
        }
      }
    })
  }

  const actionPointer = document.createElement('div');
  actionPointer.id = 'actionPointer';
  document.body.appendChild(actionPointer);

  setInterval(autoLoop, 47);

})();