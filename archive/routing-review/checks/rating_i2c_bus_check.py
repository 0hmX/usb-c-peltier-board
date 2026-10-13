import json,math,hashlib,collections
from pathlib import Path
root=Path('/Users/ankan/Documents/Codex/2026-10-09/per')
p=root/'work/board-debug-revision/dist/debug-source-placement-23/circuit.json'; raw=p.read_bytes();c=json.loads(raw)
sources={t['source_trace_id']:t for t in c if t['type']=='source_trace'}
nets={t['subcircuit_connectivity_map_key']:t['name'] for t in c if t['type']=='source_net'}
netids={t['source_net_id']:t['name'] for t in c if t['type']=='source_net'}
def net(t):
 s=sources.get(t.get('source_trace_id',t.get('connection_name')),{})
 return nets.get(s.get('subcircuit_connectivity_map_key'),nets.get(t.get('subcircuit_connectivity_map_key'),netids.get(t.get('source_net_id'),'UNKNOWN')))
def pname(t):return sources.get(t.get('source_trace_id'),{}).get('name',t.get('pcb_trace_id'))
def pointseg(p,a,b):
 dx=b[0]-a[0];dy=b[1]-a[1]; z=dx*dx+dy*dy
 q=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/z)) if z else 0
 foot=(a[0]+q*dx,a[1]+q*dy)
 return math.dist(p,foot)
def cross(a,b,c):return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
def dist(a,b,c,d):
 # Include collinear overlap only if projected boxes overlap.
 if cross(a,b,c)*cross(a,b,d)<=0 and cross(c,d,a)*cross(c,d,b)<=0 and max(min(a[0],b[0]),min(c[0],d[0]))<=min(max(a[0],b[0]),max(c[0],d[0]))+1e-12 and max(min(a[1],b[1]),min(c[1],d[1]))<=min(max(a[1],b[1]),max(c[1],d[1]))+1e-12:return 0
 return min(pointseg(a,c,d),pointseg(b,c,d),pointseg(c,a,b),pointseg(d,a,b))
segments=[]; paths=[]
for t in c:
 if t['type']!='pcb_trace':continue
 ss=[]
 for a,b in zip(t['route'],t['route'][1:]):
  if a['route_type']!='wire' or b['route_type']!='wire' or a['layer']!=b['layer']:continue
  if math.dist((a['x'],a['y']),(b['x'],b['y']))<1e-10:continue
  s={'a':(a['x'],a['y']),'b':(b['x'],b['y']),'width':max(a['width'],b['width']),'layer':a['layer'],'net':net(t),'pcbTraceId':t['pcb_trace_id'],'name':pname(t)}
  segments.append(s);ss.append(s)
 if net(t) in ['I2C_SCL','I2C_SDA']:paths.append({'name':pname(t),'pcbTraceId':t['pcb_trace_id'],'net':net(t),'lengthMm':sum(math.dist(s['a'],s['b']) for s in ss),'layers':sorted({s['layer'] for s in ss}),'vertices':[{'x':a['x'],'y':a['y'],'layer':a.get('layer')} for a in t['route'] if a['route_type']=='wire']})
ib=[s for s in segments if s['net'] in ['I2C_SCL','I2C_SDA']]
near=[]; pair={};
for s in ib:
 for q in segments:
  if q['net']==s['net'] or q['layer']!=s['layer']:continue
  gap=dist(s['a'],s['b'],q['a'],q['b'])-(s['width']+q['width'])/2
  e={'edgeClearanceMm':gap,'layer':s['layer'],'i2cTrace':s['name'],'i2cPcbTraceId':s['pcbTraceId'],'otherTrace':q['name'],'otherPcbTraceId':q['pcbTraceId'],'otherNet':q['net'],'i2cSegment':[s['a'],s['b']],'otherSegment':[q['a'],q['b']]}
  near.append(e)
  if q['net'] in ['I2C_SCL','I2C_SDA'] and gap<pair.get(s['layer'],{}).get('edgeClearanceMm',float('inf')):pair[s['layer']]=e
vias=[t for t in c if t['type']=='pcb_via'];nearvia=[]
for s in ib:
 for v in vias:
  if net(v)==s['net'] or s['layer'] not in v['layers']:continue
  gap=pointseg((v['x'],v['y']),s['a'],s['b'])-v['outer_diameter']/2-s['width']/2
  nearvia.append({'edgeClearanceMm':gap,'layer':s['layer'],'i2cTrace':s['name'],'i2cSegment':[s['a'],s['b']],'viaId':v['pcb_via_id'],'viaNet':net(v),'viaCenter':[v['x'],v['y']],'diameter':v['outer_diameter']})
res={'circuitSha256':hashlib.sha256(raw).hexdigest(),'paths':paths,'pathCount':len(paths),'pathLengthMmByNet':{n:sum(t['lengthMm'] for t in paths if t['net']==n) for n in ['I2C_SCL','I2C_SDA']},'minimumSclSdaEdgeClearanceByLayer':pair,'nearestForeignTraceClearances':sorted(near,key=lambda e:e['edgeClearanceMm'])[:20],'nearestForeignViaClearances':sorted(nearvia,key=lambda e:e['edgeClearanceMm'])[:20],'i2cVias':[{k:t[k] for k in ['pcb_via_id','x','y','hole_diameter','outer_diameter','layers','source_net_id']} for t in vias if net(t) in ['I2C_SCL','I2C_SDA']]}
(root/'work/routing-rating-source23/rating_i2c_bus_measurements.json').write_text(json.dumps(res,indent=2)+'\n')
print(json.dumps({k:res[k] for k in ['pathCount','pathLengthMmByNet','minimumSclSdaEdgeClearanceByLayer','nearestForeignTraceClearances','nearestForeignViaClearances']},indent=2))
