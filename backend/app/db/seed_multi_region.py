"""
ResQZone Multi-Region Disaster Dataset Seeder
Enriches ResQZone with comprehensive geographic, demographic, and hazard data
for all major high-risk disaster zones across India:
1. Chamoli & Joshimath, Uttarakhand (Subsidence & GLOF)
2. Wayanad, Kerala (Debris Flow & Slope Failures)
3. Mandi & Kullu, Himachal Pradesh (Cloudbursts & Beas Flooding)
4. Raigad, Maharashtra (Western Ghats Monsoonal Landslides)
5. Dhemaji, Assam (Brahmaputra Flood Plain & Island Erosion)
6. Darjeeling, West Bengal (Teesta Canyon GLOF & Landslides)
"""
import json
import os
import sqlite3
from datetime import datetime, timezone

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
DEMO_DIR = os.path.join(BASE_DIR, "data", "demo")
os.makedirs(DEMO_DIR, exist_ok=True)

NOW = datetime.now(timezone.utc).isoformat()

# ==========================================
# 1. REGIONS DEFINITIONS
# ==========================================
REGIONS = [
    {
        "id": "ALL",
        "name": "All India (National Overview)",
        "state": "National",
        "district": "All Districts",
        "center": [22.9734, 78.6569],
        "zoom": 5,
        "bounds": [[8.0, 68.0], [35.5, 97.5]],
        "primary_hazards": ["LANDSLIDE", "FLOOD", "SUBSIDENCE", "GLOF", "CLOUDBURST"],
        "description": "Integrated National Multi-Hazard Early Warning & Carrying Capacity Grid",
        "telemetry": {
            "monitored_nodes": "48 Active Stations",
            "active_alert_level": "ORANGE (Multi-State)",
            "monsoon_activity": "ACTIVE",
            "ndrf_battalions": "12 Deployed"
        }
    },
    {
        "id": "CHAMOLI",
        "name": "Chamoli & Joshimath",
        "state": "Uttarakhand",
        "district": "Chamoli",
        "center": [30.556, 79.566],
        "zoom": 12,
        "bounds": [[30.41, 79.40], [30.68, 79.75]],
        "primary_hazards": ["SUBSIDENCE", "LANDSLIDE", "GLOF"],
        "description": "Joshimath slope subsidence and Alaknanda-Dhauliganga river gorge",
        "telemetry": {
            "river_basin": "Alaknanda Basin (+1.4m)",
            "seismic_freq": "MCT Sensor: 42 Hz",
            "subsidence_rate": "7.4 cm/month",
            "weather": "Rainfall: 118.4 mm/24h"
        }
    },
    {
        "id": "WAYANAD",
        "name": "Wayanad District",
        "state": "Kerala",
        "district": "Wayanad",
        "center": [11.532, 76.148],
        "zoom": 12,
        "bounds": [[11.42, 76.05], [11.64, 76.25]],
        "primary_hazards": ["LANDSLIDE", "DEBRIS_FLOW", "FLASH_FLOOD"],
        "description": "Meppadi-Chooralmala-Mundakkai Western Ghats catastrophic debris corridor",
        "telemetry": {
            "river_basin": "Iruvaizhinji River Surge",
            "seismic_freq": "Micro-Tremor Array: 18 Hz",
            "subsidence_rate": "Debris Flow Velocity: 45 km/h",
            "weather": "Rainfall: 372.6 mm/24h"
        }
    },
    {
        "id": "MANDI",
        "name": "Mandi & Beas Basin",
        "state": "Himachal Pradesh",
        "district": "Mandi",
        "center": [31.708, 76.932],
        "zoom": 11,
        "bounds": [[31.55, 76.75], [31.85, 77.10]],
        "primary_hazards": ["CLOUDBURST", "LANDSLIDE", "FLASH_FLOOD"],
        "description": "Beas River gorge, Pandoh Dam basin, and NH-154 Kotropi active slip",
        "telemetry": {
            "river_basin": "Beas River (+3.8m Warning Level)",
            "seismic_freq": "Slope Inclinometer: Active Slip",
            "subsidence_rate": "Road Collapse Exposure: High",
            "weather": "Cloudburst Index: Severe (86 mm/hr)"
        }
    },
    {
        "id": "RAIGAD",
        "name": "Raigad & Konkan Coast",
        "state": "Maharashtra",
        "district": "Raigad",
        "center": [18.150, 73.400],
        "zoom": 11,
        "bounds": [[18.00, 73.20], [18.30, 73.60]],
        "primary_hazards": ["LANDSLIDE", "FLASH_FLOOD"],
        "description": "Mahad-Taliye Western Ghats escarpment and Savitri River flood plain",
        "telemetry": {
            "river_basin": "Savitri River High Inundation",
            "seismic_freq": "Pore Pressure Transducer: 94%",
            "subsidence_rate": "Slope Movement: 12 mm/day",
            "weather": "Monsoon Rainfall: 245 mm/24h"
        }
    },
    {
        "id": "DHEMAJI",
        "name": "Dhemaji & Brahmaputra Valley",
        "state": "Assam",
        "district": "Dhemaji",
        "center": [27.480, 94.580],
        "zoom": 11,
        "bounds": [[27.30, 94.35], [27.65, 94.80]],
        "primary_hazards": ["RIVER_FLOOD", "EMBANKMENT_BREACH", "EROSION"],
        "description": "Brahmaputra alluvial flood plain, Jonai border, and Subansiri basin",
        "telemetry": {
            "river_basin": "Brahmaputra (+1.8m Above Danger)",
            "seismic_freq": "River Gauge Telemetry: 104.5m",
            "subsidence_rate": "Bank Erosion Rate: 15 m/week",
            "weather": "Precipitation: 165 mm/24h"
        }
    },
    {
        "id": "DARJEELING",
        "name": "Darjeeling & Teesta Valley",
        "state": "West Bengal",
        "district": "Darjeeling",
        "center": [27.041, 88.266],
        "zoom": 11,
        "bounds": [[26.90, 88.10], [27.20, 88.45]],
        "primary_hazards": ["LANDSLIDE", "GLOF", "FLASH_FLOOD"],
        "description": "Teesta River canyon, Paglajhora active slip, and Kalimpong ridge",
        "telemetry": {
            "river_basin": "Teesta River GLOF Surge Watch",
            "seismic_freq": "Main Boundary Thrust: 28 Hz",
            "subsidence_rate": "Highway Slip Rate: 4.2 cm/month",
            "weather": "Rainfall: 195 mm/24h"
        }
    }
]

