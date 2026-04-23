# 🛰️ GEE Utilities

A curated collection of lightweight Google Earth Engine utility codes for geospatial analysis and processing.

---

## Overview

This repository contains a suite of practical utility scripts and notebooks designed to streamline common geospatial workflows using **Google Earth Engine (GEE)**. Each utility is self-contained and ready to use, covering essential operations in remote sensing, data processing, and spatial analysis.

---

## 📦 Utilities

| Utility | Type | Purpose |
|---------|------|---------|
| **Random Points Buffer** | Jupyter Notebook | Generate randomized spatial sampling points with buffer zones |
| **LS8 LST Estimation** | Google Earth Engine Script | Land Surface Temperature retrieval from Landsat 8 data |
| **Date Wise Image Selection** | Google Earth Engine Script | Temporal-based satellite image filtering and selection |
| **Raster to Vector** | Jupyter Notebook | Convert raster data to vector formats for advanced analysis |
| **Study Area Map** | Jupyter Notebook | Visualize and define study area boundaries and characteristics |
| **LULC GEE ML** | Jupyter Notebook | Land Use/Land Cover classification using machine learning |

---

## 🚀 Quick Start

### Prerequisites
- Google Earth Engine account ([register here](https://signup.earthengine.google.com/))
- Python 3.7+ (for Jupyter notebooks)
- Node.js (for Google Earth Engine web scripts)
- Required Python libraries (see below)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd GEE_Tools
```

2. Install Python dependencies:
```bash
pip install jupyter numpy pandas geopandas rasterio
```

3. Authenticate with Google Earth Engine:
```bash
earthengine authenticate
```

---

## 📚 Usage

### Jupyter Notebooks
Navigate to the notebook file and run:
```bash
jupyter notebook <notebook_name>.ipynb
```

### Google Earth Engine Scripts
Copy the script content to the [Google Earth Engine Code Editor](https://code.earthengine.google.com/) and execute.

---

## 🛠️ Repository Structure

```
GEE_Tools/
├── 01_Random_Points_bufffer.ipynb       # Spatial sampling utilities
├── 02_LS8_LST_Estimation.js              # Thermal analysis
├── 03_Date_Wise_Image_Selection.js       # Temporal filtering
├── 04_Raster_to_Vector.ipynb             # Data format conversion
├── 05_StudyAreaMap.ipynb                 # Area definition & visualization
├── 06_LULC_GEE_ML.ipynb                  # Land cover classification
├── LICENSE
└── README.md
```

---

## 📖 Resources

- [Google Earth Engine Documentation](https://developers.google.com/earth-engine)
- [Earth Engine Python API](https://developers.google.com/earth-engine/guides/python_install)
- [Landsat 8 Dataset](https://developers.google.com/earth-engine/datasets/catalog/LANDSAT_8)

---

## 📄 License

This project is licensed under the terms specified in the [LICENSE](LICENSE) file.

---

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues, fork the repository, or create pull requests with improvements and new utilities.

---

## 📧 Support

For questions or issues, please open an issue in the repository or refer to the official GEE documentation.
