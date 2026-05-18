from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import math
import heapq

app = FastAPI()

# Enable CORS untuk React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== Data Models =====
class Node(BaseModel):
    id: int
    name: str
    x: float
    y: float
    elevation: float

class Edge(BaseModel):
    from_idx: int
    to_idx: int
    has_roof: bool

class RouteRequest(BaseModel):
    nodes: List[Node]
    edges: List[Edge]
    start: str
    goal: str
    slope_weight: float
    is_raining: bool

class RouteResponse(BaseModel):
    path: List[str]
    total_cost: float

# ===== Helper Functions =====
def hitung_jarak(node1: Node, node2: Node) -> float:
    """Hitung jarak antar dua node menggunakan Pythagoras"""
    dx = node2.x - node1.x
    dy = node2.y - node1.y
    return math.sqrt(dx*dx + dy*dy)

def hitung_slope(node1: Node, node2: Node) -> float:
    """Hitung slope (kemiringan) dalam persen"""
    jarak = hitung_jarak(node1, node2)
    if jarak == 0:
        return 0
    d_elev = abs(node2.elevation - node1.elevation)
    return (d_elev / jarak) * 100

def find_node_index(nodes: List[Node], name: str) -> int:
    """Cari index node berdasarkan nama"""
    for i, node in enumerate(nodes):
        if node.name == name:
            return i
    return -1

def dijkstra(
    nodes: List[Node],
    edges: List[Edge],
    start_idx: int,
    goal_idx: int,
    slope_weight: float,
    is_raining: bool
) -> tuple[List[str], float]:
    """
    Implementasi algoritma Dijkstra dengan modifikasi untuk slope & roof
    """
    n = len(nodes)
    
    # Inisialisasi
    dist = [float('inf')] * n
    prev = [-1] * n
    dist[start_idx] = 0.0
    
    # Priority queue: (cost, node_idx)
    pq = [(0.0, start_idx)]
    visited = set()
    
    while pq:
        current_cost, current_idx = heapq.heappop(pq)
        
        # Skip jika sudah dikunjungi
        if current_idx in visited:
            continue
        visited.add(current_idx)
        
        # Jika sudah sampai goal, bisa berhenti
        if current_idx == goal_idx:
            break
        
        # Skip jika cost lebih besar dari yang sudah tercatat
        if current_cost > dist[current_idx]:
            continue
        
        # Cek semua edge dari current_idx
        for edge in edges:
            if edge.from_idx != current_idx:
                continue
            
            to_idx = edge.to_idx
            if to_idx in visited:
                continue
            
            # Hitung cost
            node1 = nodes[current_idx]
            node2 = nodes[to_idx]
            
            jarak = hitung_jarak(node1, node2)
            slope = hitung_slope(node1, node2)
            
            # Roof penalty kalau hujan & tidak ada atap
            roof_penalty = 99999 if (is_raining and not edge.has_roof) else 0
            
            cost = jarak + slope_weight * slope + roof_penalty
            new_dist = dist[current_idx] + cost
            
            # Update jika ketemu jalan yang lebih murah
            if new_dist < dist[to_idx]:
                dist[to_idx] = new_dist
                prev[to_idx] = current_idx
                heapq.heappush(pq, (new_dist, to_idx))
    
    # Rekonstruksi path
    path_indices = []
    at = goal_idx
    while at != -1:
        path_indices.append(at)
        at = prev[at]
    
    path_indices.reverse()
    path_names = [nodes[idx].name for idx in path_indices]
    total_cost = dist[goal_idx]
    
    return path_names, total_cost

# ===== API Endpoints =====
@app.get("/")
def read_root():
    return {
        "message": "Campus Route Finder API",
        "version": "1.0",
        "endpoint": "POST /route"
    }

@app.post("/route", response_model=RouteResponse)
def find_route(request: RouteRequest):
    """
    Endpoint untuk mencari rute optimal
    
    Request:
    {
        "nodes": [
            {"id": 0, "name": "Gerbang", "x": 0, "y": 0, "elevation": 800},
            {"id": 1, "name": "Gedung A", "x": 100, "y": 100, "elevation": 810},
        ],
        "edges": [
            {"from_idx": 0, "to_idx": 1, "has_roof": true},
            {"from_idx": 1, "to_idx": 0, "has_roof": true}
        ],
        "start": "Gerbang",
        "goal": "Gedung A",
        "slope_weight": 10,
        "is_raining": true
    }
    """
    
    # Cari index start & goal
    start_idx = find_node_index(request.nodes, request.start)
    goal_idx = find_node_index(request.nodes, request.goal)
    
    if start_idx == -1 or goal_idx == -1:
        return RouteResponse(
            path=["Error: Node tidak ditemukan"],
            total_cost=0
        )
    
    # Panggil dijkstra
    path, total_cost = dijkstra(
        request.nodes,
        request.edges,
        start_idx,
        goal_idx,
        request.slope_weight,
        request.is_raining
    )
    
    return RouteResponse(path=path, total_cost=total_cost)

@app.post("/debug")
def debug_info(request: RouteRequest):
    """Endpoint debug untuk lihat info jarak & slope per edge"""
    result = {
        "nodes": [],
        "edges": []
    }
    
    for node in request.nodes:
        result["nodes"].append({
            "name": node.name,
            "x": node.x,
            "y": node.y,
            "elevation": node.elevation
        })
    
    for edge in request.edges:
        node1 = request.nodes[edge.from_idx]
        node2 = request.nodes[edge.to_idx]
        jarak = hitung_jarak(node1, node2)
        slope = hitung_slope(node1, node2)
        
        result["edges"].append({
            "from": node1.name,
            "to": node2.name,
            "jarak": round(jarak, 2),
            "slope": round(slope, 2),
            "has_roof": edge.has_roof
        })
    
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)