# ==========================================
# 2. HABITATIONS (ALL REGIONS)
# ==========================================
ALL_HABITATIONS = [
    # Chamoli District
    {"id": "HAB-01", "name": "Manohar Bagh Ward", "district": "Chamoli", "sub_district": "Joshimath", "lat": 30.5574, "lng": 79.5681, "population": 1420, "households": 285, "vuln_pop": 565, "elderly": 195, "children": 280, "disabled": 38, "medical": 52, "fragility": 0.92, "slope": 38.5, "elevation": 1920, "hazard": "LANDSLIDE", "hazard_score": 0.91, "risk": "CRITICAL", "reloc": True},
    {"id": "HAB-02", "name": "Sunil Ward (Subsidence Zone)", "district": "Chamoli", "sub_district": "Joshimath", "lat": 30.5621, "lng": 79.5634, "population": 1850, "households": 360, "vuln_pop": 703, "elderly": 220, "children": 375, "disabled": 42, "medical": 66, "fragility": 0.95, "slope": 42.0, "elevation": 1980, "hazard": "LANDSLIDE", "hazard_score": 0.94, "risk": "CRITICAL", "reloc": True},
    {"id": "HAB-03", "name": "Singhdhar Ground Rupture Sector", "district": "Chamoli", "sub_district": "Joshimath", "lat": 30.5528, "lng": 79.5652, "population": 1240, "households": 240, "vuln_pop": 483, "elderly": 160, "children": 250, "disabled": 31, "medical": 42, "fragility": 0.88, "slope": 36.0, "elevation": 1890, "hazard": "LANDSLIDE", "hazard_score": 0.88, "risk": "CRITICAL", "reloc": True},
    {"id": "HAB-04", "name": "Marwari Lower Ward", "district": "Chamoli", "sub_district": "Joshimath", "lat": 30.5489, "lng": 79.5615, "population": 980, "households": 190, "vuln_pop": 372, "elderly": 130, "children": 195, "disabled": 21, "medical": 26, "fragility": 0.81, "slope": 34.0, "elevation": 1780, "hazard": "LANDSLIDE", "hazard_score": 0.82, "risk": "CRITICAL", "reloc": True},
    {"id": "HAB-05", "name": "Gandhi Nagar Upper", "district": "Chamoli", "sub_district": "Joshimath", "lat": 30.5598, "lng": 79.5712, "population": 1120, "households": 215, "vuln_pop": 392, "elderly": 140, "children": 205, "disabled": 19, "medical": 28, "fragility": 0.68, "slope": 29.0, "elevation": 1940, "hazard": "LANDSLIDE", "hazard_score": 0.69, "risk": "WARNING", "reloc": False},
    {"id": "HAB-06", "name": "Raini Village (GLOF Risk Sector)", "district": "Chamoli", "sub_district": "Joshimath", "lat": 30.4852, "lng": 79.6914, "population": 650, "households": 130, "vuln_pop": 266, "elderly": 90, "children": 140, "disabled": 14, "medical": 22, "fragility": 0.89, "slope": 41.0, "elevation": 2050, "hazard": "FLOOD", "hazard_score": 0.89, "risk": "CRITICAL", "reloc": True},
    {"id": "HAB-07", "name": "Helang Fluvial Valley", "district": "Chamoli", "sub_district": "Joshimath", "lat": 30.5284, "lng": 79.5081, "population": 840, "households": 165, "vuln_pop": 268, "elderly": 95, "children": 145, "disabled": 11, "medical": 17, "fragility": 0.52, "slope": 22.0, "elevation": 1520, "hazard": "FLOOD", "hazard_score": 0.58, "risk": "WARNING", "reloc": False},
    {"id": "HAB-08", "name": "Tapovan Gorge Settlement", "district": "Chamoli", "sub_district": "Joshimath", "lat": 30.4951, "lng": 79.6273, "population": 720, "households": 145, "vuln_pop": 252, "elderly": 85, "children": 135, "disabled": 12, "medical": 20, "fragility": 0.74, "slope": 31.0, "elevation": 1820, "hazard": "FLOOD", "hazard_score": 0.76, "risk": "CRITICAL", "reloc": True},

    # Wayanad District, Kerala (Western Ghats Catastrophic Landslides)
    {"id": "HAB-WY-01", "name": "Chooralmala Town Center", "district": "Wayanad", "sub_district": "Vythiri", "lat": 11.5362, "lng": 76.1685, "population": 2150, "households": 420, "vuln_pop": 820, "elderly": 280, "children": 410, "disabled": 45, "medical": 85, "fragility": 0.96, "slope": 39.0, "elevation": 910, "hazard": "LANDSLIDE", "hazard_score": 0.97, "risk": "CRITICAL", "reloc": True},
    {"id": "HAB-WY-02", "name": "Mundakkai High Settlement", "district": "Wayanad", "sub_district": "Vythiri", "lat": 11.5491, "lng": 76.1798, "population": 1680, "households": 340, "vuln_pop": 690, "elderly": 210, "children": 360, "disabled": 38, "medical": 82, "fragility": 0.98, "slope": 44.5, "elevation": 1050, "hazard": "LANDSLIDE", "hazard_score": 0.99, "risk": "CRITICAL", "reloc": True},
    {"id": "HAB-WY-03", "name": "Vellarmala School Ward", "district": "Wayanad", "sub_district": "Vythiri", "lat": 11.5305, "lng": 76.1620, "population": 1350, "households": 260, "vuln_pop": 490, "elderly": 170, "children": 250, "disabled": 26, "medical": 44, "fragility": 0.89, "slope": 35.0, "elevation": 880, "hazard": "LANDSLIDE", "hazard_score": 0.91, "risk": "CRITICAL", "reloc": True},
    {"id": "HAB-WY-04", "name": "Attamala Tea Plantation Colony", "district": "Wayanad", "sub_district": "Vythiri", "lat": 11.5580, "lng": 76.1920, "population": 940, "households": 185, "vuln_pop": 380, "elderly": 125, "children": 195, "disabled": 20, "medical": 40, "fragility": 0.91, "slope": 42.0, "elevation": 1120, "hazard": "LANDSLIDE", "hazard_score": 0.93, "risk": "CRITICAL", "reloc": True},
    {"id": "HAB-WY-05", "name": "Punchirimattam Ridge Edge", "district": "Wayanad", "sub_district": "Vythiri", "lat": 11.5640, "lng": 76.1850, "population": 820, "households": 160, "vuln_pop": 310, "elderly": 95, "children": 160, "disabled": 18, "medical": 37, "fragility": 0.94, "slope": 45.0, "elevation": 1280, "hazard": "LANDSLIDE", "hazard_score": 0.96, "risk": "CRITICAL", "reloc": True},
    {"id": "HAB-WY-06", "name": "Meppadi Lower Market", "district": "Wayanad", "sub_district": "Vythiri", "lat": 11.5510, "lng": 76.1280, "population": 2800, "households": 550, "vuln_pop": 720, "elderly": 250, "children": 380, "disabled": 35, "medical": 55, "fragility": 0.62, "slope": 21.0, "elevation": 780, "hazard": "FLOOD", "hazard_score": 0.65, "risk": "WARNING", "reloc": False},

    # Mandi & Beas Basin, Himachal Pradesh (Cloudbursts & Massive Landslides)
    {"id": "HAB-MD-01", "name": "Kotropi NH-154 Slip Zone", "district": "Mandi", "sub_district": "Jogindernagar", "lat": 31.9420, "lng": 76.8850, "population": 1180, "households": 220, "vuln_pop": 460, "elderly": 160, "children": 230, "disabled": 28, "medical": 42, "fragility": 0.93, "slope": 43.0, "elevation": 1250, "hazard": "LANDSLIDE", "hazard_score": 0.95, "risk": "CRITICAL", "reloc": True},
    {"id": "HAB-MD-02", "name": "Pandoh Dam Downstream Ward", "district": "Mandi", "sub_district": "Sadar", "lat": 31.6710, "lng": 77.0520, "population": 1450, "households": 290, "vuln_pop": 520, "elderly": 170, "children": 270, "disabled": 32, "medical": 48, "fragility": 0.86, "slope": 32.0, "elevation": 890, "hazard": "FLOOD", "hazard_score": 0.89, "risk": "CRITICAL", "reloc": True},
    {"id": "HAB-MD-03", "name": "Dharampur Market Lowlands", "district": "Mandi", "sub_district": "Dharampur", "lat": 31.8150, "lng": 76.7150, "population": 1620, "households": 310, "vuln_pop": 540, "elderly": 180, "children": 280, "disabled": 29, "medical": 51, "fragility": 0.78, "slope": 18.0, "elevation": 720, "hazard": "FLOOD", "hazard_score": 0.81, "risk": "CRITICAL", "reloc": True},
    {"id": "HAB-MD-04", "name": "Aut Village Beas Riverfront", "district": "Mandi", "sub_district": "Thalout", "lat": 31.7480, "lng": 77.2100, "population": 980, "households": 195, "vuln_pop": 340, "elderly": 110, "children": 180, "disabled": 18, "medical": 32, "fragility": 0.72, "slope": 24.0, "elevation": 980, "hazard": "FLOOD", "hazard_score": 0.74, "risk": "WARNING", "reloc": False},
    {"id": "HAB-MD-05", "name": "Jogindernagar Escarpment", "district": "Mandi", "sub_district": "Jogindernagar", "lat": 31.9830, "lng": 76.7720, "population": 1290, "households": 250, "vuln_pop": 410, "elderly": 140, "children": 210, "disabled": 24, "medical": 36, "fragility": 0.65, "slope": 31.0, "elevation": 1210, "hazard": "LANDSLIDE", "hazard_score": 0.68, "risk": "WARNING", "reloc": False},

    # Raigad District, Maharashtra (Western Ghats Slope Failures)
    {"id": "HAB-RG-01", "name": "Taliye Village Cliff Foot", "district": "Raigad", "sub_district": "Mahad", "lat": 18.0210, "lng": 73.4860, "population": 890, "households": 175, "vuln_pop": 390, "elderly": 130, "children": 210, "disabled": 22, "medical": 28, "fragility": 0.95, "slope": 42.0, "elevation": 240, "hazard": "LANDSLIDE", "hazard_score": 0.96, "risk": "CRITICAL", "reloc": True},
    {"id": "HAB-RG-02", "name": "Mahad Savitri Riverbank", "district": "Raigad", "sub_district": "Mahad", "lat": 18.0840, "lng": 73.4240, "population": 2900, "households": 580, "vuln_pop": 850, "elderly": 280, "children": 440, "disabled": 48, "medical": 82, "fragility": 0.85, "slope": 12.0, "elevation": 25, "hazard": "FLOOD", "hazard_score": 0.91, "risk": "CRITICAL", "reloc": True},
    {"id": "HAB-RG-03", "name": "Poladpur Valley Settlement", "district": "Raigad", "sub_district": "Poladpur", "lat": 17.9820, "lng": 73.4680, "population": 1340, "households": 260, "vuln_pop": 420, "elderly": 140, "children": 220, "disabled": 25, "medical": 35, "fragility": 0.72, "slope": 26.0, "elevation": 110, "hazard": "LANDSLIDE", "hazard_score": 0.75, "risk": "WARNING", "reloc": False},
    {"id": "HAB-RG-04", "name": "Birwadi Industrial Border", "district": "Raigad", "sub_district": "Mahad", "lat": 18.1250, "lng": 73.4410, "population": 1750, "households": 340, "vuln_pop": 460, "elderly": 150, "children": 240, "disabled": 28, "medical": 42, "fragility": 0.58, "slope": 15.0, "elevation": 35, "hazard": "FLOOD", "hazard_score": 0.62, "risk": "WATCH", "reloc": False},

    # Dhemaji District, Assam (Brahmaputra Flood Plain & Riverbank Erosion)
    {"id": "HAB-DH-01", "name": "Jonai Brahmaputra Bank Ward", "district": "Dhemaji", "sub_district": "Jonai", "lat": 27.7950, "lng": 95.1850, "population": 1820, "households": 350, "vuln_pop": 640, "elderly": 210, "children": 340, "disabled": 36, "medical": 54, "fragility": 0.91, "slope": 4.0, "elevation": 115, "hazard": "FLOOD", "hazard_score": 0.94, "risk": "CRITICAL", "reloc": True},
    {"id": "HAB-DH-02", "name": "Silapathar Lowland Cluster", "district": "Dhemaji", "sub_district": "Silapathar", "lat": 27.5920, "lng": 94.7210, "population": 2240, "households": 430, "vuln_pop": 730, "elderly": 240, "children": 390, "disabled": 41, "medical": 59, "fragility": 0.88, "slope": 3.0, "elevation": 105, "hazard": "FLOOD", "hazard_score": 0.89, "risk": "CRITICAL", "reloc": True},
    {"id": "HAB-DH-03", "name": "Sissiborgaon Island Ward", "district": "Dhemaji", "sub_district": "Sissiborgaon", "lat": 27.4250, "lng": 94.6100, "population": 1520, "households": 290, "vuln_pop": 510, "elderly": 170, "children": 270, "disabled": 29, "medical": 41, "fragility": 0.93, "slope": 2.0, "elevation": 98, "hazard": "FLOOD", "hazard_score": 0.95, "risk": "CRITICAL", "reloc": True},
    {"id": "HAB-DH-04", "name": "Gogamukh Embankment Cluster", "district": "Dhemaji", "sub_district": "Gogamukh", "lat": 27.3520, "lng": 94.3980, "population": 1940, "households": 380, "vuln_pop": 580, "elderly": 190, "children": 310, "disabled": 33, "medical": 47, "fragility": 0.76, "slope": 3.5, "elevation": 102, "hazard": "FLOOD", "hazard_score": 0.77, "risk": "WARNING", "reloc": False},

    # Darjeeling & Teesta Valley, West Bengal (GLOF & Landslides)
    {"id": "HAB-DJ-01", "name": "Teesta Bazaar Low Basin", "district": "Darjeeling", "sub_district": "Rangpo", "lat": 27.0650, "lng": 88.4350, "population": 1420, "households": 280, "vuln_pop": 530, "elderly": 175, "children": 280, "disabled": 31, "medical": 44, "fragility": 0.94, "slope": 34.0, "elevation": 220, "hazard": "FLOOD", "hazard_score": 0.96, "risk": "CRITICAL", "reloc": True},
    {"id": "HAB-DJ-02", "name": "Paglajhora Slide Exposure Ward", "district": "Darjeeling", "sub_district": "Kurseong", "lat": 26.8820, "lng": 88.2910, "population": 1150, "households": 220, "vuln_pop": 410, "elderly": 135, "children": 215, "disabled": 24, "medical": 36, "fragility": 0.92, "slope": 41.0, "elevation": 1450, "hazard": "LANDSLIDE", "hazard_score": 0.94, "risk": "CRITICAL", "reloc": True},
    {"id": "HAB-DJ-03", "name": "Mirik Lake Slopes", "district": "Darjeeling", "sub_district": "Mirik", "lat": 26.8910, "lng": 88.1880, "population": 1820, "households": 360, "vuln_pop": 540, "elderly": 180, "children": 290, "disabled": 32, "medical": 38, "fragility": 0.69, "slope": 28.0, "elevation": 1720, "hazard": "LANDSLIDE", "hazard_score": 0.71, "risk": "WARNING", "reloc": False},
    {"id": "HAB-DJ-04", "name": "Rimbick Ridge Cluster", "district": "Darjeeling", "sub_district": "Darjeeling", "lat": 27.1250, "lng": 88.1150, "population": 870, "households": 170, "vuln_pop": 290, "elderly": 95, "children": 155, "disabled": 17, "medical": 23, "fragility": 0.62, "slope": 27.0, "elevation": 1950, "hazard": "LANDSLIDE", "hazard_score": 0.64, "risk": "WATCH", "reloc": False}
]

