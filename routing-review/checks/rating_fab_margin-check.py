import sys,json,hashlib,math,collections
from pathlib import Path
sys.path.insert(0,str(Path('/Users/ankan/Documents/Codex/2026-10-09/per/work/board-debug-revision/reviews/debug-mask-export')))
import importlib.util
spec=importlib.util.spec_from_file_location('fab_margin_geometry','/Users/ankan/Documents/Codex/2026-10-09/per/work/board-debug-revision/reviews/debug-mask-export/review-geometry.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);primitive=mod.primitive;graph=mod.graph
from shapely.geometry import Point,LineString,Polygon,box
from shapely.affinity import rotate
root=Path('/Users/ankan/Documents/Codex/2026-10-09/per/work/board-debug-revision')
p=root/'dist/debug-source-placement-23/circuit.json'; D=json.loads(p.read_text()); G=graph(D)
vs=[e for e in D if e['type']=='pcb_via']; ps=[e for e in D if e['type']=='pcb_smtpad']; ts=[e for e in D if e['type']=='pcb_trace']; hs=[e for e in D if e['type']=='pcb_hole']; phs=[e for e in D if e['type']=='pcb_plated_hole']; pours=[e for e in D if e['type']=='pcb_copper_pour']; board=next(e for e in D if e['type']=='pcb_board'); boundary=box(-50,-37.5,50,37.5).boundary
results={'circuitSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'viaClassCounts':[{'hole':k[0],'pad':k[1],'count':n,'radialAnnulus':(k[1]-k[0])/2} for k,n in collections.Counter((v['hole_diameter'],v['outer_diameter']) for v in vs).items()],'allViasFourLayer':all(set(v['layers'])=={'top','inner1','inner2','bottom'} for v in vs)}
def witness(e,gap,extra=None):
 return {'id':next(v for k,v in e.items() if k==e['type']+'_id'),'gapMm':gap,'x':e.get('x'),'y':e.get('y'),'sourceOwner':G['owner'](e),**(extra or {})}
# Rectangular board edge distances for each entire pad and via. Circle radius is subtracted exactly.
pad_edges=[]
for e in ps+phs:
 core,r=primitive(e); pad_edges.append(witness(e,core.distance(boundary)-r))
via_edges=[witness(v,min(50-abs(v['x']),37.5-abs(v['y']))-v['outer_diameter']/2) for v in vs]
results['minPadEdges']=sorted(pad_edges,key=lambda a:a['gapMm'])[:5]; results['minViaEdges']=sorted(via_edges,key=lambda a:a['gapMm'])[:3];results['padViaBoardEdgeFailures']=[x for x in pad_edges+via_edges if x['gapMm']<.5-1e-7]
# All-net drill separation, not waived for common copper nets.
vv=[]
for i,v in enumerate(vs):
 for w in vs[i+1:]:
  vv.append({'a':v['pcb_via_id'],'b':w['pcb_via_id'],'gapMm':math.hypot(v['x']-w['x'],v['y']-w['y'])-(v['hole_diameter']+w['hole_diameter'])/2,'xyA':[v['x'],v['y']],'xyB':[w['x'],w['y']]})
results['viaDrillPairCount']=len(vv);results['minViaDrillPairs']=sorted(vv,key=lambda a:a['gapMm'])[:5];results['viaDrillFailures']=[q for q in vv if q['gapMm']<.3-1e-7]
# Correct PTH circular/slotted bores retain world rotation.
pthdrills=[]
for h in phs:
 hh=dict(h)
 if h['shape']=='circle':hh['radius']=h.get('hole_diameter',h.get('hole_width',0))/2
 else:hh['outer_width']=h['hole_width'];hh['outer_height']=h['hole_height'];hh.pop('width',None);hh.pop('height',None)
 core,r=primitive(hh);pthdrills.append((h,core,r))
vp=[]
for v in vs:
 for h,c,r in pthdrills:
  vp.append({'via':v['pcb_via_id'],'pth':h['pcb_plated_hole_id'],'gapMm':Point(v['x'],v['y']).distance(c)-v['hole_diameter']/2-r,'xyVia':[v['x'],v['y']],'xyPth':[h['x'],h['y']]})
results['viaPthDrillPairCount']=len(vp);results['minViaPthDrillPairs']=sorted(vp,key=lambda a:a['gapMm'])[:5];results['viaPthDrillFailures']=[q for q in vp if q['gapMm']<.15-1e-7]
# Trace-to-NPTH including the 2 USB locator holes, at the actual trace width.
traceholes=[];traceedges=[];segments=0
for t in ts:
 route=t['route']
 for a,b in zip(route,route[1:]):
  if a['route_type']!='wire' or b['route_type']!='wire' or a['layer']!=b['layer'] or (a['x'],a['y'])==(b['x'],b['y']):continue
  c=LineString([(a['x'],a['y']),(b['x'],b['y'])]);r=max(a['width'],b['width'])/2; segments+=1
  traceedges.append({'id':t['pcb_trace_id'],'gapMm':c.distance(boundary)-r,'layer':a['layer'],'a':[a['x'],a['y']],'b':[b['x'],b['y']]})
  for h in hs:traceholes.append({'trace':t['pcb_trace_id'],'hole':h['pcb_hole_id'],'gapMm':c.distance(Point(h['x'],h['y']))-r-h['hole_diameter']/2,'layer':a['layer'],'a':[a['x'],a['y']],'b':[b['x'],b['y']],'holeXY':[h['x'],h['y']]})
results['traceSegmentCount']=segments;results['minTraceEdges']=sorted(traceedges,key=lambda a:a['gapMm'])[:5];results['traceBoardEdgeFailures']=[q for q in traceedges if q['gapMm']<.5-1e-7];results['minTraceNpthGaps']=sorted(traceholes,key=lambda a:a['gapMm'])[:5];results['traceNpthFailures']=[q for q in traceholes if q['gapMm']<.5-1e-7]
# Nominal requested-mask openings against drill bores: source geometry only, no registration/export assumption.
mask=[]
for v in vs:
 pnt=Point(v['x'],v['y'])
 for pad in ps:
  if pad.get('is_covered_with_solder_mask') is True:continue
  core,r=primitive(pad,mask=True);gap=pnt.distance(core)-r-v['hole_diameter']/2
  mask.append({'via':v['pcb_via_id'],'pad':pad['pcb_smtpad_id'],'gapMm':gap,'viaXY':[v['x'],v['y']],'padXY':[pad.get('x',core.centroid.x),pad.get('y',core.centroid.y)],'viaOwner':G['owner'](v),'padOwner':G['owner'](pad),'sameNet':G['element_root'](v)==G['element_root'](pad)})
results['viaBoreRequestedMaskMinima']=sorted(mask,key=lambda a:a['gapMm'])[:8];results['viaBoreMaskBelow025Count']=sum(m['gapMm']<.025-1e-7 for m in mask)
results['smallVias']=[{'record':v,'owner':G['owner'](v),'maskMinima':sorted([m for m in mask if m['via']==v['pcb_via_id']],key=lambda a:a['gapMm'])[:3]} for v in vs if v['hole_diameter']==.2]
out=Path('/Users/ankan/Documents/Codex/2026-10-09/per/work/routing-rating-source23/rating_fab_margin-direct-checks.json');out.write_text(json.dumps(results,indent=2)+'\n');print(json.dumps(results,indent=2))
