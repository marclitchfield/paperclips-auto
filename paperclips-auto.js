(() => {
  if (window.__paperclips_auto === true)
    return;
  window.__paperclips_auto = true;

  const ACCEPT_OFFER = false;
  let cache = {};

  const gameRules = [
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
      timeout: 4000,
      control: () => [].find.call(document.querySelectorAll('.projectButton:enabled'), (p) => {
        const title = p.querySelector('span').innerText;
        return title.trim().length > 0 && title.indexOf(ACCEPT_OFFER ? 'Reject' : 'Accept') < 0;
      }),
      condition: () => true
    },
    {
      description: 'tournaments',
      condition: () => exists('tournamentManagement'),
      rules: [
        {
          description: 'pick strategy',
          control: 'stratPicker',
          condition: () => el('stratPicker').selectedIndex !== Math.min(4, el('stratPicker').querySelectorAll('option').length-1),
          action: (control) => control.selectedIndex = Math.min(4, control.querySelectorAll('option').length - 1)
        },
        {
          description: 'run tournament',
          control: 'btnRunTournament',
          condition: () => true
        },
        {
          description: '# new tournament',
          control: 'btnNewTournament',
          condition: () => true
        }
      ]
    },
    {
      description: '# q compute',
      control: 'btnQcompute',
      continue: true,
      condition: () => {
        var chips = document.querySelectorAll('.qChip');
        if (chips.length > 0) {
          const q = [].reduce.call(chips, (sum, el) => sum + parseFloat(el.style.opacity), 0) / chips.length;
          return q > 0;
        }
      }
    },
    {
      description: 'swarm control',
      condition: () => exists('swarmEngine'),
      rules: [
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
          description: 'swarm computing adjustment',
          control: 'slider',
          condition: () => exists('swarmSliderDiv') && parseFloat(el('slider').value) !== 150,
          action: (control) => control.value = 150
        }
      ]
    },
    {
      description: 'phase 1: money to paperclips',
      condition: () => exists('businessDiv'),
      rules: [
        {
          description: '# buy wire',
          control: 'btnBuyWire',
          condition: () => val('wire') < 10
        },
        {
          description: 'expand marketing',
          control: 'btnExpandMarketing',
          condition: () => val('funds') > val('adCost') + val('wireCost')
            && val('marketingLvl') < 14
        },    
        {
          description: '# lower price',
          timeout: 2000,
          control: 'btnLowerPrice',
          condition: () => val('unsoldClips') > val('avgSales') * 10 && val('margin') > 0.01
        },
        {
          description: '# raise price',
          timeout: 2000,
          control: 'btnRaisePrice',
          condition: () => val('unsoldClips') < val('avgSales') / 10
            && val('wire') > 0 && val('margin') < 1.00
        },
        {
          description: 'investment management',
          condition: () => exists('investmentEngine'),
          rules: [
            {
              description: 'improve investments',
              control: 'btnImproveInvestments',
              condition: () => true
            },
            {
              description: 'investment strategy',
              control: 'investStrat',
              condition: () => el('investStrat').selectedIndex != 2,
              action: (control) => control.selectedIndex = 2     
            },
            {
              description: 'withdraw',
              control: 'btnWithdraw',
              condition: () => (val('investmentBankroll') + val('funds') > [].reduce.call(document.querySelectorAll('.projectButton'), (min, el) => { 
                  const match = el.innerText.match(/\(\$(.*)\)/);
                  return Math.min(min, match ? match[1].replace(/,/g, '') : min);
                }, Number.MAX_VALUE)
                  || val('clipmakerRate') === 0)
            },
            {
              description: 'invest',
              control: 'btnInvest',
              timeout: 10000,
              condition: () => ((val('portValue') < 10000000 && val('funds') > 900000) || val('portValue') < 30000)
                && val('wire') > 5000
            }
          ]
        },
        {
          description: 'buy autoclippers',
          control: 'btnMakeClipper',
          condition: () => val('clipmakerLevel2') < Math.min(val('marketingLvl')*12, 100)
            && val('funds') > val('clipperCost') + val('wireCost')
        },
        {
          description: 'buy megaclippers',
          control: 'btnMakeMegaClipper',
          condition: () => exists('megaClipperDiv')
            && val('funds') > val('megaClipperCost') + val('wireCost')
            && val('megaClipperLevel') < 80
        },
        {
          description: '# make paperclip',
          control: 'btnMakePaperclip',
          condition: () => val('clipmakerLevel2') < 20
        }
      ]
    },
    {
      description: 'phase 2: earth to paperclips',
      condition: () => exists('powerDiv'),
      rules: [
        {
          description: 'make factory',
          timeout: 120,
          control: 'btnMakeFactory',
          condition: () => exists('factoryDiv')
            && (val('factoryLevelDisplay') < 200)
            && ((val('powerConsumptionRate')+100) <= val('powerProductionRate')
              || val('factoryLevelDisplay') === 0)
        },
        {
          description: '# make battery tower',
          control: 'btnMakeBattery',
          condition: () => exists('powerDiv')
            && val('maxStorage') <= val('powerProductionRate')*100
        },
        {
          description: '# make harvester x 1000',
          control: 'btnHarvesterx1000',
          condition: () => exists('harvesterDiv') 
            && (val('harvesterLevelDisplay')+1000 <= 7 * val('factoryLevelDisplay') ** 2)
            && ((val('powerConsumptionRate')+100) <= val('powerProductionRate'))
            && (val('availableMatterDisplay') > 0)
        },
        {
          description: '# make wire drone x 100',
          control: 'btnWireDronex1000',
          condition: () => exists('wireDroneDiv')
            && (val('wireDroneLevelDisplay')+1000 <= 7 * val('factoryLevelDisplay') ** 2)
            && ((val('powerConsumptionRate')+100) <= val('powerProductionRate'))
            && (val('availableMatterDisplay') > 0)
        },
        {
          description: '# make harvester x 100',
          control: 'btnHarvesterx100',
          condition: () => exists('harvesterDiv') 
            && (val('harvesterLevelDisplay')+100 <= 7 * val('factoryLevelDisplay') ** 2)
            && (val('harvesterLevelDisplay')+1000 > 7 * val('factoryLevelDisplay') ** 2)
            && ((val('powerConsumptionRate')+100) <= val('powerProductionRate'))
            && (val('availableMatterDisplay') > 0)
        },
        {
          description: '# make wire drone x 100',
          control: 'btnWireDronex100',
          condition: () => exists('wireDroneDiv')
            && (val('wireDroneLevelDisplay')+100 <= 7 * val('factoryLevelDisplay') ** 2)
            && (val('wireDroneLevelDisplay')+1000 > 7 * val('factoryLevelDisplay') ** 2)
            && ((val('powerConsumptionRate')+100) <= val('powerProductionRate'))
            && (val('availableMatterDisplay') > 0)
        },
        {
          description: '# make harvester x 10',
          control: 'btnHarvesterx10',
          condition: () => exists('harvesterDiv') 
            && (val('harvesterLevelDisplay')+10 <= 7 * val('factoryLevelDisplay') ** 2)
            && (val('harvesterLevelDisplay')+100 > 7 * val('factoryLevelDisplay') ** 2)
            && ((val('powerConsumptionRate')+100) <= val('powerProductionRate'))
            && (val('availableMatterDisplay') > 0)
        },
        {
          description: '# make wire drone x 10',
          control: 'btnWireDronex10',
          condition: () => exists('wireDroneDiv')
            && (val('wireDroneLevelDisplay')+10 <= 7 * val('factoryLevelDisplay') ** 2)
            && (val('wireDroneLevelDisplay')+100 > 7 * val('factoryLevelDisplay') ** 2)
            && ((val('powerConsumptionRate')+100) <= val('powerProductionRate'))
            && (val('availableMatterDisplay') > 0)
        },
        {
          description: '# make harvester',
          control: 'btnMakeHarvester',
          condition: () => exists('harvesterDiv') 
            && (val('harvesterLevelDisplay') <= 7 * val('factoryLevelDisplay') ** 2)
            && (val('harvesterLevelDisplay')+10 > 7 * val('factoryLevelDisplay') ** 2)
            && (((val('powerConsumptionRate')+100) <= val('powerProductionRate'))
              || val('harvesterLevelDisplay') === 0)
            && (val('availableMatterDisplay') > 0)
        },
        {
          description: '# make wire drone',
          control: 'btnMakeWireDrone',
          condition: () => exists('wireDroneDiv')
            && (val('wireDroneLevelDisplay') <= 7 * val('factoryLevelDisplay') ** 2)
            && (val('wireDroneLevelDisplay')+10 > 7 * val('factoryLevelDisplay') ** 2)
            && (((val('powerConsumptionRate')+100) <= val('powerProductionRate'))
              || val('wireDroneLevelDisplay') === 0)
            && (val('availableMatterDisplay') > 0)
        },
        {
          description: 'factory reboot',
          control: 'btnFactoryReboot',
          condition: () => val('clipmakerRate') === 0
            && val('availableMatterDisplay') === 0
            && val('acquiredMatterDisplay') === 0
        },
        {
          description: '# make solar farm',
          control: 'btnMakeFarm',
          condition: () => exists('powerDiv')
            && (val('powerConsumptionRate')+val('harvesterLevelDisplay')+200) >= val('powerProductionRate')
            && (val('factoryLevelDisplay') > 0)
            && ((val('harvesterLevelDisplay') > 0 && val('wireDroneLevelDisplay') > 0)
              || val('powerProductionRate') == 0)
        }
      ]
    },
    {
      description: 'phase 3: the universe to paperclips',
      condition: () => exists('probeDesignDiv'),
      rules: [
        {
          description: 'increase probe trust',
          control: 'btnIncreaseProbeTrust',
          condition: () => true
        },
        {
          description: 'increase max trust',
          control: 'btnIncreaseMaxTrust',
          condition: () => true
        },
        {
          description: 'raise probe speed',
          control: 'btnRaiseProbeSpeed',
          condition: () => val('probeSpeedDisplay') < Math.min(5, Math.floor(val('probeTrustDisplay') 
            * 0.1 * (exists('combatButtonDiv') ? 0.8 : 1)))
        },
        {
          description: 'lower probe speed',
          control: 'btnLowerProbeSpeed',
          condition: () => val('probeSpeedDisplay') > Math.floor(val('probeTrustDisplay') 
            * 0.1 * (exists('combatButtonDiv') ? 0.8 : 1))
        },
        {
          description: 'raise probe nav',
          control: 'btnRaiseProbeNav',
          condition: () => val('probeNavDisplay') < Math.min(10, Math.floor(val('probeTrustDisplay') 
            * 0.08 * (exists('combatButtonDiv') ? 0.8 : 1)))
        },
        {
          description: 'lower probe nav',
          control: 'btnLowerProbeNav',
          condition: () => val('probeNavDisplay') > Math.floor(val('probeTrustDisplay') 
            * 0.08 * (exists('combatButtonDiv') ? 0.8 : 1))
        },
        {
          description: 'raise probe rep',
          control: 'btnRaiseProbeRep',
          condition: () => val('probeRepDisplay') < Math.min(10, Math.floor(val('probeTrustDisplay') 
            * 0.35 * (exists('combatButtonDiv') ? 0.8 : 1)))
        },
        {
          description: 'lower probe rep',
          control: 'btnLowerProbeRep',
          condition: () => val('probeRepDisplay') > Math.floor(val('probeTrustDisplay') 
            * 0.35 * (exists('combatButtonDiv') ? 0.8 : 1))
        },
        {
          description: 'raise probe haz',
          control: 'btnRaiseProbeHaz',
          condition: () => val('probeHazDisplay') < Math.min(10, Math.floor(val('probeTrustDisplay') 
            * 0.35 * (exists('combatButtonDiv') ? 0.8 : 1)))
        },
        {
          description: 'lower probe haz',
          control: 'btnLowerProbeHaz',
          condition: () => val('probeHazDisplay') > Math.floor(val('probeTrustDisplay') 
            * 0.35 * (exists('combatButtonDiv') ? 0.8 : 1))
        },
        {
          description: 'raise probe fac',
          control: 'btnRaiseProbeFac',
          condition: () => val('probeFacDisplay') === 0
        },
        {
          description: 'raise probe harv',
          control: 'btnRaiseProbeHarv',
          condition: () => val('probeHarvDisplay') === 0
        },
        {
          description: 'raise probe wire',
          control: 'btnRaiseProbeWire',
          condition: () => val('probeWireDisplay') === 0
        },
        {
          description: 'raise probe combat',
          control: 'btnRaiseProbeCombat',
          condition: () => exists('combatButtonDiv')
        },
        {
          description: 'launch probe',
          control: 'btnMakeProbe',
          condition: () => val('probesTotalDisplay') === 0 && val('probeTrustUsedDisplay') >= 20
        }
      ]
    },
    {
      description: 'make paperclip',
      control: 'btnMakePaperclip',
      condition: () => !exists('businessDiv') && !exists('powerDiv') && !exists('probeDesignDiv')
    }
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

  function evaluateRules(rules) {
    return rules.some(rule => {
      if (rule.rules && rule.condition()) {
        return evaluateRules(rule.rules);
      }

      const control = typeof(rule.control) === 'function' ? rule.control() : el(rule.control);
      if (control && enabled(control.id) && !skipForTimeout(rule) && rule.condition(control)) {
        if (typeof(rule.action) === 'function') {
          rule.action(control);
        } else {
          control.click();
        }

        updateActionPointer(control);

        if (rule.description) {
          const desc = typeof(rule.description) === 'function' ? rule.description(control) : rule.description;
          if (desc.indexOf('#') !== 0)
            console.log(desc);
        }

        return !rule.continue;
      }

      return false;
    });
  }
  
  function autoLoop() {
    cache = {};
    evaluateRules(gameRules);
  }

  const actionPointer = document.createElement('div');
  actionPointer.id = 'actionPointer';
  actionPointer.style = 'position:absolute;border-radius:4px;height:8px;width:8px;background-color:red;display:none';
  document.body.appendChild(actionPointer);

  setInterval(autoLoop, 30);

})();