# ==========================================
# 3. SHELTERS (ALL REGIONS)
# ==========================================
ALL_SHELTERS = [
    # Chamoli Shelters
    {"id": "SH-01", "name": "Govt Girls Inter College (GGIC)", "district": "Chamoli", "lat": 30.5592, "lng": 79.5735, "rated": 650, "safe": 520, "current": 180, "water": 9000, "toilets": 30, "meals": 1800, "beds": 16, "type": "SCHOOL"},
    {"id": "SH-02", "name": "Joshimath Municipal Community Hall", "district": "Chamoli", "lat": 30.5541, "lng": 79.5694, "rated": 500, "safe": 400, "current": 120, "water": 6500, "toilets": 22, "meals": 1300, "beds": 12, "type": "COMMUNITY_HALL"},
    {"id": "SH-03", "name": "Auli Road Relief Camp (Army Cantonment)", "district": "Chamoli", "lat": 30.5482, "lng": 79.5781, "rated": 1200, "safe": 960, "current": 250, "water": 18000, "toilets": 55, "meals": 3600, "beds": 35, "type": "MILITARY_BASE"},
    {"id": "SH-04", "name": "Pipalkoti Polytechnic Transit Base", "district": "Chamoli", "lat": 30.4312, "lng": 79.4328, "rated": 1500, "safe": 1200, "current": 310, "water": 22000, "toilets": 70, "meals": 4500, "beds": 45, "type": "TRANSIT_CAMP"},

    # Wayanad Shelters
    {"id": "SH-WY-01", "name": "St. Joseph Higher Secondary School Meppadi", "district": "Wayanad", "lat": 11.5540, "lng": 76.1250, "rated": 1200, "safe": 960, "current": 420, "water": 17000, "toilets": 50, "meals": 3500, "beds": 30, "type": "SCHOOL"},
    {"id": "SH-WY-02", "name": "Kalpetta Town Community Relief Hall", "district": "Wayanad", "lat": 11.6110, "lng": 76.0840, "rated": 1800, "safe": 1440, "current": 580, "water": 25000, "toilets": 75, "meals": 5200, "beds": 50, "type": "COMMUNITY_HALL"},
    {"id": "SH-WY-03", "name": "Vythiri Govt Higher Secondary Camp", "district": "Wayanad", "lat": 11.5480, "lng": 76.0420, "rated": 900, "safe": 720, "current": 210, "water": 12500, "toilets": 38, "meals": 2600, "beds": 24, "type": "SCHOOL"},
    {"id": "SH-WY-04", "name": "Rippon Tea Estate Community Shelter", "district": "Wayanad", "lat": 11.5280, "lng": 76.1380, "rated": 750, "safe": 600, "current": 160, "water": 10500, "toilets": 32, "meals": 2100, "beds": 18, "type": "TRANSIT_CAMP"},

    # Mandi Shelters
    {"id": "SH-MD-01", "name": "Mandi District Sports Complex Relief Center", "district": "Mandi", "lat": 31.7120, "lng": 76.9380, "rated": 2000, "safe": 1600, "current": 480, "water": 28000, "toilets": 85, "meals": 5800, "beds": 60, "type": "SPORTS_COMPLEX"},
    {"id": "SH-MD-02", "name": "Pandoh Govt Senior Secondary Safe Base", "district": "Mandi", "lat": 31.6850, "lng": 77.0320, "rated": 850, "safe": 680, "current": 220, "water": 11500, "toilets": 36, "meals": 2400, "beds": 20, "type": "SCHOOL"},
    {"id": "SH-MD-03", "name": "Sundernagar Community Relief Hall", "district": "Mandi", "lat": 31.5340, "lng": 76.8920, "rated": 1400, "safe": 1120, "current": 310, "water": 19000, "toilets": 60, "meals": 4000, "beds": 35, "type": "COMMUNITY_HALL"},

    # Raigad Shelters
    {"id": "SH-RG-01", "name": "Mahad Municipal High School Safe Shelter", "district": "Raigad", "lat": 18.0920, "lng": 73.4350, "rated": 1300, "safe": 1040, "current": 390, "water": 18000, "toilets": 55, "meals": 3800, "beds": 32, "type": "SCHOOL"},
    {"id": "SH-RG-02", "name": "Mangaon Disaster Evacuation Hall", "district": "Raigad", "lat": 18.2510, "lng": 73.2840, "rated": 1600, "safe": 1280, "current": 320, "water": 22000, "toilets": 68, "meals": 4600, "beds": 42, "type": "COMMUNITY_HALL"},
    {"id": "SH-RG-03", "name": "Poladpur ITI Elevated Relief Base", "district": "Raigad", "lat": 17.9940, "lng": 73.4750, "rated": 800, "safe": 640, "current": 180, "water": 11000, "toilets": 34, "meals": 2300, "beds": 20, "type": "TRANSIT_CAMP"},

    # Dhemaji Shelters
    {"id": "SH-DH-01", "name": "Jonai College High-Ground Relief Camp", "district": "Dhemaji", "lat": 27.8050, "lng": 95.1950, "rated": 1500, "safe": 1200, "current": 460, "water": 21000, "toilets": 64, "meals": 4400, "beds": 38, "type": "COLLEGE"},
    {"id": "SH-DH-02", "name": "Silapathar Town Hall Safe Shelter", "district": "Dhemaji", "lat": 27.6010, "lng": 94.7320, "rated": 1100, "safe": 880, "current": 290, "water": 15000, "toilets": 46, "meals": 3200, "beds": 28, "type": "COMMUNITY_HALL"},
    {"id": "SH-DH-03", "name": "Dhemaji District Stadium Relief Base", "district": "Dhemaji", "lat": 27.4920, "lng": 94.5910, "rated": 2200, "safe": 1760, "current": 610, "water": 31000, "toilets": 95, "meals": 6400, "beds": 65, "type": "STADIUM"},

    # Darjeeling Shelters
    {"id": "SH-DJ-01", "name": "Kalimpong Town Hall Safe Base", "district": "Darjeeling", "lat": 27.0620, "lng": 88.4720, "rated": 1400, "safe": 1120, "current": 330, "water": 19000, "toilets": 58, "meals": 4100, "beds": 36, "type": "COMMUNITY_HALL"},
    {"id": "SH-DJ-02", "name": "Darjeeling Gymkhana Elevated Relief Camp", "district": "Darjeeling", "lat": 27.0450, "lng": 88.2610, "rated": 1600, "safe": 1280, "current": 390, "water": 22500, "toilets": 70, "meals": 4700, "beds": 42, "type": "TRANSIT_CAMP"},
    {"id": "SH-DJ-03", "name": "Melli Safe Ridge High School Shelter", "district": "Darjeeling", "lat": 27.0850, "lng": 88.4550, "rated": 850, "safe": 680, "current": 170, "water": 11500, "toilets": 36, "meals": 2500, "beds": 22, "type": "SCHOOL"}
]

