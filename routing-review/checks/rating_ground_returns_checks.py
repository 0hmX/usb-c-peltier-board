import json,sys,hashlib,math
from pathlib import Path
from shapely.geometry import Polygon,LineString,Point
from shapely.ops import unary_union
root=Path('/Users/ankan/Documents/Codex/2026-10-09/per/work/board-debug-revision')
input=root/'dist/debug-source-placement-23/circuit.json'
reader=root/'scripts/audit-net-continuity.py'
out=Path('/Users/ankan/Documents/Codex/2026-10-09/per/work/routing-rating-source23/rating_ground_returns_checks.json')
ns={};sys.argv=[str(reader),'--input',str(input),'--output',str(out)]
exec(compile(reader.read_text().split('nodes = []',1)[0],str(reader),'exec'),ns)
elements=ns['elements']; er=ns['element_root']; labels=ns['net_labels']; gnd=next(k for k,v in labels.items() if v=={'GND'})
def net(e):return '|'.join(sorted(labels.get(er(e),[]))) or 'unlabelled'
ground=[]
for e in elements:
 if e['type']=='pcb_copper_pour' and e['layer']=='inner1' and er(e)==gnd:
  b=e['brep_shape']; p=Polygon([(v['x'],v['y']) for v in b['outer_ring']['vertices']], [[(v['x'],v['y']) for v in r['vertices']] for r in b.get('inner_rings',[])])
  p=p.difference(ns['drill_unions']['inner1']);ground.append(p)
ground=unary_union(ground);main=max(ground.geoms,key=lambda x:x.area) if hasattr(ground,'geoms') else ground
Gvias=[e for e in elements if e['type']=='pcb_via' and er(e)==gnd]
contacts=[]
for e in Gvias:
 a=Point(e['x'],e['y']).buffer(e['outer_diameter']/2,resolution=64).difference(ns['drill_unions']['inner1']).intersection(main).area
 contacts.append({'id':e['pcb_via_id'],'xy':[e['x'],e['y']],'areaMm2':a})
inner1=[];counts={};lengths={};topcrossings=[]
for e in elements:
 if e['type']!='pcb_trace':continue
 ss=[];tl={}
 for a,b in zip(e['route'],e['route'][1:]):
  if a['route_type']!='wire' or b['route_type']!='wire' or a['layer']!=b['layer']:continue
  if (a['x'],a['y'])==(b['x'],b['y']):continue
  line=LineString([(a['x'],a['y']),(b['x'],b['y'])]);layer=a['layer'];tl[layer]=tl.get(layer,0)+line.length
  if layer=='top' and er(e)!=gnd:
   # Clip terminal .4mm of the whole segment out only for a preliminary geometrical crossing screen.
   missing=line.difference(main);mg=[missing] if missing.geom_type=='LineString' else list(missing.geoms) if hasattr(missing,'geoms') else []
   for m in mg:
    if m.geom_type=='LineString' and m.length>.5:
     topcrossings.append({'id':e['pcb_trace_id'],'net':net(e),'xy':[list(m.coords[0]),list(m.coords[-1])],'unsupportedCenterlineMm':m.length})
 for layer,L in tl.items():
  counts[layer]=counts.get(layer,0)+1;lengths[layer]=lengths.get(layer,0)+L
 if 'inner1' in tl:
  src=ns['source_traces'].get(e['source_trace_id'],{});inner1.append({'id':e['pcb_trace_id'],'sourceTrace':e['source_trace_id'],'name':src.get('name',src.get('display_name')),'net':net(e),'lengthMm':tl['inner1'],'route':e['route']})
result={'inputSha256':hashlib.sha256(input.read_bytes()).hexdigest(),'method':'read-only actual BREP/shapely direct checks; no solver or graph mutation','largestGroundAreaMm2':main.area,'groundRegionCount':len(ground.geoms) if hasattr(ground,'geoms') else 1,'groundViaCount':len(Gvias),'groundViaContactMinMm2':min(x['areaMm2'] for x in contacts),'all166ContactsAbovePoint05':len(contacts)==166 and all(x['areaMm2']>=.05 for x in contacts),'traceCountsByPlanarLayer':counts,'planarLengthMmByLayer':lengths,'inner1TracesDescendingLength':sorted(inner1,key=lambda x:-x['lengthMm']),'topProjectionVoidCrossingsAbovePoint5Mm':sorted(topcrossings,key=lambda x:-x['unsupportedCenterlineMm']),'caveat':'Projection-void screen includes deliberate switch-clearances/antipads and does not establish missing return path or RF impedances; only ground-pour shape used.'}
out.write_text(json.dumps(result,indent=2)); print(json.dumps({k:v for k,v in result.items() if k not in ['inner1TracesDescendingLength','topProjectionVoidCrossingsAbovePoint5Mm']},indent=2));print('TOP INNER1',json.dumps([{k:v for k,v in x.items() if k!='route'} for x in result['inner1TracesDescendingLength'][:15]],indent=2));print('TOP VOID',json.dumps(result['topProjectionVoidCrossingsAbovePoint5Mm'][:18],indent=2))
