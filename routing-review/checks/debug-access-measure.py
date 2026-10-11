import json, math, hashlib, pathlib
P=pathlib.Path('/Users/ankan/Documents/Codex/2026-10-09/per/work/board-debug-revision')
b=(P/'dist/debug-source-placement-23/circuit.json').read_bytes(); D=json.loads(b)
SC={x['source_component_id']:x for x in D if x['type']=='source_component'}
SP={x['source_port_id']:x for x in D if x['type']=='source_port'}
ST={x['source_trace_id']:x for x in D if x['type']=='source_trace'}
SN={x['source_net_id']:x for x in D if x['type']=='source_net'}
PC={x['pcb_component_id']:x for x in D if x['type']=='pcb_component'}
PP={x['pcb_port_id']:x for x in D if x['type']=='pcb_port'}
probes=[]; grounds=[]
for x in PC.values():
 s=SC.get(x.get('source_component_id'),{}); n=s.get('name','')
 if n.startswith('TP'):
  pad=next(v for v in D if v['type']=='pcb_smtpad' and v.get('pcb_component_id')==x['pcb_component_id'])
  sp=SP[PP[pad['pcb_port_id']]['source_port_id']]
  z={'name':n,'center':x['center'],'padDiameterMm':pad['radius']*2,'maskExposed':not pad.get('is_covered_with_solder_mask'),'netKey':sp['subcircuit_connectivity_map_key']}
  (grounds if n.startswith('TPG') else probes).append(z)
for p in probes:
 nearest=min(grounds,key=lambda g:math.dist(p['center'].values(),g['center'].values()))
 p['nearestGroundName']=nearest['name'];p['nearestGroundCenterDistanceMm']=math.dist(p['center'].values(),nearest['center'].values())
 allpairs=[(q, math.dist(p['center'].values(),q['center'].values())-1.5) for q in probes+grounds if q is not p]
 q,gap=min(allpairs,key=lambda x:x[1]);p['nearestOtherProbeName']=q['name'];p['nearestOtherProbeCopperEdgeGapMm']=gap
 fitted=[x for x in PC.values() if not x.get('do_not_place') and x.get('source_component_id') in SC]
 def bd(x):
  c=x['center'];return math.hypot(max(0,abs(c['x']-p['center']['x'])-x['width']/2),max(0,abs(c['y']-p['center']['y'])-x['height']/2))-.75
 x=min(fitted,key=bd);p['nearestFittedFootprintBoundingBox']={'name':SC[x['source_component_id']]['name'],'edgeDistanceMm':bd(x),'caution':'axis-aligned pcb_component envelope; not a fitted 3D body or courtyard validation'}
tr=[]
for x in D:
 if x['type']!='pcb_trace':continue
 s=ST.get(x.get('source_trace_id'),{});n=s.get('name','');
 if not (n.startswith(('D50','TP0','TP1','DBG','TPG'))):continue
 length=0;layers=set();r=x['route']
 for a,z in zip(r,r[1:]):
  if a.get('route_type')=='wire' and z.get('route_type')=='wire' and a.get('layer')==z.get('layer'):
   length+=math.hypot(z['x']-a['x'],z['y']-a['y']);layers.add(a['layer'])
 tr.append({'name':n,'pcbTraceId':x['pcb_trace_id'],'surfaceLengthMm':length,'layers':sorted(layers),'netKey':s.get('subcircuit_connectivity_map_key')})
agg={}
for pref in [f'D50{i}_SERIES' for i in range(1,6)]+[f'TP0{i}_FILTERED' for i in range(6,10)]:
 rows=[x for x in tr if x['name'].startswith(pref)];agg[pref]={'surfaceLengthMm':sum(x['surfaceLengthMm'] for x in rows),'traceCount':len(rows),'traceIds':[x['pcbTraceId'] for x in rows]}
leds=[{'name':SC[x['source_component_id']]['name'],'center':x['center']} for x in PC.values() if SC.get(x.get('source_component_id'),{}).get('name') in [f'D50{i}' for i in range(1,9)]]
O={'circuitSha256':hashlib.sha256(b).hexdigest(),'signalProbeCount':len(probes),'groundProbeCount':len(grounds),'ledCount':len(leds),'signalProbes':probes,'groundProbes':grounds,'leds':leds,'namedTraceMeasurements':tr,'routeGroups':agg}
def ds(p,a,b):
 dx=b['x']-a['x'];dy=b['y']-a['y'];t=max(0,min(1,((p['x']-a['x'])*dx+(p['y']-a['y'])*dy)/(dx*dx+dy*dy))) if dx*dx+dy*dy else 0
 return math.hypot(p['x']-a['x']-t*dx,p['y']-a['y']-t*dy)
for p in probes+grounds:
 candidates=[]
 for trc in D:
  if trc['type']!='pcb_trace':continue
  st=ST.get(trc.get('source_trace_id'),{});key=st.get('subcircuit_connectivity_map_key',trc.get('subcircuit_connectivity_map_key'))
  if key==p['netKey']:continue
  for a,b in zip(trc['route'],trc['route'][1:]):
   if a.get('route_type')=='wire' and b.get('route_type')=='wire' and a.get('layer')=='top' and b.get('layer')=='top':
    gap=ds(p['center'],a,b)-.75-max(a['width'],b['width'])/2
    candidates.append((gap,trc['pcb_trace_id'],st.get('name'),key,[a['x'],a['y']],[b['x'],b['y']]))
 p['nearestForeignTopTrace']=min(candidates)
O['testPointToForeignTopTraceCheck']={'method':'Point-to-segment distance minus TP radius and maximum adjacent route widths / 2; excludes exact connectivity-key equality. No pads, vias, pours or mask geometry in this check.','minimumEdgeGapMm':min(p['nearestForeignTopTrace'][0] for p in probes+grounds),'foreignTraceOverlapCount':sum(p['nearestForeignTopTrace'][0]<-1e-7 for p in probes+grounds)}
out=pathlib.Path('/Users/ankan/Documents/Codex/2026-10-09/per/work/routing-rating-source23/rating_debug_access_measurements.json');out.write_text(json.dumps(O,indent=2)+'\n')
print(json.dumps({'counts':[len(probes),len(grounds),len(leds)],'routeGroups':agg,'scopedTraceOverlapCheck':O['testPointToForeignTopTraceCheck']},indent=2))