# ==========================================
# 4. HAZARDS GEOJSON GENERATION
# ==========================================
ALL_HAZARDS = [
    # Chamoli
    {
        "id": "HAZ-01", "name": "Joshimath Core Subsidence Red Zone", "district": "Chamoli", "hazard_type": "SUBSIDENCE",
        "severity": "CRITICAL", "risk_score": 0.94, "area_sqkm": 2.85, "color": "#EF4444",
        "poly": [[79.558, 30.565], [79.572, 30.562], [79.574, 30.551], [79.563, 30.548], [79.555, 30.556], [79.558, 30.565]],
        "warning": "Active ground fissures detected along Manohar Bagh and Sunil wards."
    },
    {
        "id": "HAZ-02", "name": "Raini-Tapovan GLOF & Flash Flood Corridor", "district": "Chamoli", "hazard_type": "GLOF",
        "severity": "CRITICAL", "risk_score": 0.91, "area_sqkm": 4.10, "color": "#DC2626",
        "poly": [[79.620, 30.490], [79.695, 30.480], [79.710, 30.495], [79.635, 30.510], [79.620, 30.490]],
        "warning": "Rishiganga and Dhauliganga confluence flash flood inundation threat."
    },
    # Wayanad
    {
        "id": "HAZ-WY-01", "name": "Chooralmala-Mundakkai Debris Avalanche Red Zone", "district": "Wayanad", "hazard_type": "LANDSLIDE",
        "severity": "CRITICAL", "risk_score": 0.98, "area_sqkm": 5.40, "color": "#EF4444",
        "poly": [[76.160, 11.530], [76.195, 11.545], [76.198, 11.570], [76.175, 11.565], [76.155, 11.540], [76.160, 11.530]],
        "warning": "Severe slope collapse with high-speed boulder and slurry debris avalanche."
    },
    {
        "id": "HAZ-WY-02", "name": "Iruvaizhinji River Flash Surge Corridor", "district": "Wayanad", "hazard_type": "FLASH_FLOOD",
        "severity": "HIGH", "risk_score": 0.85, "area_sqkm": 3.20, "color": "#F97316",
        "poly": [[76.140, 11.520], [76.170, 11.535], [76.165, 11.555], [76.135, 11.535], [76.140, 11.520]],
        "warning": "Rapid river swell threatening bridges and low-lying tea estate colonies."
    },
    # Mandi
    {
        "id": "HAZ-MD-01", "name": "Kotropi Massive Landslide Scar Zone", "district": "Mandi", "hazard_type": "LANDSLIDE",
        "severity": "CRITICAL", "risk_score": 0.95, "area_sqkm": 3.80, "color": "#EF4444",
        "poly": [[76.870, 31.930], [76.900, 31.935], [76.905, 31.955], [76.875, 31.950], [76.870, 31.930]],
        "warning": "Recurrent structural highway collapse zone with massive regolith slide."
    },
    {
        "id": "HAZ-MD-02", "name": "Beas River Gorge Inundation Zone", "district": "Mandi", "hazard_type": "FLASH_FLOOD",
        "severity": "HIGH", "risk_score": 0.87, "area_sqkm": 4.50, "color": "#F97316",
        "poly": [[76.920, 31.690], [77.060, 31.660], [77.070, 31.680], [76.930, 31.720], [76.920, 31.690]],
        "warning": "Pandoh Dam high-discharge flood corridor exceeding red danger marks."
    },
    # Raigad
    {
        "id": "HAZ-RG-01", "name": "Taliye Cliff Failure Risk Polygon", "district": "Raigad", "hazard_type": "LANDSLIDE",
        "severity": "CRITICAL", "risk_score": 0.96, "area_sqkm": 2.20, "color": "#EF4444",
        "poly": [[73.475, 18.010], [73.495, 18.015], [73.500, 18.030], [73.480, 18.028], [73.475, 18.010]],
        "warning": "Laterite hillock liquefaction hazard threatening foothill habitations."
    },
    {
        "id": "HAZ-RG-02", "name": "Savitri River Flash Flood Plain", "district": "Raigad", "hazard_type": "FLASH_FLOOD",
        "severity": "HIGH", "risk_score": 0.89, "area_sqkm": 4.80, "color": "#F97316",
        "poly": [[73.410, 18.070], [73.445, 18.075], [73.450, 18.100], [73.415, 18.095], [73.410, 18.070]],
        "warning": "High tide backwater push causing rapid town inundation in Mahad."
    },
    # Dhemaji
    {
        "id": "HAZ-DH-01", "name": "Brahmaputra Bank Embankment Breach Red Zone", "district": "Dhemaji", "hazard_type": "RIVER_FLOOD",
        "severity": "CRITICAL", "risk_score": 0.95, "area_sqkm": 8.50, "color": "#EF4444",
        "poly": [[95.160, 27.780], [95.210, 27.790], [95.215, 27.820], [95.165, 27.810], [95.160, 27.780]],
        "warning": "Direct erosion and riverbank collapse cutting off Jonai link road."
    },
    # Darjeeling
    {
        "id": "HAZ-DJ-01", "name": "Teesta Canyon GLOF Inundation Corridor", "district": "Darjeeling", "hazard_type": "GLOF",
        "severity": "CRITICAL", "risk_score": 0.96, "area_sqkm": 6.20, "color": "#EF4444",
        "poly": [[88.410, 27.040], [88.450, 27.050], [88.460, 27.085], [88.420, 27.075], [88.410, 27.040]],
        "warning": "High-velocity glacial surge wave along NH-10 Teesta highway."
    }
]

