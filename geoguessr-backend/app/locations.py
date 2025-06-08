import random

ALL_LOCATIONS = [
    {"name": "Eiffel Tower", "lat": 48.8584, "lng": 2.2945},
    {"name": "Colosseum", "lat": 41.8902, "lng": 12.4922},
    {"name": "Big Ben", "lat": 51.5007, "lng": -0.1246},
    {"name": "Brandenburg Gate", "lat": 52.5163, "lng": 13.3777},
    {"name": "Western Wall", "lat": 31.7767, "lng": 35.2345},
    {"name": "Tel Aviv Beach", "lat": 32.0809, "lng": 34.7680},
    {"name": "Baháʼí Gardens", "lat": 32.8156, "lng": 34.9862},
    {"name": "Times Square", "lat": 40.7580, "lng": -73.9855},
    {"name": "Shibuya Crossing", "lat": 35.6595, "lng": 139.7005},
    {"name": "Sydney Opera House", "lat": -33.8568, "lng": 151.2153},
    {"name": "Golden Gate Bridge", "lat": 37.8199, "lng": -122.4783},
    {"name": "Burj Khalifa", "lat": 25.1972, "lng": 55.2744},
    {"name": "Pyramids of Giza", "lat": 29.9792, "lng": 31.1342},
    {"name": "Mount Fuji Viewpoint", "lat": 35.3606, "lng": 138.7274},
    {"name": "Machu Picchu", "lat": -13.1631, "lng": -72.5450},
    {"name": "Niagara Falls", "lat": 43.0962, "lng": -79.0377},
]

MAPS = {
    "all": ALL_LOCATIONS,
}

def get_random_location_from_map(map_name="all"):
    locations = MAPS.get(map_name.lower())
    if not locations:
        raise ValueError(f"Map '{map_name}' not found.")
    return random.choice(locations)
