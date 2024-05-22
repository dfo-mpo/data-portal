# Habitat Restoration Projects Visualization

## Introduction

This document provides detailed insights into the structure, functionality, and usage of the JavaScript files comprising the Habitat Restoration Projects Visualization. Leveraging Leaflet for mapping, AmCharts for chart visualization, and DataTable for managing tabular data, this project offers a comprehensive platform for exploring habitat restoration initiatives.

## File Overview

### HTML and CSS Files

#### `public/restoration/restoration.html`
This HTML file serves as the project's main entry point, incorporating essential libraries and scripts for rendering functionalities.

#### `public/restoration/styles.css`
The CSS file contains minimal styles tailored not to interfere with existing web page styles. This approach ensures compatibility and seamless integration when placed into a placeholder within an existing web page. The design focuses on basic layout and functionality, avoiding any style overrides that could conflict with the GC Web styles.

### Project Scripts

#### `public/restoration/global.js`
The `global.js` file contains essential global variables and configurations required for initializing and managing the habitat restoration data visualization project.

| Variables | Purpose |
|-----------|---------|
| `csvfile` | Defines the path to the main CSV file containing habitat restoration project data. |
| `geojsonLayers` `geojsonSMULayers` | Defines GeoJSON layers for displaying habitat restoration project boundaries on the map. |
| `dataNameAlias` | Maps dataset column names to their corresponding descriptive aliases for better readability and understanding. |
| `selectors` | Configures dropdown selectors for filtering habitat restoration projects based on various criteria. |

#### `public/restoration/utils.js`
Repository for commonly used utility functions facilitating data processing and manipulation throughout the project.

#### `public/restoration/getdata.js`
Functions responsible for fetching and processing data required for project visualization.

#### `public/restoration/chart.js`
Functions for creating and managing chart visualizations within the project.

#### `public/restoration/map.js`
Functions for initializing and managing interactive map visualization.

#### `public/restoration/datatable.js`
Functions for initializing and managing data tables within the project.

#### `public/restoration/restoration.js`
Main script orchestrating the project logic, integrating functionalities from other JavaScript files.

## Data Folder

The data files are placed under `public/restoration/data/`. If you do not find this folder, please create it and download all necessary CSV and JSON files to place into the folder.

### CSV data File

- **Folder:** [Pacific Salmon Strategy Initiative - Habitat Restoration Projects - All Documents (sharepoint.com)](https://086gc.sharepoint.com/sites/PacificSalmonTeam/Shared%20Documents/Forms/AllItems.aspx?csf=1&web=1&e=nkBEMH&cid=1efc5c36%2D8912%2D41bd%2D86bc%2Db9f8b1d8d722&FolderCTID=0x012000B2A9CCF8A4A1B640A09C28AE5E1B0F18&id=%2Fsites%2FPacificSalmonTeam%2FShared%20Documents%2FGeneral%2F02%20%2D%20PSSI%20Secretariat%20Teams%2F04%20%2D%20Strategic%20Salmon%20Data%20Policy%20and%20Analytics%2F09%20%2D%20Pacific%20Salmon%20Data%20Portal%2FMVP%2FDatasets%2FHabitat%20Restoration%20Projects&viewid=5f81282c%2D489d%2D4d08%2D9bb0%2Dc497b2c999e3)
- **File:** `habitatrestorationprojects_dataportal_mockupMay27.csv`
- **Schema:** The CSV file schema maps dataset columns to descriptive aliases used throughout the project.

### GeoJSON Files

- **Folder:** [Pacific Salmon Strategy Initiative - GeoJSON_CU_SMU_TestingOnly - All Documents (sharepoint.com)](https://086gc.sharepoint.com/sites/PacificSalmonTeam/Shared%20Documents/Forms/AllItems.aspx?csf=1&web=1&e=nkBEMH&cid=1efc5c36%2D8912%2D41bd%2D86bc%2Db9f8b1d8d722&FolderCTID=0x012000B2A9CCF8A4A1B640A09C28AE5E1B0F18&id=%2Fsites%2FPacificSalmonTeam%2FShared%20Documents%2FGeneral%2F02%20%2D%20PSSI%20Secretariat%20Teams%2F04%20%2D%20Strategic%20Salmon%20Data%20Policy%20and%20Analytics%2F09%20%2D%20Pacific%20Salmon%20Data%20Portal%2FMVP%2FDatasets%2FHabitat%20Restoration%20Projects%2FGeoJSON%5FCU%5FSMU%5FTestingOnly&viewid=5f81282c%2D489d%2D4d08%2D9bb0%2Dc497b2c999e3)
- **Files:** There are 14 GeoJSON layers, 7 CU layers, and 7 SMU layers.
  - **CU Layers:**
    - `CK_CU_Simp100.json`
    - `CM_CU_Simp100.json`
    - ...
  - **SMU Layers:**
    - `CK_SMU_Simp100.json`
    - `CM_SMU_Simp100.json`
    - ...

These files are integral to the project and are referenced as the major values for the variables `geojsonLayers` and `geojsonSMULayers` in the `global.js` file.

## Usage Guide

### Backend Environment

- The project is designed to run on Node.js version 20.
- It utilizes Express.js for backend routing.
- The scripts employ vanilla JavaScript methods for simplicity and maintainability.

### GitHub Repository

The complete source code for this project is available on GitHub, repo name is `data-portal-habitat-restoration`: [dfo-mpo/data-portal-habitat-restoration](https://github.com/dfo-mpo/data-portal-habitat-restoration)

### Initial Setup

1. Ensure that all necessary files, including HTML, CSS, data files, and JavaScript files, are properly linked and accessible within the project environment.
2. To install node modules, run `npm install`.
3. To launch the project, run the command `node app.js` in the terminal.

### Reference Implementation

For a reference implementation on how the visualization should look when integrated into a styled web page, refer to the following page: [Habitat Restoration Reference](https://dfo-mpo.github.io/data-portal-habitat-restoration/ref/restoration.html).

- The web page hosted on GitHub is static and does not read the CSV file directly. Due to the static nature, the reference page employs hardcoded sample data rather than dynamically loading the full dataset from the CSV.
- For the complete source code, including the actual implementation that reads and processes the CSV data, please visit the GitHub repository.

Please note that the content on this reference page might not be up-to-date, but it closely resembles the intended visual integration.

## Exploring Data

Upon loading the dashboard, you will be presented with various interactive components, including:

- A map displaying habitat restoration project boundaries.
- Charts showcasing key project metrics.
- Data tables providing information on habitat restoration projects.
