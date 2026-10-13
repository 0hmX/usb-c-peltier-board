import json,html
from pathlib import Path
root=Path('/Users/ankan/Documents/Codex/2026-10-09/per');j=json.loads((root/'work/board-debug-revision/dist/debug-source-placement-23/circuit.json').read_text());out=root/'work/routing-rating-source23'
scale=37;xmin,xmax,ymin,ymax=-33,-18,11,30;left,top=30,55;W=615;H=805
px=lambda x:left+(x-xmin)*scale
py=lambda y:top+(ymax-y)*scale
svg=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}"><rect width="100%" height="100%" fill="#07141d"/><defs><clipPath id="board"><rect x="{left}" y="{top}" width="{(xmax-xmin)*scale}" height="{(ymax-ymin)*scale}"/></clipPath></defs><text x="30" y="30" font-family="Arial,sans-serif" font-size="19" fill="#dce7ea">V3V3 · inner 2 copper</text><g clip-path="url(#board)">']
for t in j:
 if t['type']!='pcb_trace':continue
 highlight=t['pcb_trace_id'] in ['pcb_trace_193','pcb_trace_246'];color='#64f4b8' if highlight else '#ac8dd7'
 for a,b in zip(t['route'],t['route'][1:]):
  if a.get('route_type')!='wire' or b.get('route_type')!='wire' or a.get('layer')!='inner2' or b.get('layer')!='inner2':continue
  svg.append(f'<path d="M{px(a["x"]):.4f},{py(a["y"]):.4f} L{px(b["x"]):.4f},{py(b["y"]):.4f}" fill="none" stroke="{color}" stroke-width="{a["width"]*scale:.4f}" stroke-linecap="round"/>')
for v in j:
 if v['type']!='pcb_via' or 'inner2' not in v['layers']:continue
 if not xmin-.35<=v['x']<=xmax+.35 or not ymin-.35<=v['y']<=ymax+.35:continue
 color='#64f4b8' if v['pcb_via_id'] in ['pcb_via_83','pcb_via_84','pcb_via_87','pcb_via_88'] else '#e5a24d'
 svg.append(f'<circle cx="{px(v["x"]):.4f}" cy="{py(v["y"]):.4f}" r="{v["outer_diameter"]*scale/2:.4f}" fill="{color}"/><circle cx="{px(v["x"]):.4f}" cy="{py(v["y"]):.4f}" r="{v["hole_diameter"]*scale/2:.4f}" fill="#07141d"/>')
svg.append('</g>')
x,y=-25.638,26.637;cx,cy=px(x),py(y)
svg.append(f'<circle cx="{cx:.4f}" cy="{cy:.4f}" r="18" fill="none" stroke="#f0f5ed" stroke-width="1.6"/><path d="M{cx+18:.4f},{cy:.4f} L{cx+45:.4f},{cy:.4f}" stroke="#f0f5ed" stroke-width="1.3"/><text x="{cx+51:.4f}" y="{cy+5:.4f}" font-family="Arial,sans-serif" font-size="16" fill="#f0f5ed">same net</text>')
svg.append('<text x="30" y="785" font-family="Arial,sans-serif" font-size="13" fill="#aab9c2">Actual circuit.json geometry · 3ac5f3126c93 · mm dimensions</text></svg>')
(out/'rating_crop_forensics-annotated.svg').write_text(''.join(svg))
