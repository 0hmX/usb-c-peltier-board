"""Read-only independent scan of exact Source23 all-layer via and PTH copper."""
import sys, json, hashlib
from pathlib import Path
from collections import Counter
from shapely.geometry import Point, LineString, Polygon
from shapely.strtree import STRtree

ROOT=Path('/Users/ankan/Documents/Codex/2026-10-09/per/work/board-debug-revision')
OUT=Path('/Users/ankan/Documents/Codex/2026-10-09/per/work/routing-rating-source23')
capture=ROOT/'dist/debug-source-placement-23/circuit.json'
payload=capture.read_bytes()
assert hashlib.sha256(payload).hexdigest()=='3ac5f3126c9385045571f0d20c2117097c6722c8f6dad9644323e49eea25f872'
reader=ROOT/'scripts/audit-net-continuity.py'
ns={}; sys.argv=['identity-reader','--input',str(capture),'--output',str(OUT/'unused.json')]
exec(compile(reader.read_text().split("layers = ['top', 'inner1', 'inner2', 'bottom']")[0],str(reader),'exec'),ns)
els=ns['elements']; netroot=ns['element_root']; labels=ns['net_labels']; shape=ns['shape']
def name(e):
    root=netroot(e)
    return '|'.join(sorted(labels[root])) or str(root)
def eid(e): return e.get(e['type']+'_id')
nodes=[]
for e in els:
    kind=e['type']
    if kind=='pcb_smtpad':
        root=netroot(e)
        nodes.append(dict(element=e,kind=kind,layer=e['layer'],geometry=shape(e),name=name(e) if root else 'UNASSIGNED '+str(eid(e)),root=root or 'UNASSIGNED '+str(eid(e))))
    elif kind in ('pcb_plated_hole','pcb_via'):
        if kind=='pcb_plated_hole' and not e.get('pcb_port_id'): continue
        if kind=='pcb_via':
            outer=Point(e['x'],e['y']).buffer(e['outer_diameter']/2,resolution=256)
            hole=Point(e['x'],e['y']).buffer(e['hole_diameter']/2,resolution=256)
        else: outer=shape(e); hole=shape(e,drilled=True)
        for layer in e['layers']:
            nodes.append(dict(element=e,kind=kind,layer=layer,geometry=outer.difference(hole),outer=outer,center=Point(e['x'],e['y']),name=name(e),root=netroot(e)))
    elif kind=='pcb_copper_pour':
        b=e['brep_shape']; g=Polygon([(v['x'],v['y']) for v in b['outer_ring']['vertices']], [[(v['x'],v['y']) for v in r['vertices']] for r in b.get('inner_rings',[])])
        nodes.append(dict(element=e,kind=kind,layer=e['layer'],geometry=g,name=name(e),root=netroot(e)))
    elif kind=='pcb_trace':
        for i,(a,b) in enumerate(zip(e['route'],e['route'][1:])):
            wires=[p for p in (a,b) if p['route_type']=='wire']
            if not wires: continue
            layer=wires[0]['layer']
            if any(p['layer']!=layer for p in wires): continue
            assert not any(p.get('start_pcb_trace_width') or p.get('end_pcb_trace_width') for p in wires)
            width=max(p['width'] for p in wires)
            coords=[(p['x'],p['y']) for p in (a,b)]
            center=Point(coords[0]) if coords[0]==coords[1] else LineString(coords)
            nodes.append(dict(element=e,kind=kind,layer=layer,geometry=center.buffer(width/2,resolution=128),line=center,width=width,segmentIndex=i,name=name(e),root=netroot(e)))
