# Salmon Habitat Restoration Projects Visualization

## Introduction

This document provides detailed insights into the structure, functionality, and usage of the JavaScript files comprising the Salmon Habitat Restoration Projects Visualization. Leveraging Leaflet for mapping, AmCharts for chart visualization, and DataTable for managing tabular data, this project offers a comprehensive platform for exploring salmon habitat restoration initiatives.

## File Overview

### HTML and CSS Files

#### `public/restoration/restoration.html`
This HTML file serves as the project's main entry point, incorporating essential libraries and scripts for rendering functionalities.

#### `public/restoration/restoration_themed.html`
This HTML file serves as the project's main entry point, similar to `restoration.html`, but it is themed with GC Web. It incorporates essential libraries and scripts for rendering functionalities while adhering to the styling and design guidelines provided by GC Web.

#### `public/restoration/styles.css`
The CSS file contains minimal styles tailored not to interfere with existing web page styles. This approach ensures compatibility and seamless integration when placed into a placeholder within an existing web page. The design focuses on basic layout and functionality, avoiding any style overrides that could conflict with the GC Web styles.

### Project Scripts

#### `public/restoration/global.js`
The `global.js` file contains essential global variables and configurations required for initializing and managing the habitat restoration data visualization project.

| Variables | Purpose |
|-----------|---------|
| `dataset` | Object defining the structure and configuration for the salmon habitat restoration project dataset. |
| `selectors` | Configures dropdown selectors for filtering habitat restoration projects based on various criteria. |
| `geojsonLayers` `geojsonSMULayers` | Defines GeoJSON layers for displaying habitat restoration project boundaries on the map. |

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

#### `public/restoration/indexedDB.js`
Module for managing data storage and retrieval using IndexedDB, providing data handling for the project.


## Data Folder

The data files are placed under `public/restoration/data/`. If you do not find this folder, please create it and download all necessary CSV and JSON files to place into the folder.

### CSV data File

- **Folder:** [Pacific Salmon Strategy Initiative - Salmon Habitat Restoration Projects - All Documents (sharepoint.com)](https://086gc.sharepoint.com/sites/PacificSalmonTeam/Shared%20Documents/Forms/AllItems.aspx?csf=1&web=1&e=oRzAUm&cid=40afed46%2D5a8f%2D4b8c%2D8a40%2Dfd01aa1325bf&FolderCTID=0x012000B2A9CCF8A4A1B640A09C28AE5E1B0F18&id=%2Fsites%2FPacificSalmonTeam%2FShared%20Documents%2FGeneral%2F02%20%2D%20PSSI%20Secretariat%20Teams%2F04%20%2D%20Strategic%20Salmon%20Data%20Policy%20and%20Analytics%2F09%20%2D%20Pacific%20Salmon%20Data%20Portal%2FMVP%2FDatasets%2FCurrent%20Data%20Inventory%2FSalmon%20Habitat%20Restoration%20Projects&viewid=5f81282c%2D489d%2D4d08%2D9bb0%2Dc497b2c999e3)
- **File:** `Salmon_Habitat_Restoration_Projects_Final.csv`
- **Schema:** The CSV file schema maps dataset columns to descriptive aliases used throughout the project.

### GeoJSON Files

- **Folder:** [Pacific Salmon Strategy Initiative - GeoJSON_CU_SMU_TestingOnly_20240605 - All Documents (sharepoint.com)](https://086gc.sharepoint.com/sites/PacificSalmonTeam/Shared%20Documents/Forms/AllItems.aspx?csf=1&web=1&e=oRzAUm&cid=40afed46%2D5a8f%2D4b8c%2D8a40%2Dfd01aa1325bf&FolderCTID=0x012000B2A9CCF8A4A1B640A09C28AE5E1B0F18&id=%2Fsites%2FPacificSalmonTeam%2FShared%20Documents%2FGeneral%2F02%20%2D%20PSSI%20Secretariat%20Teams%2F04%20%2D%20Strategic%20Salmon%20Data%20Policy%20and%20Analytics%2F09%20%2D%20Pacific%20Salmon%20Data%20Portal%2FMVP%2FDatasets%2FCurrent%20Data%20Inventory%2FSalmon%20Habitat%20Restoration%20Projects%2FArchive%2FGeoJSON%5FCU%5FSMU%5FTestingOnly%5F20240605&viewid=5f81282c%2D489d%2D4d08%2D9bb0%2Dc497b2c999e3)
- **Files:** There are 14 GeoJSON layers, 7 CU layers, and 7 SMU layers.
  - **CU Layers:**
    - `CK_CU_Simp100.geojson`
    - `CM_CU_Simp100.geojson`
    - ...
  - **SMU Layers:**
    - `CK_SMU_Simp100.geojson`
    - `CM_SMU_Simp100.geojson`
    - ...

These files are integral to the project and are referenced as the major values for the variables `geojsonLayers` and `geojsonSMULayers` in the `global.js` file.

## Usage Guide

### Backend Environment

- The project is designed to run on Node.js version 20.
- It utilizes Express.js for backend routing.
- The scripts employ vanilla JavaScript methods for simplicity and maintainability.

### GitHub Repository

The complete source code for this project is available on GitHub, repo name is `data-portal-habitat-restoration`: [dfo-mpo/data-portal-habitat-restoration](https://github.com/dfo-mpo/data-portal-habitat-restoration)

### `ref/` Folder

- The `ref/` folder in the repository contains files for the GitHub-hosted static website (legacy) used only for reference. It is not required to run the main application and serves purely for demonstration purposes.

### Initial Setup

1. Ensure that all necessary files, including HTML, CSS, data files, and JavaScript files, are properly linked and accessible within the project environment.
2. To install node modules, run `npm install`.
3. To launch the project, run the command `node app.js` in the terminal.
4. To preview in Azure Web App, [Salmon Habitat Restoration Projects](https://habitatrestoration.azurewebsites.net/restoration/) 

### Reference Implementation with GC Web Theme

For a reference implementation on how the visualization should look when integrated into a styled web page, refer to the following page: [Salmon Habitat Restoration Projects with GC Web Theme](https://habitatrestoration.azurewebsites.net/restoration/gc).

## Exploring Data

Upon loading the dashboard, you will be presented with various interactive components, including:

- A map displaying salmon habitat restoration project boundaries.
- Charts showcasing key project metrics.
- Data tables providing information on salmon habitat restoration projects.
