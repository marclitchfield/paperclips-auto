(() => {
  if (window.__paperclips_auto === true)
    return;
  window.__paperclips_auto = true;

  let cache = {};

  // Global Rule Parameters
  const AcceptOffer = false;
  const MaxMemory = 250;
  const MemoryToProcessorsRatio = 2;
  const PreferredStrategyIndex = 4; // Greedy
  const SwarmComputingLevel = 150;
  // Phase 1 Rule Parameters
  const MinWire = 10;
  const MaxMarketing = 14;
  const MinClipPrice = 0.01;
  const MaxClipPrice = 1.00;
  const UnsoldClipsToSalesRatio = 10;
  const AutoclipperToMarketingRatio = 12;
  const MaxAutoclippers = 100;
  const MaxMegaclippers = 80;
  const MaxAutoclippersForManualClipping = 20;
  const InvestmentStrategyIndex = 2; // High risk
  const MinWireForInvestment = 5000;
  const MinPassiveInvestmentLevel = 30000;
  const MinActiveInvestmentLevel = 10000000;
  const MinFundsForActiveInvestment = 900000;
  // Phase 2 Rule Parameters
  const MaxDrones = 50000;
  const MaxFactories = 160;
  const PowerProductionBias = 100;
  const StorageToPowerProductionRatio = 70;
  const DroneToFactorySquaredRatio = 7;
  const FarmDroneBias = 200;
  // Phase 3 Rule Parameters
  const MaxProbeSpeed = 5;
  const MaxProbeNav = 10;
  const MaxProbeRep = 10;
  const MaxProbeHaz = 10;
  const MaxProbeFac = 1;
  const MaxProbeHarv = 1;
  const MaxProbeWire = 1;
  // non-combat probes
  const ProbeSpeedPercent = 0.10; 
  const ProbeNavPercent = 0.09;
  const ProbeRepPercent = 0.35;
  const ProbeHazPercent = 0.35;
  const ProbeFacPercent = 0.09;
  const ProbeHarvPercent = 0.09;
  const ProbeWirePercent = 0.09;
  // combat is independent of non-combat percentages
  const ProbeCombatPercent = 0.20;

  function validateProbePercentages() {
    const percentages = [ProbeSpeedPercent, ProbeNavPercent, ProbeRepPercent, ProbeHazPercent, 
      ProbeFacPercent, ProbeHarvPercent, ProbeWirePercent];
    const precombatAllocation = percentages.reduce((acc, pct) => acc + Math.floor(20 * pct), 0);
    const minCombatAllocation = percentages.reduce((acc, pct) => 
      Math.min(acc, Math.floor(20 * (1-ProbeCombatPercent) * pct)), Number.MAX_VALUE);

    if (precombatAllocation !== 20)
      throw 'Non-Combat Probe Allocation does not equal 20';
    if (minCombatAllocation === 0)
      throw 'Combat Probe Allocation will reduce a probe to 0'
  }

  const gameRules = [
    {
      description: 'add processor',
      timeout: 100,
      control: 'btnAddProc',
      condition: () => exists('processorDisplay')
        && (val('processors')*MemoryToProcessorsRatio < val('memory')
          || val('memory') >= MaxMemory)
    },
    {
      description: 'add memory',
      timeout: 62,
      control: 'btnAddMem',
      condition: () => exists('memoryDisplay') && val('memory') < MaxMemory
    },
    {
      description: (control) => 'project: ' + control.querySelector('span').innerText,
      timeout: 4000,
      control: () => [].find.call(document.querySelectorAll('.projectButton:enabled'), (p) => {
        const title = p.querySelector('span').innerText;
        return title.trim().length > 0 && title.indexOf(AcceptOffer ? 'Reject' : 'Accept') < 0;
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
          condition: () => el('stratPicker').selectedIndex !== Math.min(PreferredStrategyIndex, el('stratPicker').querySelectorAll('option').length-1),
          action: (control) => control.selectedIndex = Math.min(PreferredStrategyIndex, control.querySelectorAll('option').length - 1)
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
          condition: () => exists('swarmSliderDiv') && parseFloat(el('slider').value) !== SwarmComputingLevel,
          action: (control) => control.value = SwarmComputingLevel
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
          condition: () => val('wire') < MinWire
        },
        {
          description: 'expand marketing',
          control: 'btnExpandMarketing',
          condition: () => val('funds') > val('adCost') + val('wireCost')
            && val('marketingLvl') < MaxMarketing
        },    
        {
          description: '# lower price',
          timeout: 2000,
          control: 'btnLowerPrice',
          condition: () => val('unsoldClips') > val('avgSales') * UnsoldClipsToSalesRatio 
            && val('margin') > MinClipPrice
        },
        {
          description: '# raise price',
          timeout: 2000,
          control: 'btnRaisePrice',
          condition: () => val('unsoldClips') < val('avgSales') / UnsoldClipsToSalesRatio
            && val('wire') > MinWire && val('margin') < MaxClipPrice
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
              condition: () => el('investStrat').selectedIndex != InvestmentStrategyIndex,
              action: (control) => control.selectedIndex = InvestmentStrategyIndex
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
              condition: () => ((val('portValue') < MinActiveInvestmentLevel && val('funds') > MinFundsForActiveInvestment) 
                  || val('portValue') < MinPassiveInvestmentLevel)
                && val('wire') > MinWireForInvestment
            }
          ]
        },
        {
          description: 'buy autoclippers',
          control: 'btnMakeClipper',
          condition: () => val('clipmakerLevel2') < Math.min(val('marketingLvl')*AutoclipperToMarketingRatio, MaxAutoclippers)
            && val('funds') > val('clipperCost') + val('wireCost')
        },
        {
          description: 'buy megaclippers',
          control: 'btnMakeMegaClipper',
          condition: () => exists('megaClipperDiv')
            && val('funds') > val('megaClipperCost') + val('wireCost')
            && val('megaClipperLevel') < MaxMegaclippers
        },
        {
          description: '# make paperclip',
          control: 'btnMakePaperclip',
          condition: () => val('clipmakerLevel2') < MaxAutoclippersForManualClipping
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
            && (val('factoryLevelDisplay') < MaxFactories)
            && ((val('powerConsumptionRate')+PowerProductionBias) <= val('powerProductionRate')
              || val('factoryLevelDisplay') === 0)
        },
        {
          description: '# make battery tower',
          control: 'btnMakeBattery',
          condition: () => exists('powerDiv')
            && val('maxStorage') <= val('powerProductionRate')*StorageToPowerProductionRatio
        },
        {
          description: 'drone manufacturing',
          condition: () => exists('harvesterDiv') && exists('wireDroneDiv'),
          rules: [
            {
              description: '# make harvester x 1000',
              control: 'btnHarvesterx1000',
              condition: () => shouldMakeDrone(val('harvesterLevelDisplay'), 1000)
            },
            {
              description: '# make wire drone x 1000',
              control: 'btnWireDronex1000',
              condition: () => shouldMakeDrone(val('wireDroneLevelDisplay'), 1000)
            },
            {
              description: '# make harvester x 100',
              control: 'btnHarvesterx100',
              condition: () => shouldMakeDrone(val('harvesterLevelDisplay'), 100)
            },
            {
              description: '# make wire drone x 100',
              control: 'btnWireDronex100',
              condition: () => shouldMakeDrone(val('wireDroneLevelDisplay'), 100)
            },
            {
              description: '# make harvester x 10',
              control: 'btnHarvesterx10',
              condition: () => shouldMakeDrone(val('harvesterLevelDisplay'), 10)
            },
            {
              description: '# make wire drone x 10',
              control: 'btnWireDronex10',
              condition: () => shouldMakeDrone(val('wireDroneLevelDisplay'), 10)
            },
            {
              description: '# make harvester',
              control: 'btnMakeHarvester',
              condition: () => shouldMakeDrone(val('harvesterLevelDisplay'), 1)
                || val('harvesterLevelDisplay') === 0
            },
            {
              description: '# make wire drone',
              control: 'btnMakeWireDrone',
              condition: () => shouldMakeDrone(val('wireDroneLevelDisplay'), 1)
                || val('wireDroneLevelDisplay') === 0
            }
          ]
        },
        {
          description: '# make solar farm',
          control: 'btnMakeFarm',
          condition: () => exists('powerDiv')
            && (val('powerConsumptionRate')+val('harvesterLevelDisplay')+FarmDroneBias) >= val('powerProductionRate')
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
          condition: () => shouldRaiseProbeLevel(val('probeSpeedDisplay'), MaxProbeSpeed, ProbeSpeedPercent)
        },
        {
          description: 'lower probe speed',
          control: 'btnLowerProbeSpeed',
          condition: () => shouldLowerProbeLevel(val('probeSpeedDisplay'), ProbeSpeedPercent)
        },
        {
          description: 'raise probe nav',
          control: 'btnRaiseProbeNav',
          condition: () => shouldRaiseProbeLevel(val('probeNavDisplay'), MaxProbeNav, ProbeNavPercent)
        },
        {
          description: 'lower probe nav',
          control: 'btnLowerProbeNav',
          condition: () => shouldLowerProbeLevel(val('probeNavDisplay'), ProbeNavPercent)
        },
        {
          description: 'raise probe rep',
          control: 'btnRaiseProbeRep',
          condition: () => shouldRaiseProbeLevel(val('probeRepDisplay'), MaxProbeRep, ProbeRepPercent)
        },
        {
          description: 'lower probe rep',
          control: 'btnLowerProbeRep',
          condition: () => shouldLowerProbeLevel(val('probeRepDisplay'), ProbeRepPercent)
        },
        {
          description: 'raise probe haz',
          control: 'btnRaiseProbeHaz',
          condition: () => shouldRaiseProbeLevel(val('probeHazDisplay'), MaxProbeHaz, ProbeHazPercent)
        },
        {
          description: 'lower probe haz',
          control: 'btnLowerProbeHaz',
          condition: () => shouldLowerProbeLevel(val('probeHazDisplay'), ProbeHazPercent)
        },
        {
          description: 'raise probe fac',
          control: 'btnRaiseProbeFac',
          condition: () => shouldRaiseProbeLevel(val('probeFacDisplay'), MaxProbeFac, ProbeFacPercent)
        },
        {
          description: 'lower probe fac',
          control: 'btnLowerProbeFac',
          condition: () => shouldLowerProbeLevel(val('probeFacDisplay'), ProbeFacPercent)
        },
        {
          description: 'raise probe harv',
          control: 'btnRaiseProbeHarv',
          condition: () => shouldRaiseProbeLevel(val('probeHarvDisplay'), MaxProbeHarv, ProbeHarvPercent)
        },
        {
          description: 'lower probe harv',
          control: 'btnLowerProbeHarv',
          condition: () => shouldLowerProbeLevel(val('probeHarvDisplay'), ProbeHarvPercent)
        },
        {
          description: 'raise probe wire',
          control: 'btnRaiseProbeWire',
          condition: () => shouldRaiseProbeLevel(val('probeWireDisplay'), MaxProbeWire, ProbeWirePercent)
        },
        {
          description: 'lower probe wire',
          control: 'btnLowerProbeWire',
          condition: () => shouldLowerProbeLevel(val('probeWireDisplay'), ProbeWirePercent)
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

  function shouldMakeDrone(currentLevel, multiplier) {
    return (currentLevel + multiplier <= DroneToFactorySquaredRatio * val('factoryLevelDisplay') ** 2)
      && (currentLevel + multiplier * 10 > DroneToFactorySquaredRatio * val('factoryLevelDisplay') ** 2)
      && ((val('powerConsumptionRate')+PowerProductionBias) <= val('powerProductionRate'))
      && (currentLevel < MaxDrones)
  }

  function shouldRaiseProbeLevel(currentLevel, maxValue, targetPercentage) {
    return currentLevel < Math.min(maxValue, Math.floor(val('probeTrustDisplay') 
      * targetPercentage * (exists('combatButtonDiv') ? 1-ProbeCombatPercent : 1)))
  }

  function shouldLowerProbeLevel(currentLevel, targetPercentage) {
    return currentLevel > Math.floor(val('probeTrustDisplay') 
      * targetPercentage * (exists('combatButtonDiv') ? 1-ProbeCombatPercent : 1))
  }

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

  function skipForTimeout(rule) {
    if (!rule.timeout)
      return false;
    const now = Date.now();
    if (now < rule.valid_time) {
      return true;
    } else {
      rule.valid_time = now + rule.timeout;
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

  validateProbePercentages();

  const actionPointer = document.createElement('div');
  actionPointer.id = 'actionPointer';
  actionPointer.style = 'position:absolute;border-radius:4px;height:8px;width:8px;background-color:red;display:none';
  document.body.appendChild(actionPointer);

  setInterval(autoLoop, 30);

})();