by_layer={l:[n for n in nodes if n['layer']==l] for l in ('top','inner1','inner2','bottom')}
trees={l:STRtree([n['geometry'] for n in ns]) for l,ns in by_layer.items()}
board=next(e for e in els if e['type']=='pcb_board')
findings=[]; candidates=0; same=0; minimum={}; nearest=[]; below_preferred=[]
for n in nodes:
    if n['kind'] not in ('pcb_via','pcb_plated_hole'): continue
    e=n['element']; layer=n['layer']
    for index in trees[layer].query(n['outer'].buffer(.31)):
        other=by_layer[layer][int(index)]
        if eid(other['element'])==eid(e): continue
        if n['root']==other['root']: same+=1; continue
        candidates+=1
        # Analytic circle/constant-width sweep distance for vias. Other shapes use
        # their native polygon model with 1024-segment via circles.
        if n['kind']=='pcb_via' and other['kind']=='pcb_trace':
            gap=n['center'].distance(other['line'])-e['outer_diameter']/2-other['width']/2
        elif n['kind']=='pcb_via' and other['kind']=='pcb_via':
            o=other['element']; gap=n['center'].distance(other['center'])-(e['outer_diameter']+o['outer_diameter'])/2
        elif n['kind']=='pcb_via':
            gap=n['center'].distance(other['geometry'])-e['outer_diameter']/2
        else: gap=n['geometry'].distance(other['geometry'])
        overlap=n['geometry'].intersection(other['geometry']).area
        required=board['min_pad_edge_to_pad_edge_clearance'] if other['kind']=='pcb_via' else board['min_via_edge_to_pad_edge_clearance']
        drill_gap=None
        if n['kind']=='pcb_via' and other['kind']=='pcb_via':
            o=other['element']; drill_gap=n['center'].distance(other['center'])-(e['hole_diameter']+o['hole_diameter'])/2
        sample=dict(barrelId=eid(e),foreignId=eid(other['element']),foreignType=other['kind'],foreignSegmentIndex=other.get('segmentIndex'),nets=[n['name'],other['name']],layer=layer,x=e['x'],y=e['y'],copperGapMm=gap,requiredCopperGapMm=required,drillGapMm=drill_gap,overlapAreaMm2=overlap)
        if layer not in minimum or gap<minimum[layer]['copperGapMm']: minimum[layer]=sample
        if gap<.205: nearest.append(sample)
        if gap<.2-1e-7: below_preferred.append(sample)
        if overlap>1e-10 or gap<required-1e-7 or (drill_gap is not None and drill_gap<board['min_via_hole_edge_to_via_hole_edge_clearance']-1e-7): findings.append(sample)
result=dict(circuitSha256=hashlib.sha256(payload).hexdigest(),checkerSha256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),viaCount=sum(e['type']=='pcb_via' for e in els),platedHoleCount=sum(e['type']=='pcb_plated_hole' for e in els),viaDimensionClasses=dict(Counter(f"{e['hole_diameter']}/{e['outer_diameter']}" for e in els if e['type']=='pcb_via')),viasByNamedNet=dict(Counter(name(e) for e in els if e['type']=='pcb_via')),barrelLayerNodes=sum(n['kind'] in ('pcb_via','pcb_plated_hole') for n in nodes),foreignCandidatesMeasured=candidates,sameNetPairsExempt=same,minimumByLayer=minimum,nearThreshold=nearest,belowPreferredPoint2Mm=below_preferred,findings=findings,confirmedCopperOverlaps=[s for s in findings if s['overlapAreaMm2']>1e-10],methods=['Source logical trace unions select expected nets; native coordinates establish contacts.','All barrel layer representations are checked against foreign SMT pads, plated holes, vias, constant-width trace sweeps and native BREP pours.','Circle-versus-swept-trace and via-versus-via gaps are analytic; via annuli use 1024-edge circles for overlap confirmation.','Search radius 0.31 mm around outer barrel hull exceeds tested 0.20 mm clearance. Actual board policy is 0.15 mm via copper to foreign via copper, 0.30 mm drill to drill, and 0.20 mm via to pad/trace/pour. Numerical tolerance 1e-7 mm.','Below 0.20 mm preferred copper spacing is reported separately as refinement, not mislabeled as a declared-policy violation.'],limitations=['Other polygon models reuse independently audited native shape reader; imported pad geometric mapping is not rederived from datasheets.','Finished drill tolerances, mask, thermal ampacity and manufactured/bench behavior are not established.'])
(OUT/'rating_via_shorts_direct_checks.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({k:result[k] for k in ('circuitSha256','viaCount','platedHoleCount','viaDimensionClasses','barrelLayerNodes','foreignCandidatesMeasured','minimumByLayer')}))
print('findings',len(findings),'overlaps',len(result['confirmedCopperOverlaps']))
