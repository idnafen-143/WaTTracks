import { Project, Device, CategoryId } from '../types';

export interface GeneratedTip {
  id: string;
  title: string;
  description: string;
  category: CategoryId | 'general';
  monthlySavings: number;
  annualSavings: number;
  impact: 'High' | 'Medium' | 'Low';
  actionableStep: string;
  type: 'upgrade' | 'behavioral' | 'vampire' | 'maintenance';
}

/**
 * Generates highly personalized energy-saving tips based on the active project's device profile.
 * Computes exact monthly/annual savings utilizing user-defined wattages, usage hours, quantities, and rates.
 */
export function generatePersonalizedTips(project: Project, language: 'en' | 'fr' = 'en'): GeneratedTip[] {
  const devices = project.devices;
  const rate = project.ratePerKWh || 0.15;
  const tips: GeneratedTip[] = [];

  if (devices.length === 0) {
    return [];
  }

  const isFr = language === 'fr';

  // Helper to calculate impact based on annual savings
  const getImpact = (savings: number): 'High' | 'Medium' | 'Low' => {
    if (savings > 50) return 'High';
    if (savings > 15) return 'Medium';
    return 'Low';
  };

  // 1. Upgrades for kitchen appliances (old refrigerators, freezers, ovens, dishwasher)
  const kitchenAppliances = devices.filter(
    d => d.category === 'kitchen' && d.watts >= 100
  );

  kitchenAppliances.forEach(dev => {
    // Energy Star upgrades typically save 25% on active load
    const devAnnualKWh = (dev.watts * dev.hoursPerDay * dev.quantity) / 1000 * 365;
    const annualSavings = devAnnualKWh * 0.25 * rate;
    const monthlySavings = annualSavings / 12;

    if (annualSavings >= 1) {
      tips.push({
        id: `upgrade_kitchen_${dev.id}`,
        title: isFr 
          ? `Améliorer "${dev.name}" vers Energy Star`
          : `Upgrade "${dev.name}" to Energy Star`,
        description: isFr
          ? `Votre appareil "${dev.name}" consomme actuellement ${((dev.watts * dev.hoursPerDay * dev.quantity) / 1000).toFixed(2)} kWh par jour. Le remplacer par un modèle certifié Energy Star peut réduire son empreinte électrique jusqu'à 25%.`
          : `Your registered "${dev.name}" currently consumes ${((dev.watts * dev.hoursPerDay * dev.quantity) / 1000).toFixed(2)} kWh per day. Upgrading to an Energy Star certified model can reduce its electrical footprint by up to 25%.`,
        category: 'kitchen',
        monthlySavings,
        annualSavings,
        impact: getImpact(annualSavings),
        actionableStep: isFr
          ? `Recherchez des alternatives certifiées Energy Star avec des cotes d'efficacité énergétique élevées.`
          : `Look for Energy Star certified alternatives with high energy-efficiency ratings.`,
        type: 'upgrade',
      });
    }
  });

  // 2. Reduce usage of high-wattage devices by 1 hour
  // Focus on devices with watts >= 100 and running >= 1.5 hours (excluding 24h devices like fridges/freezers)
  const highWattageDevices = devices.filter(
    d => d.watts >= 100 && d.hoursPerDay >= 1.5 && d.name.toLowerCase().indexOf('fridge') === -1 && d.name.toLowerCase().indexOf('freezer') === -1
  );

  highWattageDevices.forEach(dev => {
    const dailyKWhSaved = (dev.watts * 1 * dev.quantity) / 1000;
    const annualSavings = dailyKWhSaved * 365 * rate;
    const monthlySavings = dailyKWhSaved * 30 * rate;

    if (annualSavings >= 1) {
      tips.push({
        id: `reduce_usage_${dev.id}`,
        title: isFr
          ? `Réduire l'utilisation de "${dev.name}" de 1 heure par jour`
          : `Reduce "${dev.name}" Daily Run by 1 Hour`,
        description: isFr
          ? `Faire fonctionner votre "${dev.name}" seulement 1 heure de moins par jour réduit la charge active sans impact sur le confort. Parfait pour les consoles de jeux, ordinateurs, radiateurs d'appoint ou lumières décoratives.`
          : `Running your "${dev.name}" for just 1 less hour each day reduces active load without impacting utility. Perfect for game consoles, computers, space heaters, or decorative lights.`,
        category: dev.category,
        monthlySavings,
        annualSavings,
        impact: getImpact(annualSavings),
        actionableStep: isFr
          ? `Configurez des minuteries de mise en veille automatique, des profils d'économie d'énergie ou définissez un rappel téléphonique pour éteindre l'appareil 1 heure plus tôt que d'habitude.`
          : `Configure automatic sleep timers, power-saving profiles, or set a phone reminder to switch off the device 1 hour earlier than usual.`,
        type: 'behavioral',
      });
    }
  });

  // 3. Lighting upgrades (incandescents, halogens)
  const highWattageBulbs = devices.filter(
    d => d.category === 'lighting' && d.watts >= 25
  );

  highWattageBulbs.forEach(dev => {
    // LED bulbs consume around 9W for 60W equivalent, saving ~85%
    const currentDailyKWh = (dev.watts * dev.hoursPerDay * dev.quantity) / 1000;
    const targetDailyKWh = (9 * dev.hoursPerDay * dev.quantity) / 1000;
    const annualSavings = Math.max(0, (currentDailyKWh - targetDailyKWh) * 365 * rate);
    const monthlySavings = annualSavings / 12;

    if (annualSavings >= 1) {
      tips.push({
        id: `upgrade_led_${dev.id}`,
        title: isFr
          ? `Remplacer l'éclairage de "${dev.name}" par des ampoules LED`
          : `Retrofit "${dev.name}" with LED Bulbs`,
        description: isFr
          ? `Votre installation de "${dev.name}" utilise un éclairage standard à forte puissance (${dev.watts}W par ampoule). Remplacer ces ampoules par des LED de 9W à haute efficacité préserve la luminosité tout en réduisant le coût de l'électricité d'éclairage de 85%.`
          : `Your "${dev.name}" setup utilizes standard high-wattage lighting (${dev.watts}W per bulb). Replacing these bulbs with energy-efficient 9W LEDs preserves equivalent lumens while cutting lighting electricity cost by 85%.`,
        category: 'lighting',
        monthlySavings,
        annualSavings,
        impact: getImpact(annualSavings),
        actionableStep: isFr
          ? `Achetez des ampoules LED de remplacement adaptées au culot (E26, GU10, etc.) en blanc chaud pour remplacer immédiatement les anciennes ampoules.`
          : `Purchase matching socket (E26, GU10, etc.) warm-white or smart LED replacements to immediately swap out old bulbs.`,
        type: 'upgrade',
      });
    }
  });

  // 4. Heavy HVAC Smart Schedules
  const hvacUnits = devices.filter(d => d.category === 'heating_cooling');
  hvacUnits.forEach(dev => {
    // Smart scheduling or setting temperature 2°F/1°C more conservative saves ~10% of climate bills
    const devAnnualKWh = (dev.watts * dev.hoursPerDay * dev.quantity) / 1000 * 365;
    const annualSavings = devAnnualKWh * 0.12 * rate;
    const monthlySavings = annualSavings / 12;

    if (annualSavings >= 2) {
      tips.push({
        id: `smart_hvac_${dev.id}`,
        title: isFr
          ? `Optimiser la température et la planification de "${dev.name}"`
          : `Optimize "${dev.name}" Temp & Schedule`,
        description: isFr
          ? `Les équipements de chauffage et de climatisation comme votre "${dev.name}" représentent la charge utilitaire la plus lourde. Ajuster les températures de consigne de seulement 1°C (ou installer un thermostat intelligent) réduit généralement la demande d'énergie de 12%.`
          : `Heating and cooling equipment like your "${dev.name}" represents the absolute heaviest utility load. Shifting target temperatures by just 2°F (or installing a smart thermostat) typically reduces HVAC energy demand by 12%.`,
        category: 'heating_cooling',
        monthlySavings,
        annualSavings,
        impact: getImpact(annualSavings),
        actionableStep: isFr
          ? `Configurez des heures de réduction hors pointe sur votre thermostat ou utilisez un système de contrôle intelligent pour éviter de refroidir/chauffer des pièces vides.`
          : `Configure off-peak setback hours on your thermostat or use a smart control system to avoid cooling/heating empty rooms.`,
        type: 'behavioral',
      });
    }
  });

  // 5. Office & Entertainment Standby Vampire loads
  const vampireLoads = devices.filter(
    d => (d.category === 'office_tech' || d.category === 'entertainment' || d.category === 'other') && d.hoursPerDay >= 10
  );

  vampireLoads.forEach(dev => {
    // Parasitic standby draw is typically ~8W when not actively used (assuming 16 hours of standby per day)
    const standbyHours = Math.max(2, 24 - dev.hoursPerDay);
    const standbyDraw = 10; // 10W average standby draw
    const annualSavings = (standbyDraw * standbyHours * dev.quantity) / 1000 * 365 * rate;
    const monthlySavings = annualSavings / 12;

    if (annualSavings >= 0.5) {
      tips.push({
        id: `vampire_${dev.id}`,
        title: isFr
          ? `Éliminer la consommation en veille de "${dev.name}"`
          : `Kill Standby Leak on "${dev.name}"`,
        description: isFr
          ? `Les appareils électroniques comme "${dev.name}" continuent de consommer de l'énergie en veille (puissance fantôme) même éteints. Intercepter cette fuite peut économiser une énergie significative sur un an.`
          : `Electronics like "${dev.name}" continue drawing standby "phantom" power even when turned off. Intercepting this leakage can save significant energy over a year.`,
        category: dev.category,
        monthlySavings,
        annualSavings,
        impact: 'Low',
        actionableStep: isFr
          ? `Utilisez une multiprise intelligente coupe-veille ou débranchez l'appareil en cas de non-utilisation prolongée.`
          : `Use a smart load-sensing power strip or unplug the device when not in use for extended periods.`,
        type: 'vampire',
      });
    }
  });

  // 6. Maintenance reminder if we have heating_cooling or kitchen (refrigerators need coil cleaning, HVAC needs filter changes)
  const hvacFilterDev = devices.find(d => d.category === 'heating_cooling');
  if (hvacFilterDev) {
    const totalHvacDaily = hvacUnits.reduce((sum, d) => sum + ((d.watts * d.hoursPerDay * d.quantity) / 1000), 0);
    // Dusty filters make HVAC consume 15% more power
    const annualSavings = totalHvacDaily * 0.15 * 365 * rate;
    const monthlySavings = annualSavings / 12;

    if (annualSavings >= 1) {
      tips.push({
        id: 'hvac_filter_maintenance',
        title: isFr
          ? `Remplacer les filtres à air d'admission CVC`
          : `Replace HVAC Intake Air Filters`,
        description: isFr
          ? `Des filtres à air obstrués étouffent le flux d'air, forçant votre système de chauffage/climatisation "${hvacFilterDev.name}" à fonctionner 15% plus longtemps et à consommer plus d'énergie pour atteindre le confort souhaité.`
          : `Clogged air filters choke air flow, forcing your heating/cooling system "${hvacFilterDev.name}" to run 15% longer and consume more power to reach target comfort.`,
        category: 'heating_cooling',
        monthlySavings,
        annualSavings,
        impact: getImpact(annualSavings),
        actionableStep: isFr
          ? `Inspectez et remplacez vos filtres d'admission CVC tous les 90 jours. Notez les dimensions (ex. 20x20x1).`
          : `Inspect and swap your HVAC intake filters every 90 days. Keep records of sizing (e.g. 20x20x1).`,
        type: 'maintenance',
      });
    }
  }

  // Sort tips so high savings are at the top
  return tips.sort((a, b) => b.annualSavings - a.annualSavings);
}
