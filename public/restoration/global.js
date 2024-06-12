const dataset = {
  path: './data/SalmonHabitatRestorationProjects_DataPortal_June_FinalFields_20240612(in).csv',
  headers: {
    'site_species_id': 'site_species_id',
    'project_name': 'project_name',
    'project_description': 'project_description',
    'year': 'reporting_fy',
    'lat': 'site_latitude',
    'lng': 'site_longitude',
    'ecosystem_type': 'ecosystem_type',
    'species_name': 'species_name',
    'CU_Name': 'CU_Name',
    'CU_ID': 'FULL_CU_IN',          // used to match CU geoson for filters
    'SMU_Name': 'SMU_Display',
    'SMU_ID': 'SMU_ID'              // used to match SMU geoson for filters
  }
}

// Configure dropdown
const selectors = [
  { id: 'projectNameSelector', key: dataset.headers.project_name, name: 'Project Names' },
  { id: 'speciesSelector', key: dataset.headers.species_name, name : 'Species' },
  { id: 'cuSelector', key: dataset.headers.CU_Name, name : 'CU Names' },
  { id: 'smuSelector', key: dataset.headers.SMU_Name, name : 'SMU Names' }
];

// Map layers
const geojsonLayers = [
  {
    filename: './data/CK_CU_Simp1000.geojson',
    fillColor: '#bd175d',
    name: 'Chinook CUs'
  }, {
    filename: './data/CM_CU_Simp1000.geojson',
    fillColor: '#a617bd',
    name: 'Chum CUs',
  }, {
    filename: './data/CO_CU_Simp1000.geojson',
    fillColor: '#3817bd',
    name: 'Coho CUs',
  }, {
    filename: './data/PKE_CU_Simp1000.geojson',
    fillColor: '#007293',
    name: 'PKE CUs',
  }, {
    filename: './data/PKO_CU_Simp1000.geojson',
    fillColor: '#009456',
    name: 'PKO CUs',
  }, {
    filename: './data/SEL_CU_Simp1000.geojson',
    fillColor: '#b97002',
    name: 'SEL CUs',
  }, {
    filename: './data/SER_CU_Simp1000.geojson',
    fillColor: '#c04500',
    name: 'SER CUs',
  }
];

const geojsonSMULayers = [
  {
    filename: './data/CK_SMU_Simp1000.geojson',
    fillColor: '#ba6186',
    name: 'Chinook SMUs'
  }, {
    filename: './data/CM_SMU_Simp1000.geojson',
    fillColor: '#c16fce',
    name: 'Chum SMUs'
  }, {
    filename: './data/CO_SMU_Simp1000.geojson',
    fillColor: '#735ec3',
    name: 'Coho SMUs',
  }, {
    filename: './data/PKE_SMU_Simp1000.geojson',
    fillColor: '#6d9ca9',
    name: 'PKE SMUs',
  }, {
    filename: './data/PKO_SMU_Simp1000.geojson',
    fillColor: '#77d3ad',
    name: 'PKO SMUs',
  }, {
    filename: './data/SEL_SMU_Simp1000.geojson',
    fillColor: '#cd9d55',
    name: 'SEL SMUs',
  }, {
    filename: './data/SER_SMU_Simp1000.geojson',
    fillColor: '#d98a5e',
    name: 'SER SMUs',
  }
];

export {
  dataset,
  selectors,
  geojsonLayers,
  geojsonSMULayers,
};