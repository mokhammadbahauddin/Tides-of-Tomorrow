export interface ActContent {
  label: string;
  labelColor: string;
  title: string;
  body: string;
  stat: string;
  statSubtitle: string;
  statColor: string;
}

export const acts: ActContent[] = [
  {
    label: 'ACT I — PROLOGUE',
    labelColor: '#00d4aa',
    title: 'The Pristine Facade and the Carbon Ledger',
    body: 'Before the ledger of carbon debt was ever written, the Pacific existed in a state of improbable abundance. For a hundred generations, islanders read the signs of shifting currents and migrating tuna, encoding climate knowledge into chant and star compass. Today, the Pacific Ocean covers one-third of the planet\'s surface, yet its island nations contribute less than 0.03% of global greenhouse gas emissions. They bear zero responsibility for the industrial combustion that fueled the modern world, yet they stand first in line to pay the ultimate price.',
    stat: '0.03%',
    statSubtitle: 'of global emissions originate from Pacific Island nations',
    statColor: '#64ffda',
  },
  {
    label: 'ACT II — DATASET 01',
    labelColor: '#f59e0b',
    title: 'The Thermal Engine',
    body: 'The ocean is the planet\'s great heat sink, absorbing 93% of the excess heat trapped by human activity. But this buffering capacity has fractured. Mean sea surface temperatures (SST) in the western Pacific have anomalies rising faster than the global average. This warmer water acts as a thermal engine for climate disruption—it bleaches coral reefs that took millennia to grow, decimates marine ecosystems, and provides the raw thermodynamic fuel required to spawn catastrophic extreme weather events.',
    stat: '+1.2°C',
    statSubtitle: 'SST anomaly increase, creating marine heatwaves',
    statColor: '#f59e0b',
  },
  {
    label: 'ACT III — DATASET 02',
    labelColor: '#e63946',
    title: 'The Encroaching Waters',
    body: 'Thermal expansion and glacial melt have broken the ancient boundaries of the tide. Satellite altimetry data reveals sea level anomalies rising at nearly 4.5 millimeters per year in the tropical Pacific—significantly outpacing the global mean. This is not merely an environmental hazard; it is a physical encroachment on sovereign land. For the 90% of Pacific Islanders living within 5 kilometers of the coast, rising saltwater infiltrates freshwater aquifers and erodes the very ground beneath their feet.',
    stat: '4.5 mm/yr',
    statSubtitle: 'regional sea level rise, threatening coastal sovereignty',
    statColor: '#e63946',
  },
  {
    label: 'ACT IV — DATASET 03',
    labelColor: '#8899a6',
    title: 'The Atmospheric Fracture',
    body: 'The thermal engine inevitably disrupts the sky. Rainfall anomalies show severe, whiplash shifts between devastating droughts and pluvial flooding⁵. Category 5 cyclones, once generational anomalies, are becoming frighteningly common as the warmer atmosphere holds and dumps unprecedented volumes of water. This atmospheric fracture destroys infrastructure, uproots communities, and leaves fragile island economies perpetually trapped in costly cycles of recovery and rebuilding.',
    stat: 'Whiplash',
    statSubtitle: 'Severe oscillation between drought and deluge',
    statColor: '#8899a6',
  },
  {
    label: 'ACT V — DATASETS 04 & 05',
    labelColor: '#e6b89c',
    title: 'The Human Toll & The Unpaid Debt',
    body: 'Physical weather anomalies ultimately translate into a crisis of human survival. Crop yield data shows how saltwater intrusion and drought decimate agricultural output, directly threatening food security⁶. To survive, local Pacific governments are forced to levy heavy environmental taxes, funding their own climate adaptation. They are paying a "carbon debt" they did not incur. The data forms an undeniable chain of causality: from warming oceans to a financial and existential toll levied upon the most vulnerable⁷.',
    stat: 'The Debt',
    statSubtitle: 'Vulnerable nations paying for global industrial emissions',
    statColor: '#e6b89c',
  },
];

export const heroContent = {
  label: 'A PACIFIC CLIMATE NARRATIVE',
  title: ['TIDES OF', 'TOMORROW'],
  subtitle: 'Five datasets. One thousand islands. The carbon debt comes due.',
  scrollPrompt: 'Scroll to begin',
};

export const closingContent = {
  title: 'The data is the elegy.',
  body: 'All data sourced from the Pacific Data Hub (PDH.Stat), IPCC AR6 Working Group I & II, and the Secretariat of the Pacific Regional Environment Programme (SPREP). This visualization uses five official datasets from the 2026 Pacific Dataviz Challenge: Mean Sea Surface Temperature Anomalies, Sea Level Anomalies, Rainfall Anomalies, Crop Yield (disaggregated), and Environmental Taxes.',
  cta: 'Explore the Data',
};

export const footerContent = {
  datasets: [
    { name: 'Mean Sea Surface Temperature Anomalies', source: 'Pacific Data Hub, PDH.Stat — Reynolds OISST v2.1' },
    { name: 'Sea Level Anomalies', source: 'Pacific Data Hub, PDH.Stat — Satellite altimetry (TOPEX/Jason series)' },
    { name: 'Rainfall Anomalies', source: 'Pacific Data Hub, PDH.Stat — 1986-2005 baseline' },
    { name: 'Crop Yield (disaggregated)', source: 'Pacific Data Hub, PDH.Stat — FAO production indices' },
    { name: 'Environmental Taxes', source: 'Pacific Data Hub, PDH.Stat — OECD/UNEP framework' },
  ],
  attribution: 'Created for the 2026 Pacific Dataviz Challenge.',
  license: 'Data available under open license via stats.pacificdata.org',
};
