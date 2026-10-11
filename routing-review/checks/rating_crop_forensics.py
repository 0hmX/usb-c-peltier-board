import json,hashlib,math
from pathlib import Path
from shapely.geometry import LineString,Point,box
from shapely.ops import nearest_points
root=Path('/Users/ankan/Documents/Codex/2026-10-09/per')
p=root/'work/board-debug-revision/dist/debug-source-placement-23/circuit.json'
j=json.loads(p.read_text());by={x.get(x['type']+'_id'):x for x in j}; region=box(-36,10,-18,30)
net_by_key={x.get('subcircuit_connectivity_map_key'):x['source_net_id'] for x in j if x['type']=='source_net'}
items=[]
for t in j:
 if t['type']=='pcb_trace':
  st=by[t['source_trace_id']]; ns=st.get('connected_source_net_ids',[]);net=ns[0] if len(ns)==1 else st.get('subcircuit_connectivity_map_key');r=t['route']
  for i,(a,b)in enumerate(zip(r,r[1:])):
   if a.get('route_type')!='wire' or b.get('route_type')!='wire' or a.get('layer')!='inner2' or b.get('layer')!='inner2' or (a['x'],a['y'])==(b['x'],b['y']):continue
   g=LineString([(a['x'],a['y']),(b['x'],b['y'])]);w=max(a['width'],b['width'])
   if g.distance(region)>w/2:continue
   items.append(dict(id=t['pcb_trace_id'],segment=i,name=st.get('name'),net=net,geom=g,radius=w/2))
 elif t['type']=='pcb_via' and 'inner2' in t['layers']:
  g=Point(t['x'],t['y']);rad=t['outer_diameter']/2
  if g.distance(region)>rad:continue
  net=t.get('source_net_id')or net_by_key.get(t.get('subcircuit_connectivity_map_key'),t.get('subcircuit_connectivity_map_key'));items.append(dict(id=t['pcb_via_id'],name=t['pcb_via_id'],net=net,geom=g,radius=rad))
pairs=[]
for i,a in enumerate(items):
 for b in items[i+1:]:
  if a['net']==b['net']:continue
  d=a['geom'].distance(b['geom'])-a['radius']-b['radius']
  pa,pb=nearest_points(a['geom'],b['geom'])
  pairs.append(dict(a={k:a[k] for k in ['id','name','net']},b={k:b[k]for k in ['id','name','net']},copperEdgeGapMm=d,nearestCenters=[list(pa.coords)[0],list(pb.coords)[0]]))
pairs.sort(key=lambda x:x['copperEdgeGapMm']); short=[x for x in pairs if x['copperEdgeGapMm']<0];clear=[x for x in pairs if x['copperEdgeGapMm']<.2-1e-9]
summary={'circuitSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'region':[-36,10,-18,30],'inner2CopperPours':sum(1 for x in j if x['type']=='pcb_copper_pour'and x['layer']=='inner2'),'localPrimitiveCount':len(items),'localForeignPairCount':len(pairs),'foreignOverlaps':short,'foreignGapsBelowPoint2Mm':clear,'closest10Pairs':pairs[:10]}
(root/'work/routing-rating-source23/rating_crop_forensics-measurements.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary,indent=2))
