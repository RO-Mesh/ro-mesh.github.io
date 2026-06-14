import json

with open('/home/stefan/Documents/Projects/RO-MESH/frontend/public/data/romania-judete.geojson', 'r') as f:
    geojson = json.load(f)

coords = {}
for feature in geojson['features']:
    props = feature['properties']
    name = props.get('name') or props.get('NAME') or props.get('JUDET')
    
    geom_type = feature['geometry']['type']
    coordinates = feature['geometry']['coordinates']
    
    # Calculate simple bounding box center as a proxy for centroid
    min_lng, min_lat, max_lng, max_lat = 180, 90, -180, -90
    
    def update_bounds(lng, lat):
        global min_lng, min_lat, max_lng, max_lat
        min_lng = min(min_lng, lng)
        min_lat = min(min_lat, lat)
        max_lng = max(max_lng, lng)
        max_lat = max(max_lat, lat)

    if geom_type == 'Polygon':
        for ring in coordinates:
            for pt in ring:
                update_bounds(pt[0], pt[1])
    elif geom_type == 'MultiPolygon':
        for poly in coordinates:
            for ring in poly:
                for pt in ring:
                    update_bounds(pt[0], pt[1])
                    
    center_lng = (min_lng + max_lng) / 2
    center_lat = (min_lat + max_lat) / 2
    
    coords[name] = [center_lat, center_lng]

with open('/home/stefan/Documents/Projects/RO-MESH/frontend/public/data/judete-coords.json', 'w') as f:
    json.dump(coords, f, indent=2, ensure_ascii=False)

print("Coordinates saved.")
