import sys,json,hashlib
from pathlib import Path
from collections import Counter,defaultdict
from shapely.strtree import STRtree
from shapely.ops import nearest_points
root=Path('/Users/ankan/Documents/Codex/2026-10-09/per/work/board-debug-revision')
out=Path('/Users/ankan/Documents/Codex/2026-10-09/per/work/routing-rating-source23')
sys.argv=['audit','--input',str(root/'dist/debug-source-placement-23/circuit.json'),'--output',str(out/'rating_pad_clearances-continuity.json')]
code=(root/'scripts/audit-net-continuity.py').read_text().replace('sys.exit(1 if failures or report[\'unassignedPrimitives\'] else 0)','')
ns={};exec(compile(code,str(root/'scripts/audit-net-continuity.py'),'exec'),ns)
nodes=ns['nodes']; labels=ns['net_labels'];pads=[n for n in nodes if n['kind']=='pad'];traces=[n for n in nodes if n['kind']=='trace']
def lab(n):return ' / '.join(sorted(labels[n['net']])) or n['net']
near=[];overlaps=[];padpairs=[]
for layer in ns['layers']:
 ps=[n for n in pads if n['layer']==layer]; tree=STRtree([n['geometry'] for n in ps])
 for n in [t for t in traces if t['layer']==layer]:
  for j in tree.query(n['geometry'].buffer(.3)):
   p=ps[int(j)]
   if n['net']==p['net']:continue
   g=n['geometry'].distance(p['geometry']);c=n['geometry'].intersection(p['geometry']);a,b=nearest_points(n['geometry'],p['geometry'])
   rec={'trace':n['id'],'pad':p['id'],'pin':p['name'],'traceNet':lab(n),'padNet':lab(p),'layer':layer,'gapMm':g,'overlapAreaMm2':c.area,'nearestPoints':[[a.x,a.y],[b.x,b.y]]}
   near.append(rec)
   if c.area>1e-12:overlaps.append(rec)
 for i,p in enumerate(ps):
  for j in tree.query(p['geometry'].buffer(.3)):
   j=int(j)
   if j<=i or ps[j]['net']==p['net']:continue
   q=ps[j];g=p['geometry'].distance(q['geometry']);a,b=nearest_points(p['geometry'],q['geometry'])
   padpairs.append({'pinA':p['name'],'pinB':q['name'],'netA':lab(p),'netB':lab(q),'layer':layer,'gapMm':g,'coordinates':[[a.x,a.y],[b.x,b.y]]})
near.sort(key=lambda n:n['gapMm']);padpairs.sort(key=lambda n:n['gapMm'])
nearunique=[];seen=set()
for n in near:
 k=(n['trace'],n['pad'],n['layer'])
 if k in seen:continue
 nearunique.append(n);seen.add(k)
via_near=[];via_overlap=[]
for layer in ns['layers']:
 ps=[n for n in pads if n['layer']==layer];tree=STRtree([n['geometry'] for n in ps])
 for n in [v for v in nodes if v['kind']=='via' and v['layer']==layer]:
  for j in tree.query(n['geometry'].buffer(.3)):
   p=ps[int(j)]
   if n['net']==p['net']:continue
   g=n['geometry'].distance(p['geometry']);c=n['geometry'].intersection(p['geometry']);a,b=nearest_points(n['geometry'],p['geometry'])
   rec={'via':n['id'],'pin':p['name'],'viaNet':lab(n),'padNet':lab(p),'layer':layer,'gapMm':g,'overlapAreaMm2':c.area,'nearestPoints':[[a.x,a.y],[b.x,b.y]]};via_near.append(rec)
   if c.area>1e-12:via_overlap.append(rec)
via_near.sort(key=lambda n:n['gapMm'])
source_sha=hashlib.sha256((root/'dist/debug-source-placement-23/circuit.json').read_bytes()).hexdigest()
keys=defaultdict(set)
for p in ns['by_type']['source_net']+ns['by_type']['source_port']:
 sid=p.get('source_net_id',p.get('source_port_id'));k=p.get('subcircuit_connectivity_map_key')
 if k:keys[k].add(ns['logical'].find(sid))
bycomp=defaultdict(list)
for p in pads:
 if p['layer']=='top':bycomp[p['name'].split('.')[0]].append(p)
compcounts=Counter({k:len(v) for k,v in bycomp.items()})
detail={'circuitSha256':source_sha,'tracePrimitiveCount':len(traces),'padPrimitiveCount':len(pads),'unassignedElectricalPrimitives':ns['report']['unassignedPrimitives'],'ambiguousConnectivityKeys':[{'key':k,'rootCount':len(v)} for k,v in keys.items() if len(v)>1],'foreignViaPadOverlaps':via_overlap,'foreignViaPadNearest':via_near[:35],'foreignTracePadOverlaps':overlaps,'foreignTracePadGapBelow0p1':[n for n in nearunique if n['gapMm']<.1-1e-7],'foreignTracePadNearest':nearunique[:60],'foreignPadPadNearest':padpairs[:35],'topComponentsPadCounts':dict(compcounts.most_common(20))}
(out/'rating_pad_clearances-measured.json').write_text(json.dumps(detail,indent=2)+'\n')
print(json.dumps({k:detail[k] for k in ['circuitSha256','tracePrimitiveCount','padPrimitiveCount','unassignedElectricalPrimitives','ambiguousConnectivityKeys','foreignTracePadOverlaps','foreignTracePadGapBelow0p1','topComponentsPadCounts']},indent=2))
print('NEAREST VIA TO FOREIGN PAD',json.dumps(via_near[:15],indent=2));print('NEAREST TRACE TO FOREIGN PAD',json.dumps(nearunique[:15],indent=2));print('NEAREST FOREIGN PAD PAIRS',json.dumps(padpairs[:15],indent=2))
