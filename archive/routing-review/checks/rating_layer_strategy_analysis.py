import json,math,collections,hashlib
from pathlib import Path
root=Path('/Users/ankan/Documents/Codex/2026-10-09/per'); p=root/'work/board-debug-revision/dist/debug-source-placement-23/circuit.json'; a=json.load(open(p))
net={x['source_net_id']:x['name'] for x in a if x.get('type')=='source_net'}; st={x['source_trace_id']:x for x in a if x.get('type')=='source_trace'}
plane=next(x for x in a if x.get('type')=='pcb_copper_pour' and x['layer']=='inner1'); outer=plane['brep_shape']['outer_ring']['vertices']; holes=[x['vertices'] for x in plane['brep_shape']['inner_rings']]
def area(v):return abs(sum(p['x']*q['y']-q['x']*p['y'] for p,q in zip(v,v[1:]+v[:1])))/2
def bounds(v):return(min(p['x'] for p in v),min(p['y'] for p in v),max(p['x'] for p in v),max(p['y'] for p in v))
def inside(x,y,v):
 c=False
 for p,q in zip(v,v[1:]+v[:1]):
  if ((p['y']>y)!=(q['y']>y)) and x<(q['x']-p['x'])*(y-p['y'])/(q['y']-p['y'])+p['x']:c=not c
 return c
hb=[(v,bounds(v)) for v in holes]
def cross(a,b):return a[0]*b[1]-a[1]*b[0]
def outside_intervals(p,q):
 dx=q['x']-p['x'];dy=q['y']-p['y'];cuts=[0,1]
 relevant=[]
 for v,b in hb:
  if max(p['x'],q['x'])<b[0] or min(p['x'],q['x'])>b[2] or max(p['y'],q['y'])<b[1] or min(p['y'],q['y'])>b[3]:continue
  relevant.append(v)
  for s,t in zip(v,v[1:]+v[:1]):
   ex=t['x']-s['x'];ey=t['y']-s['y'];den=cross((dx,dy),(ex,ey))
   if abs(den)<1e-12:continue
   h=(s['x']-p['x'],s['y']-p['y']);u=cross(h,(ex,ey))/den;w=cross(h,(dx,dy))/den
   if 0<u<1 and 0<=w<=1:cuts.append(u)
 cuts=sorted(set(cuts));z=[]
 for u,v in zip(cuts,cuts[1:]):
  mid=(u+v)/2;x=p['x']+mid*dx;y=p['y']+mid*dy
  if any(inside(x,y,r) for r in relevant):z.append((u,v))
 return z
length=collections.Counter();segs=collections.Counter(); bynet=collections.Counter();voids=[];inner=[]
for t in a:
 if t.get('type')!='pcb_trace':continue
 s=st.get(t.get('source_trace_id'),{});n='|'.join(net.get(v,v) for v in s.get('connected_source_net_ids',[])) or s.get('name',t.get('connection_name','?'))
 for p,q in zip(t['route'],t['route'][1:]):
  if p.get('route_type')!='wire' or q.get('route_type')!='wire' or p.get('layer')!=q.get('layer'):continue
  l=math.hypot(p['x']-q['x'],p['y']-q['y']);layer=p['layer']
  if l==0:continue
  length[layer]+=l;segs[layer]+=1;bynet[(layer,n)]+=l
  if layer=='inner1':inner.append({'traceId':t['pcb_trace_id'],'net':n,'start':[p['x'],p['y']],'end':[q['x'],q['y']],'lengthMm':l})
  if layer in ['top','inner2'] and n!='GND':
   for u,v in outside_intervals(p,q):
    run=(v-u)*l
    if run>.7:voids.append({'traceId':t['pcb_trace_id'],'net':n,'layer':layer,'start':[p['x']+u*(q['x']-p['x']),p['y']+u*(q['y']-p['y'])],'end':[p['x']+v*(q['x']-p['x']),p['y']+v*(q['y']-p['y'])],'lengthWithoutDirectInner1GroundMm':run})
x={'circuitSha256':hashlib.sha256(open(root/'work/board-debug-revision/dist/debug-source-placement-23/circuit.json','rb').read()).hexdigest(),'layerLengthsMm':dict(length),'nonzeroPlanarSegmentCounts':dict(segs),'totalLengthMm':sum(length.values()),'inner1GroundOuterEnvelopeAreaMm2':area(outer),'inner1GroundCopperAreaMm2':area(outer)-sum(map(area,holes)),'inner1GroundVoidCount':len(holes),'inner1SignalLengthMm':length['inner1'],'inner1SignalByNetMm':{n:l for (ly,n),l in bynet.items() if ly=='inner1'},'inner1Segments':inner,'topOrInner2NonGroundCenterlineVoidRunsLongerThanPoint7Mm':sorted(voids,key=lambda x:x['lengthWithoutDirectInner1GroundMm'],reverse=True),'viaCount':sum(x.get('type')=='pcb_via' for x in a),'planeLargestVoids':sorted([{'areaMm2':area(v),'bounds':b} for v,b in hb],key=lambda x:x['areaMm2'],reverse=True)[:10]}
out=root/'work/routing-rating-source23/rating_layer_strategy_metrics.json';out.write_text(json.dumps(x,indent=2));print(json.dumps({k:v for k,v in x.items() if k not in ['inner1Segments','topOrInner2NonGroundCenterlineVoidRunsLongerThanPoint7Mm']},indent=2));print('Longest ground reference interruptions',json.dumps(x['topOrInner2NonGroundCenterlineVoidRunsLongerThanPoint7Mm'][:15],indent=2))
