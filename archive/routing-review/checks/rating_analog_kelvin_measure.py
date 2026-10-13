import json,math,hashlib
from pathlib import Path
base=Path('/Users/ankan/Documents/Codex/2026-10-09/per/work/board-debug-revision')
p=base/'dist/debug-source-placement-23/circuit.json';d=json.loads(p.read_text());sha=hashlib.sha256(p.read_bytes()).hexdigest();assert sha=='3ac5f3126c9385045571f0d20c2117097c6722c8f6dad9644323e49eea25f872'
st={x['source_trace_id']:x for x in d if x['type']=='source_trace'}; nk={x.get('subcircuit_connectivity_map_key'):x['name'] for x in d if x['type']=='source_net'};ni={x['source_net_id']:x['name'] for x in d if x['type']=='source_net'}
sc={x['source_component_id']:x['name'] for x in d if x['type']=='source_component'};sp={x['source_port_id']:x for x in d if x['type']=='source_port'};pp={x['pcb_port_id']:x for x in d if x['type']=='pcb_port'}
def net(x):
 s=st.get(x.get('source_trace_id'),x);return nk.get(s.get('subcircuit_connectivity_map_key'),ni.get(s.get('source_net_id'),'?'))
def distpoint(a,b,p):
 vx,vy=b[0]-a[0],b[1]-a[1];k=max(0,min(1,((p[0]-a[0])*vx+(p[1]-a[1])*vy)/(vx*vx+vy*vy))) if vx*vx+vy*vy else 0
 return math.hypot(p[0]-a[0]-k*vx,p[1]-a[1]-k*vy)
def cross(a,b,c):return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
def ds(a,b,c,e):
 if cross(a,b,c)*cross(a,b,e)<0 and cross(c,e,a)*cross(c,e,b)<0:return 0
 return min(distpoint(a,b,c),distpoint(a,b,e),distpoint(c,e,a),distpoint(c,e,b))
def point(p):return (p['x'],p['y'])
def segments(x):
 for a,b in zip(x['route'],x['route'][1:]):
  if a.get('route_type')=='wire' and b.get('route_type')=='wire' and a['layer']==b['layer'] and math.dist(point(a),point(b))>1e-10:yield point(a),point(b),a['layer'],max(a['width'],b['width'])/2
selected=['TEC_VC_U2_ESCAPE','TEC_VC_LOCAL','TEC_VC_R27_ESCAPE','TEC_COMP_RC_LOCAL','TEC_MON_KELVIN_P','TEC_MON_KELVIN_N','TEC_SENSE_KELVIN_P','TEC_SENSE_KELVIN_N','TEC_FILTERED_SENSE_P_U2','TEC_FILTERED_SENSE_P_FILTER','TEC_FILTERED_SENSE_N_U2','TEC_FILTERED_SENSE_N_FILTER','TEC_FEEDBACK_PICKUP','TEC_FB_U2_ESCAPE','TEC_FB_LOCAL','TEC_FB_R29_ESCAPE','TEC_FB_DIVIDER_LOCAL','TEC_DAC_SOURCE_HEAD_TOP','TEC_DAC_R33_CROSSING_INNER2','TEC_DAC_R33_TARGET_TOP','VBUS_ADC_MCU_LOCAL_ESCAPE','VBUS_ADC_MCU_FILTER_TRUNK','VOUT_ADC_MCU_LOCAL_ESCAPE','VOUT_ADC_MCU_FILTER_TRUNK','HOT_ADC_MCU_FILTER_TRUNK','COLD_ADC_MCU_FILTER_TRUNK','FAN_FB_HEAD','FAN_FB_TRUNK','FAN_FB_TAIL','FAN_FB_DIVIDER','FAN_FB_COMPENSATION','PROTECTED_ADC_GROUND','ADC_PAIR_GROUND']
traces={st[x['source_trace_id']].get('name'):x for x in d if x['type']=='pcb_trace'}
stats=[]
for name in selected:
 x=traces[name];segs=list(segments(x));rr=x['route'];length=sum(math.dist(a,b) for a,b,_,_ in segs);direct=math.dist(point(rr[0]),point(rr[-1]));stats.append({'name':name,'pcbTraceId':x['pcb_trace_id'],'net':net(x),'planarLengthMm':length,'endpointDistanceMm':direct,'detourRatio':length/direct if direct else None,'layers':sorted({l for a,b,l,r in segs}),'inlineViaCount':sum(p.get('route_type')=='via' for p in rr),'widthsMm':sorted({2*r for a,b,l,r in segs}),'start':point(rr[0]),'end':point(rr[-1])})
# Independently test selected analogue segments against foreign non-ground trace capsules.
allseg=[(x,a,b,l,r) for x in d if x['type']=='pcb_trace' for a,b,l,r in segments(x)]
viol=[];mins=[]
for name in selected:
 x=traces[name];nn=net(x)
 best=(1e9,None)
 for a,b,l,r in segments(x):
  for other,c,e,ol,orr in allseg:
   if l!=ol or net(other) in [nn,'GND']:continue
   clearance=ds(a,b,c,e)-r-orr
   if clearance<best[0]:best=(clearance,{'otherTraceId':other['pcb_trace_id'],'otherTraceName':st[other['source_trace_id']].get('name'),'otherNet':net(other),'layer':l,'analogueSegment':[a,b],'otherSegment':[c,e]})
 if best[0]<1e9:mins.append({'name':name,'minimumForeignNonGroundTraceEdgeGapMm':best[0],**best[1]})
 if best[0]<-1e-7:viol.append(mins[-1])
result={'circuitSha256':sha,'method':'Exact exported wire endpoints; Euclidean planar lengths; route wire-to-wire adjacent equal-layer segments only; via counts exclude external via components; foreign trace capsule edge distance by independent segment distance. This check excludes pads, pours, via annuli and ground traces.','traceStats':stats,'foreignNonGroundTraceGapResults':mins,'foreignTraceOverlaps':viol,'globalMinimumGapMm':min(q['minimumForeignNonGroundTraceEdgeGapMm'] for q in mins)}
out=Path('/Users/ankan/Documents/Codex/2026-10-09/per/work/routing-rating-source23/rating_analog_kelvin_measurements.json');out.write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'selectedTraceCount':len(stats),'foreignTraceOverlapCount':len(viol),'minimumNonGroundTraceGap':result['globalMinimumGapMm'],'tightest':sorted(mins,key=lambda q:q['minimumForeignNonGroundTraceEdgeGapMm'])[:4],'measurementFile':str(out)},indent=2))