# ==========================================
# 5. ROAD SEGMENTS (ALL REGIONS)
# ==========================================
ALL_ROADS = [
    # Chamoli
    {"id": "ROAD-01", "name": "Badrinath National Highway (NH-07)", "district": "Chamoli", "from": "HAB-01", "to": "SH-01", "km": 1.4, "time": 3.5, "hazard_exp": 0.75},
    {"id": "ROAD-02", "name": "Joshimath Upper Ring Arterial", "district": "Chamoli", "from": "HAB-02", "to": "SH-01", "km": 2.1, "time": 5.0, "hazard_exp": 0.85},
    {"id": "ROAD-03", "name": "Auli Ropeway Evacuation Spur", "district": "Chamoli", "from": "HAB-03", "to": "SH-03", "km": 3.8, "time": 7.5, "hazard_exp": 0.30},
    {"id": "ROAD-04", "name": "Pipalkoti Valley Highway Connector", "district": "Chamoli", "from": "HAB-04", "to": "SH-04", "km": 14.5, "time": 24.0, "hazard_exp": 0.40},

    # Wayanad
    {"id": "ROAD-WY-01", "name": "Meppadi-Chooralmala Arterial Road", "district": "Wayanad", "from": "HAB-WY-01", "to": "SH-WY-01", "km": 4.8, "time": 8.0, "hazard_exp": 0.90},
    {"id": "ROAD-WY-02", "name": "Chooralmala-Mundakkai Bailey Bridge Corridor", "district": "Wayanad", "from": "HAB-WY-02", "to": "SH-WY-01", "km": 6.2, "time": 12.0, "hazard_exp": 0.95},
    {"id": "ROAD-WY-03", "name": "Vellarmala-Kalpetta Highway Spur", "district": "Wayanad", "from": "HAB-WY-03", "to": "SH-WY-02", "km": 11.5, "time": 18.0, "hazard_exp": 0.45},
    {"id": "ROAD-WY-04", "name": "Attamala-Vythiri Relief Bypass", "district": "Wayanad", "from": "HAB-WY-04", "to": "SH-WY-03", "km": 14.0, "time": 22.0, "hazard_exp": 0.50},

    # Mandi
    {"id": "ROAD-MD-01", "name": "NH-154 Mandi-Kotropi Bypass", "district": "Mandi", "from": "HAB-MD-01", "to": "SH-MD-01", "km": 16.5, "time": 26.0, "hazard_exp": 0.88},
    {"id": "ROAD-MD-02", "name": "Pandoh Dam High-Spur Arterial", "district": "Mandi", "from": "HAB-MD-02", "to": "SH-MD-02", "km": 3.2, "time": 6.0, "hazard_exp": 0.70},
    {"id": "ROAD-MD-03", "name": "Dharampur-Sundernagar Connector", "district": "Mandi", "from": "HAB-MD-03", "to": "SH-MD-03", "km": 18.0, "time": 25.0, "hazard_exp": 0.40},

    # Raigad
    {"id": "ROAD-RG-01", "name": "Mahad-Taliye Rural Access Road", "district": "Raigad", "from": "HAB-RG-01", "to": "SH-RG-01", "km": 8.5, "time": 15.0, "hazard_exp": 0.85},
    {"id": "ROAD-RG-02", "name": "Savitri Flood Bypass to Mangaon", "district": "Raigad", "from": "HAB-RG-02", "to": "SH-RG-02", "km": 14.2, "time": 20.0, "hazard_exp": 0.65},

    # Dhemaji
    {"id": "ROAD-DH-01", "name": "NH-515 Jonai Flood Relief Highway", "district": "Dhemaji", "from": "HAB-DH-01", "to": "SH-DH-01", "km": 3.5, "time": 6.0, "hazard_exp": 0.80},
    {"id": "ROAD-DH-02", "name": "Silapathar Embankment Crest Arterial", "district": "Dhemaji", "from": "HAB-DH-02", "to": "SH-DH-02", "km": 4.1, "time": 7.0, "hazard_exp": 0.75},

    # Darjeeling
    {"id": "ROAD-DJ-01", "name": "NH-10 Teesta Valley High-Priority Route", "district": "Darjeeling", "from": "HAB-DJ-01", "to": "SH-DJ-01", "km": 7.8, "time": 14.0, "hazard_exp": 0.88},
    {"id": "ROAD-DJ-02", "name": "Kurseong-Darjeeling Ridge Highway", "district": "Darjeeling", "from": "HAB-DJ-02", "to": "SH-DJ-02", "km": 12.4, "time": 21.0, "hazard_exp": 0.60}
]

