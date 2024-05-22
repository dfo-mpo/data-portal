// Main csv
const csvfile = './data/habitatrestorationprojects_dataportal_mockupMay27.csv';

// Dataset schema mapping
const dataNameAlias = {
  'PrjName': 'Project Name',
  'PrjLead': 'Project Lead Organization',
  'PrjDesc': 'Project Description',
  'Lat': 'Latitude in Decimal Degrees',
  'Lng': 'Longitude in Decimal Degrees',
  'CU_Name': 'MAX_CU_Nam',
  'SMU_Name': 'SMU_Name',
  'Year': 'Reporting Fiscal Year',
  'CU_Index': 'FULL_CU_IN',
  'Species': 'FullSpecies',
}

// Configure dropdown
const selectors = [
  { id: 'projectNameSelector', key: dataNameAlias.PrjName, name: 'Project Names' },
  { id: 'speciesSelector', key: dataNameAlias.Species, name : 'Species' },
  { id: 'cuSelector', key: dataNameAlias.CU_Name, name : 'CU Names' },
  { id: 'smuSelector', key: dataNameAlias.SMU_Name, name : 'SMU Names' }
];

// Map layers
const geojsonLayers = [
  {
    filename: './data/CK_CU_Simp100.json',
    fillColor: '#bd175d',
    name: 'Chinook CUs'
  }, {
    filename: './data/CM_CU_Simp100.json',
    fillColor: '#a617bd',
    name: 'Chum CUs',
  }, {
    filename: './data/CO_CU_Simp100.json',
    fillColor: '#3817bd',
    name: 'Coho CUs',
  }, {
    filename: './data/PKE_CU_Simp100.json',
    fillColor: '#007293',
    name: 'PKE CUs',
  }, {
    filename: './data/PKO_CU_Simp100.json',
    fillColor: '#009456',
    name: 'PKO CUs',
  }, {
    filename: './data/SEL_CU_Simp100.json',
    fillColor: '#b97002',
    name: 'SEL CUs',
  }, {
    filename: './data/SER_CU_Simp100.json',
    fillColor: '#c04500',
    name: 'SER CUs',
  }
];

const geojsonSMULayers = [
  {
    filename: './data/CK_SMU_Simp100.json',
    fillColor: '#ba6186',
    name: 'Chinook SMUs'
  }, {
    filename: './data/CM_SMU_Simp100.json',
    fillColor: '#c16fce',
    name: 'Chum SMUs'
  }, {
    filename: './data/CO_SMU_Simp100.json',
    fillColor: '#735ec3',
    name: 'Coho SMUs',
  }, {
    filename: './data/PKE_SMU_Simp100.json',
    fillColor: '#6d9ca9',
    name: 'PKE SMUs',
  }, {
    filename: './data/PKO_SMU_Simp100.json',
    fillColor: '#77d3ad',
    name: 'PKO SMUs',
  }, {
    filename: './data/SEL_SMU_Simp100.json',
    fillColor: '#cd9d55',
    name: 'SEL SMUs',
  }, {
    filename: './data/SER_SMU_Simp100.json',
    fillColor: '#d98a5e',
    name: 'SER SMUs',
  }
];