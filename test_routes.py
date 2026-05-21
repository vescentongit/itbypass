import requests

# Simplified test using backend directly
# East corridor: 737 -> 748 -> 752 -> 745 -> 748 -> 746 (steep!)
# West corridor:  737 -> 739 -> 740 -> 741 -> 742 -> 743 -> 752 -> 745 -> 748 -> 746 (gentle)

nodes = [
    {"id": 0, "name": "Start", "x": 0, "y": 0, "elevation": 718},
    {"id": 1, "name": "Goal", "x": 190, "y": 618, "elevation": 746},
    {"id": 2, "name": "JalanMasuk", "x": 0, "y": 0, "elevation": 718},
    {"id": 3, "name": "Bundaran", "x": 59, "y": 170, "elevation": 726},
    {"id": 4, "name": "JlnTengah", "x": 34, "y": 257, "elevation": 731},
    {"id": 5, "name": "JlnUtara", "x": 12, "y": 421, "elevation": 737},
    # East (steep)
    {"id": 6, "name": "KorLabtekI", "x": 51, "y": 458, "elevation": 748},
    {"id": 7, "name": "SimpangGKU", "x": 103, "y": 430, "elevation": 752},
    {"id": 8, "name": "KorGKUI", "x": 149, "y": 488, "elevation": 745},
    {"id": 9, "name": "KorRektorat", "x": 224, "y": 580, "elevation": 748},
    {"id": 10, "name": "KorKOICA", "x": 190, "y": 618, "elevation": 746},
    # West (gentle)
    {"id": 11, "name": "KorLabtekII", "x": -35, "y": 571, "elevation": 739},
    {"id": 12, "name": "KorSBM", "x": 33, "y": 579, "elevation": 740},
    {"id": 13, "name": "KorGKA", "x": 85, "y": 565, "elevation": 741},
    {"id": 14, "name": "KorGKC", "x": 115, "y": 550, "elevation": 742},
    {"id": 15, "name": "KorGKDE", "x": 112, "y": 490, "elevation": 743},
    {"id": 16, "name": "SimpangKOICA-GKA", "x": 140, "y": 590, "elevation": 744},
]

edges = []
def add(f, t):
    edges.append({"from_idx": f, "to_idx": t, "has_roof": True})
    edges.append({"from_idx": t, "to_idx": f, "has_roof": True})

# Location access
add(0, 2)   # Start -> JalanMasuk
add(1, 10)  # Goal -> KorKOICA

# Main artery
add(2, 3); add(3, 4); add(4, 5)

# East (steep)
add(5, 6); add(6, 7); add(7, 8); add(8, 9); add(9, 10)

# West (gentle)
add(5, 11); add(11, 12); add(12, 13); add(13, 14); add(14, 15); add(15, 7)

# Cross connections
add(13, 16); add(16, 10); add(16, 14)

for mode, sw in [("fast", 0), ("flat", 10)]:
    body = {
        "nodes": nodes, "edges": edges,
        "start": "Start", "goal": "Goal",
        "slope_weight": sw, "is_raining": False
    }
    r = requests.post("http://localhost:8000/route", json=body)
    data = r.json()
    print(f"\n=== {mode} (slope_weight={sw}) ===")
    print(f"Path: {' -> '.join(data['path'])}")
    print(f"Cost: {data['total_cost']:.2f}")