def build_and_save_geojson():
    # 1. Habitations GeoJSON
    hab_features = []
    for h in ALL_HABITATIONS:
        hab_features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [h["lng"], h["lat"]]
            },
            "properties": {
                "id": h["id"],
                "name": h["name"],
                "district": h["district"],
                "sub_district": h.get("sub_district", ""),
                "population": h["population"],
                "households": h["households"],
                "vulnerable_population": h["vuln_pop"],
                "vulnerability_ratio": round(h["vuln_pop"] / max(1, h["population"]), 3),
                "elderly_count": h["elderly"],
                "children_count": h["children"],
                "disabled_count": h["disabled"],
                "medical_needs_count": h["medical"],
                "housing_fragility_index": h["fragility"],
                "slope_degrees": h["slope"],
                "elevation_meters": h["elevation"],
                "primary_hazard": h["hazard"],
                "hazard_score": h["hazard_score"],
                "risk_category": h["risk"],
                "immediate_relocation_needed": h["reloc"],
                "road_access_distance_m": 150,
                "updated_at": NOW
            }
        })
    
    with open(os.path.join(DEMO_DIR, "habitations.geojson"), "w", encoding="utf-8") as f:
        json.dump({
            "type": "FeatureCollection",
            "metadata": {"title": "ResQZone Vulnerable Habitations - Pan India", "generated_at": NOW, "crs": "CRS84"},
            "features": hab_features
        }, f, indent=2)

    # 2. Shelters GeoJSON
    shelter_features = []
    for s in ALL_SHELTERS:
        shelter_features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [s["lng"], s["lat"]]
            },
            "properties": {
                "id": s["id"],
                "name": s["name"],
                "district": s["district"],
                "type": s["type"],
                "rated_capacity": s["rated"],
                "safe_occupancy": s["safe"],
                "current_occupancy": s["current"],
                "water_supply_lpd": s["water"],
                "sanitation_toilets": s["toilets"],
                "food_meals_daily": s["meals"],
                "medical_isolation_beds": s["beds"],
                "power_backup": True,
                "effective_safe_capacity": s["safe"],
                "bottleneck_resource": "water" if (s["water"] / 15.0) < s["safe"] else "beds",
                "capacity_status": "HIGH_LOAD" if (s["current"] / s["safe"]) > 0.75 else "AVAILABLE",
                "capacity_utilization_pct": round((s["current"] / s["safe"]) * 100, 1),
                "operating_status": "ACTIVE",
                "accessibility_score": 0.88,
                "is_open": True,
                "updated_at": NOW
            }
        })

    with open(os.path.join(DEMO_DIR, "shelters.geojson"), "w", encoding="utf-8") as f:
        json.dump({
            "type": "FeatureCollection",
            "metadata": {"title": "ResQZone Safe Shelters - Pan India", "generated_at": NOW, "crs": "CRS84"},
            "features": shelter_features
        }, f, indent=2)

    # 3. Hazards GeoJSON
    haz_features = []
    for hz in ALL_HAZARDS:
        haz_features.append({
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [hz["poly"]]
            },
            "properties": {
                "id": hz["id"],
                "name": hz["name"],
                "district": hz["district"],
                "hazard_type": hz["hazard_type"],
                "severity": hz["severity"],
                "risk_score": hz["risk_score"],
                "confidence_score": 0.91,
                "area_sqkm": hz["area_sqkm"],
                "drivers": {
                    "primary_vector": hz["hazard_type"],
                    "district": hz["district"],
                    "severity": hz["severity"]
                },
                "color": hz["color"],
                "warning_message": hz["warning"]
            }
        })

    with open(os.path.join(DEMO_DIR, "hazards.geojson"), "w", encoding="utf-8") as f:
        json.dump({
            "type": "FeatureCollection",
            "metadata": {"title": "ResQZone Multi-Hazard Zones - Pan India", "generated_at": NOW, "crs": "CRS84"},
            "features": haz_features
        }, f, indent=2)

    # 4. Roads GeoJSON
    road_features = []
    for r in ALL_ROADS:
        from_hab = next((h for h in ALL_HABITATIONS if h["id"] == r["from"]), None)
        to_sh = next((s for s in ALL_SHELTERS if s["id"] == r["to"]), None)
        if from_hab and to_sh:
            coords = [
                [from_hab["lng"], from_hab["lat"]],
                [(from_hab["lng"] + to_sh["lng"]) / 2, (from_hab["lat"] + to_sh["lat"]) / 2 + 0.003],
                [to_sh["lng"], to_sh["lat"]]
            ]
        else:
            coords = [[79.56, 30.55], [79.57, 30.56]]

        road_features.append({
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": coords
            },
            "properties": {
                "id": r["id"],
                "name": r["name"],
                "district": r["district"],
                "from_node": r["from"],
                "to_node": r["to"],
                "from_name": from_hab["name"] if from_hab else "",
                "to_name": to_sh["name"] if to_sh else "",
                "distance_km": r["km"],
                "speed_limit_kmh": 35.0,
                "base_travel_time_min": r["time"],
                "road_class": "STATE_HIGHWAY" if "NH" in r["name"] or "Highway" in r["name"] else "DISTRICT_ROAD",
                "pavement_condition": "FAIR" if r["hazard_exp"] > 0.8 else "GOOD",
                "slope_risk_score": round(r["hazard_exp"] * 0.7, 2),
                "hazard_exposure_score": r["hazard_exp"],
                "is_blocked": False,
                "blocked_reason": None
            }
        })

    with open(os.path.join(DEMO_DIR, "roads.geojson"), "w", encoding="utf-8") as f:
        json.dump({
            "type": "FeatureCollection",
            "metadata": {"title": "ResQZone Road Evacuation Network - Pan India", "generated_at": NOW, "crs": "CRS84"},
            "features": road_features
        }, f, indent=2)

    print(f"Generated GeoJSONs: {len(hab_features)} habitations, {len(shelter_features)} shelters, {len(haz_features)} hazards, {len(road_features)} roads across 6 states/districts.")


