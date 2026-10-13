import json,hashlib,math,collections
from pathlib import Path
root=Path('/Users/ankan/Documents/Codex/2026-10-09/per')
p=root/'work/board-debug-revision/dist/debug-source-placement-23/circuit.json'
a=json.loads(p.read_bytes())
by=collections.defaultdict(list)
for x in a: by[x['type']].append(x)
par={}
def find(k):
    par.setdefault(k,k)
    if par[k]!=k: par[k]=find(par[k])
    return par[k]
def union(x,y):par[find(y)]=find(x)
st={x['source_trace_id']:x for x in by['source_trace']}
for x in st.values():
    ids=x.get('connected_source_port_ids',[])+x.get('connected_source_net_ids',[])
    for k in ids[1:]:union(ids[0],k)
labels=collections.defaultdict(list)
for x in by['source_net']:labels[find(x['source_net_id'])].append(x['name'])
ports={x['source_port_id']:x for x in by['source_port']}; comps={x['source_component_id']:x['name'] for x in by['source_component']}
def label(n):
    if labels[n]:return ' / '.join(labels[n])
    for k,v in ports.items():
        if find(k)==n:return comps.get(v.get('source_component_id'),'?')+'.'+v.get('name','?')
    return n
segs=[];unknown=[]; layerjumps=[]
for t in by['pcb_trace']:
    x=st.get(t.get('source_trace_id'),{})
    ids=x.get('connected_source_port_ids',[])+x.get('connected_source_net_ids',[])
    if not ids:unknown.append(t['pcb_trace_id']);continue
    net=find(ids[0])
    for i,(a,b) in enumerate(zip(t['route'],t['route'][1:])):
        aw=a.get('route_type')=='wire';bw=b.get('route_type')=='wire'
        if aw and bw and a['layer']!=b['layer']:layerjumps.append([t['pcb_trace_id'],i]);continue
        if not aw and not bw:
            if a.get('to_layer')!=b.get('from_layer'):continue
            layer=a.get('to_layer')
        else:layer=a['layer'] if aw else b['layer']
        wa=a.get('width',b.get('width',.2));wb=b.get('width',a.get('width',.2))
        pa=(a['x'],a['y']);pb=(b['x'],b['y']);radius=max(wa,wb)/2
        segs.append({'trace':t['pcb_trace_id'],'index':i,'layer':layer,'net':net,'label':label(net),'a':pa,'b':pb,'r':radius,'rmin':min(wa,wb)/2,'bbox':(min(pa[0],pb[0])-radius,min(pa[1],pb[1])-radius,max(pa[0],pb[0])+radius,max(pa[1],pb[1])+radius)})
def cross(a,b,c):return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
def ptseg(p,a,b):
    dx=b[0]-a[0];dy=b[1]-a[1];l=dx*dx+dy*dy
    t=0 if l==0 else max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l))
    q=(a[0]+t*dx,a[1]+t*dy)
    return math.dist(p,q),p,q
def dist(a,b,c,d):
    o1=cross(a,b,c);o2=cross(a,b,d);o3=cross(c,d,a);o4=cross(c,d,b)
    if o1*o2<0 and o3*o4<0:
        dx=b[0]-a[0];dy=b[1]-a[1];ex=d[0]-c[0];ey=d[1]-c[1];den=dx*ey-dy*ex
        t=((c[0]-a[0])*ey-(c[1]-a[1])*ex)/den
        q=(a[0]+t*dx,a[1]+t*dy)
        return 0,q,q
    return min([ptseg(a,c,d),ptseg(b,c,d),ptseg(c,a,b),ptseg(d,a,b)],key=lambda x:x[0])
near=[]; pairs=0;foreign=0;closebox=0
for i,s in enumerate(segs):
    for t in segs[i+1:]:
        if s['layer']!=t['layer']:continue
        pairs+=1
        if s['net']==t['net']:continue
        foreign+=1
        bs=s['bbox'];bt=t['bbox']; search=.25
        if bs[0]>bt[2]+search or bt[0]>bs[2]+search or bs[1]>bt[3]+search or bt[1]>bs[3]+search:continue
        closebox+=1
        d,p1,p2=dist(s['a'],s['b'],t['a'],t['b']); gap=d-s['r']-t['r'];gapmin=d-s['rmin']-t['rmin']
        if gap<=.25:
            near.append({'gapMmConservativeMaxWidth':gap,'gapMmMinAdjacentWidth':gapmin,'layer':s['layer'],'traces':[s['trace'],t['trace']],'segmentIndices':[s['index'],t['index']],'nets':[s['label'],t['label']],'endpoints':[s['a'],s['b'],t['a'],t['b']],'closestPoints':[p1,p2],'halfWidthsMm':[s['r'],t['r']]})
near.sort(key=lambda x:x['gapMmConservativeMaxWidth'])
result={'circuitSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'traces':len(by['pcb_trace']),'nativeSegmentPrimitives':len(segs),'sameLayerSegmentPairs':pairs,'foreignNetSameLayerSegmentPairs':foreign,'boundingBoxCandidates':closebox,'unassignedTraces':unknown,'unplatedWireLayerJumps':layerjumps,'traceCopperOverlaps':[x for x in near if x['gapMmConservativeMaxWidth']<-1e-8],'traceCopperTangencies':[x for x in near if abs(x['gapMmConservativeMaxWidth'])<=1e-8],'below0point2mm':[x for x in near if x['gapMmConservativeMaxWidth']<.2-1e-8],'nearest50ForeignNetSegmentPairs':near[:50]}
out=root/'work/routing-rating-source23/rating_trace_shorts_measurements.json';out.write_text(json.dumps(result,indent=2))
print(json.dumps({k:v for k,v in result.items() if k not in ['nearest50ForeignNetSegmentPairs','traceCopperOverlaps','traceCopperTangencies','below0point2mm']},indent=2))
print('overlaps',len(result['traceCopperOverlaps']),'tangencies',len(result['traceCopperTangencies']),'under .2',len(result['below0point2mm']))
print('minimum',json.dumps(near[:4],indent=2))
