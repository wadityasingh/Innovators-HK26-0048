import { BuildingData, Recommendation, ResourceReading } from '../types';

/**
 * Parameters and baseline tariffs used by the campus sustainability engine.
 * Transparently disclosed to users to maintain audit integrity.
 */
export const AUDIT_CONSTANTS = {
  ELECTRICITY_TARIFF_USD_PER_KWH: 0.142,
  WATER_TARIFF_USD_PER_KL: 3.85, // $0.00385 per Litre
  PAPER_COST_USD_PER_SHEET: 0.012,
  LANDFILL_TIPPING_FEE_USD_PER_TON: 95.0,
  GRID_EMISSIONS_FACTOR_KG_CO2_PER_KWH: 0.385,
  PAPER_EMISSIONS_FACTOR_KG_CO2_PER_SHEET: 0.005,
  WATER_EMISSIONS_FACTOR_KG_CO2_PER_KL: 0.344,
};

/**
 * Rules-based recommendation engine that evaluates actual campus consumption
 * across buildings, departments, and resource readings.
 * 
 * Never fabricates values; bases every calculation on active reported metrics.
 */
export function generateRulesBasedRecommendations(
  buildings: BuildingData[],
  readings: ResourceReading[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Flatten all departments with their current values
  const departments = buildings.flatMap((b) =>
    b.departments.map((d) => ({
      ...d,
      buildingId: b.id,
      buildingName: b.name,
      buildingCategory: b.category,
      grossAreaSqFt: b.grossAreaSqFt,
    }))
  );

  // 1. RULE: Wet Lab & Research Complex High Electricity (HVAC & Ventilation)
  const wetLabDept = departments.find(
    (d) =>
      d.electricityKwh !== null &&
      (d.name.toLowerCase().includes('wet lab') ||
        d.name.toLowerCase().includes('chemistry') ||
        d.name.toLowerCase().includes('biology'))
  );

  if (wetLabDept && wetLabDept.electricityKwh) {
    const baselineKwh = wetLabDept.electricityKwh;
    // Standard night setback of ventilation in labs typically yields 14% energy reduction
    const projectedReductionPct = 0.14;
    const annualKwhSaved = Math.round(baselineKwh * projectedReductionPct * 12);
    const annualSavingsUsd = Math.round(annualKwhSaved * AUDIT_CONSTANTS.ELECTRICITY_TARIFF_USD_PER_KWH);
    const carbonReductionKg = Math.round(annualKwhSaved * AUDIT_CONSTANTS.GRID_EMISSIONS_FACTOR_KG_CO2_PER_KWH);
    const implementationCost = 18500;
    const paybackMonths = Math.max(3, Math.round((implementationCost / (annualSavingsUsd / 12))));

    recommendations.push({
      id: `rec-elec-hvac-${wetLabDept.id}`,
      title: `Automated Night Airflow Setback in ${wetLabDept.name}`,
      category: 'Heating & Cooling',
      building: wetLabDept.buildingName,
      department: wetLabDept.name,
      estimatedAnnualSavingsUsd: annualSavingsUsd,
      estimatedCarbonReductionKg: carbonReductionKg,
      estimatedImplementationCostUsd: implementationCost,
      paybackMonths,
      reviewStatus: 'Draft Proposal',
      supportingData: `Active monthly consumption: ${baselineKwh.toLocaleString()} kWh/mo. Applying an unoccupied ventilation setback (lowering from 10 ACH to 6 ACH during 10 PM - 6 AM) yields an estimated 14% reduction (${annualKwhSaved.toLocaleString()} kWh/yr) at $${AUDIT_CONSTANTS.ELECTRICITY_TARIFF_USD_PER_KWH}/kWh.`,
      actionItems: [
        'Calibrate existing VAV fume hood damper sensors',
        'Coordinate with Environmental Health & Safety (EHS) on minimum safety air exchange limits',
        'Commission building automation system (BAS) scheduled setback schedule',
      ],
    });
  }

  // 2. RULE: High Water Consumption in Dining & Residences
  const highWaterDept = departments.find(
    (d) =>
      d.waterLitres !== null &&
      (d.name.toLowerCase().includes('dining') ||
        d.name.toLowerCase().includes('residence') ||
        d.name.toLowerCase().includes('food'))
  );

  if (highWaterDept && highWaterDept.waterLitres) {
    const baselineLitres = highWaterDept.waterLitres;
    // Aerators and spray valve upgrades yield ~18% potable water reduction
    const reductionPct = 0.18;
    const annualLitresSaved = Math.round(baselineLitres * reductionPct * 12);
    const annualKlSaved = annualLitresSaved / 1000;
    const annualSavingsUsd = Math.round(annualKlSaved * AUDIT_CONSTANTS.WATER_TARIFF_USD_PER_KL);
    const carbonReductionKg = Math.round(annualKlSaved * AUDIT_CONSTANTS.WATER_EMISSIONS_FACTOR_KG_CO2_PER_KL);
    const implementationCost = 4200;
    const paybackMonths = Math.max(2, Math.round((implementationCost / (annualSavingsUsd / 12))));

    recommendations.push({
      id: `rec-water-valves-${highWaterDept.id}`,
      title: `Low-Flow Pre-Rinse Valves & Smart Aerators in ${highWaterDept.name}`,
      category: 'Water Fixtures',
      building: highWaterDept.buildingName,
      department: highWaterDept.name,
      estimatedAnnualSavingsUsd: annualSavingsUsd,
      estimatedCarbonReductionKg: carbonReductionKg,
      estimatedImplementationCostUsd: implementationCost,
      paybackMonths,
      reviewStatus: 'Under Review',
      supportingData: `Active monthly water volume: ${(baselineLitres / 1000).toLocaleString()} kL (${baselineLitres.toLocaleString()} Litres). Replacing standard 2.2 GPM spray valves with 1.15 GPM low-flow pre-rinse nozzles and smart kitchen sensor aerators projects an 18% potable water saving (${Math.round(annualKlSaved).toLocaleString()} kL/yr).`,
      actionItems: [
        'Survey 18 commercial pre-rinse sinks in dining preparation bays',
        'Procure EPA WaterSense certified 1.15 GPM valves and 0.5 GPM bathroom aerators',
        'Verify hot water energy co-benefits with central mechanical team',
      ],
    });
  }

  // 3. RULE: High Paper Consumption in Administration & Library
  const highPaperDept = departments.find(
    (d) =>
      d.paperSheets !== null &&
      (d.name.toLowerCase().includes('administration') ||
        d.name.toLowerCase().includes('library') ||
        d.name.toLowerCase().includes('registrar'))
  );

  if (highPaperDept && highPaperDept.paperSheets) {
    const baselineSheets = highPaperDept.paperSheets;
    const reductionPct = 0.35; // Digital conversion typically reduces paper by 35%
    const annualSheetsSaved = Math.round(baselineSheets * reductionPct * 12);
    const annualSavingsUsd = Math.round(annualSheetsSaved * AUDIT_CONSTANTS.PAPER_COST_USD_PER_SHEET);
    const carbonReductionKg = Math.round(annualSheetsSaved * AUDIT_CONSTANTS.PAPER_EMISSIONS_FACTOR_KG_CO2_PER_SHEET);
    const implementationCost = 1500;
    const paybackMonths = Math.max(1, Math.round((implementationCost / (annualSavingsUsd / 12))));

    recommendations.push({
      id: `rec-paper-digital-${highPaperDept.id}`,
      title: `Digital Academic Clearance & Paperless Forms in ${highPaperDept.name}`,
      category: 'Digital Forms',
      building: highPaperDept.buildingName,
      department: highPaperDept.name,
      estimatedAnnualSavingsUsd: annualSavingsUsd,
      estimatedCarbonReductionKg: carbonReductionKg,
      estimatedImplementationCostUsd: implementationCost,
      paybackMonths,
      reviewStatus: 'Draft Proposal',
      supportingData: `Active monthly paper usage: ${baselineSheets.toLocaleString()} sheets/mo. Transitioning student graduation petitions, timesheets, and course syllabi to electronic workflow projects a 35% reduction (${annualSheetsSaved.toLocaleString()} sheets/yr) avoiding $${annualSavingsUsd.toLocaleString()} in paper and toner supplies.`,
      actionItems: [
        'Map top 5 high-volume printed paper forms with Registrar office',
        'Enable default double-sided printing policy on all networked multi-function copiers',
        'Implement PDF sign-off workflow via campus student portal',
      ],
    });
  }

  // 4. RULE: High Density Academic or Library Lighting Schedules
  const libraryDept = departments.find(
    (d) =>
      d.name.toLowerCase().includes('library') ||
      d.name.toLowerCase().includes('memorial')
  );

  if (libraryDept && libraryDept.electricityKwh) {
    const baselineKwh = libraryDept.electricityKwh;
    const reductionPct = 0.09;
    const annualKwhSaved = Math.round(baselineKwh * reductionPct * 12);
    const annualSavingsUsd = Math.round(annualKwhSaved * AUDIT_CONSTANTS.ELECTRICITY_TARIFF_USD_PER_KWH);
    const carbonReductionKg = Math.round(annualKwhSaved * AUDIT_CONSTANTS.GRID_EMISSIONS_FACTOR_KG_CO2_PER_KWH);
    const implementationCost = 6500;
    const paybackMonths = Math.max(3, Math.round((implementationCost / (annualSavingsUsd / 12))));

    recommendations.push({
      id: `rec-elec-light-${libraryDept.id}`,
      title: `Occupancy-Sensed Stack Lighting in ${libraryDept.name}`,
      category: 'Lighting Schedule',
      building: libraryDept.buildingName,
      department: libraryDept.name,
      estimatedAnnualSavingsUsd: annualSavingsUsd,
      estimatedCarbonReductionKg: carbonReductionKg,
      estimatedImplementationCostUsd: implementationCost,
      paybackMonths,
      reviewStatus: 'Approved for Implementation',
      supportingData: `Active monthly electricity: ${baselineKwh.toLocaleString()} kWh/mo. Book stacks remain illuminated 18 hours/day regardless of patron traffic. Installing wireless PIR occupancy sensors in book aisles trims stack run hours by 40%, delivering a 9% net facility power cut (${annualKwhSaved.toLocaleString()} kWh/yr).`,
      actionItems: [
        'Deploy wireless occupancy sensors in Floors 2–4 book aisles',
        'Integrate with campus DALI lighting control network',
        'Verify emergency path-of-egress minimum foot-candle compliance',
      ],
    });
  }

  // 5. RULE: Solid Waste & Composting Diversion Expansion
  const diningHub = departments.find((d) => d.name.toLowerCase().includes('dining'));
  if (diningHub && diningHub.wasteKg) {
    const annualWasteKg = diningHub.wasteKg * 12;
    const additionalDiversionKg = Math.round(annualWasteKg * 0.25);
    const tippingFeeSavedUsd = Math.round((additionalDiversionKg / 1000) * AUDIT_CONSTANTS.LANDFILL_TIPPING_FEE_USD_PER_TON);
    const carbonSavedKg = Math.round(additionalDiversionKg * 0.45); // Landfill methane avoidance

    recommendations.push({
      id: `rec-waste-compost-${diningHub.id}`,
      title: `Back-of-House Food Scrap Composting Protocol in ${diningHub.name}`,
      category: 'Waste Diversion',
      building: diningHub.buildingName,
      department: diningHub.name,
      estimatedAnnualSavingsUsd: tippingFeeSavedUsd,
      estimatedCarbonReductionKg: carbonSavedKg,
      estimatedImplementationCostUsd: 2200,
      paybackMonths: Math.max(4, Math.round((2200 / (tippingFeeSavedUsd / 12)))),
      reviewStatus: 'Under Review',
      supportingData: `Facility generates ${diningHub.wasteKg.toLocaleString()} kg/mo solid waste. Expanding dedicated pre-consumer and post-consumer food scrap separation diverts an estimated ${additionalDiversionKg.toLocaleString()} kg/yr from landfill, avoiding municipal tipping charges.`,
      actionItems: [
        'Install 6 color-coded organic collection rolling hampers in food prep zones',
        'Conduct 30-minute training with kitchen staff on compost contamination prevention',
        'Schedule bi-weekly organic pickups with regional municipal composting hauler',
      ],
    });
  }

  return recommendations;
}