def seed_sqlite_directly():
    db_path = os.path.join(BASE_DIR, "resqzone.db")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    # Clear existing data in entities
    c.execute("DELETE FROM habitations")
    c.execute("DELETE FROM shelters")
    c.execute("DELETE FROM hazard_zones")
    c.execute("DELETE FROM road_segments")

    # Insert habitations
    for h in ALL_HABITATIONS:
        coords = [h["lng"], h["lat"]]
        c.execute("""
            INSERT INTO habitations (
                id, name, district, sub_district, latitude, longitude,
                total_population, households_count, vulnerable_population,
                elderly_count, children_count, disabled_count, medically_vulnerable_count,
                housing_fragility_score, slope_degrees, elevation_meters, road_access_distance_m,
                primary_hazard_type, hazard_score, risk_category, immediate_relocation_needed,
                geometry_geojson, meta_attributes, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            h["id"], h["name"], h["district"], h.get("sub_district", ""), h["lat"], h["lng"],
            h["population"], h["households"], h["vuln_pop"],
            h["elderly"], h["children"], h["disabled"], h["medical"],
            h["fragility"], h["slope"], h["elevation"], 150,
            h["hazard"], h["hazard_score"], h["risk"], 1 if h["reloc"] else 0,
            json.dumps({"type": "Point", "coordinates": coords}),
            json.dumps(h), NOW
        ))

    # Insert shelters
    for s in ALL_SHELTERS:
        coords = [s["lng"], s["lat"]]
        c.execute("""
            INSERT INTO shelters (
                id, name, shelter_type, district, latitude, longitude,
                rated_capacity, safe_occupancy, current_occupancy,
                water_capacity_lpd, sanitation_units, food_capacity_meals_per_day,
                medical_isolation_beds, power_backup, effective_safe_capacity,
                bottleneck_resource, capacity_status, capacity_utilization_pct,
                operating_status, accessibility_score, is_open, geometry_geojson, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            s["id"], s["name"], s["type"], s["district"], s["lat"], s["lng"],
            s["rated"], s["safe"], s["current"],
            s["water"], s["toilets"], s["meals"],
            s["beds"], 1, s["safe"],
            "water", "HIGH_LOAD" if (s["current"] / s["safe"]) > 0.75 else "AVAILABLE",
            round((s["current"] / s["safe"]) * 100, 1),
            "ACTIVE", 0.88, 1,
            json.dumps({"type": "Point", "coordinates": coords}), NOW
        ))

    # Insert hazards
    for hz in ALL_HAZARDS:
        c.execute("""
            INSERT INTO hazard_zones (
                id, name, hazard_type, severity, risk_score, confidence_score,
                area_sqkm, drivers_json, geometry_geojson, color_hex, warning_message, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            hz["id"], hz["name"], hz["hazard_type"], hz["severity"], hz["risk_score"], 0.91,
            hz["area_sqkm"], json.dumps({"district": hz["district"], "type": hz["hazard_type"]}),
            json.dumps({"type": "Polygon", "coordinates": [hz["poly"]]}),
            hz["color"], hz["warning"], NOW
        ))

    # Insert roads
    for r in ALL_ROADS:
        from_hab = next((h for h in ALL_HABITATIONS if h["id"] == r["from"]), None)
        to_sh = next((s for s in ALL_SHELTERS if s["id"] == r["to"]), None)
        if from_hab and to_sh:
            coords = [
                [from_hab["lng"], from_hab["lat"]],
                [(from_hab["lng"] + to_sh["lng"]) / 2, (from_hab["lat"] + to_sh["lat"]) / 2 + 0.003],
                [to_sh["lng"], to_sh["lat"]]
            ]
        else:
            coords = [[79.56, 30.55], [79.57, 30.56]]

        c.execute("""
            INSERT INTO road_segments (
                id, name, from_node, to_node, from_name, to_name,
                distance_km, speed_limit_kmh, base_travel_time_min,
                road_class, pavement_condition, slope_risk_score,
                hazard_exposure_score, is_blocked, geometry_geojson
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            r["id"], r["name"], r["from"], r["to"],
            from_hab["name"] if from_hab else "", to_sh["name"] if to_sh else "",
            r["km"], 35.0, r["time"],
            "STATE_HIGHWAY" if "NH" in r["name"] or "Highway" in r["name"] else "DISTRICT_ROAD",
            "GOOD", round(r["hazard_exp"] * 0.7, 2), r["hazard_exp"], 0,
            json.dumps({"type": "LineString", "coordinates": coords})
        ))

    conn.commit()
    conn.close()
    print("Direct SQLite seed finished successfully.")


if __name__ == "__main__":
    build_and_save_geojson()
    seed_sqlite_directly()
