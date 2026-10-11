import collections
import hashlib
import json
from pathlib import Path

ROOT = Path('/Users/ankan/Documents/Codex/2026-10-09/per')
PATH = ROOT / 'work/board-debug-revision/dist/debug-source-placement-23/circuit.json'
OUT = ROOT / 'work/routing-rating-source23/rating_net_isolation_direct_checks.json'
raw = PATH.read_bytes()
data = json.loads(raw)
types = collections.defaultdict(list)
for item in data:
    types[item['type']].append(item)
parent = {}

def root(item):
    parent.setdefault(item, item)
    if parent[item] != item:
        parent[item] = root(parent[item])
    return parent[item]

def union(a, b):
    parent[root(a)] = root(b)

traces = {x['source_trace_id']: x for x in types['source_trace']}
ports = {x['source_port_id']: x for x in types['source_port']}
pcb_ports = {x['pcb_port_id']: x for x in types['pcb_port']}
pcb_traces = {x['pcb_trace_id']: x for x in types['pcb_trace']}
for trace in traces.values():
    ids = trace.get('connected_source_port_ids', []) + trace.get('connected_source_net_ids', [])
    for item in ids[1:]:
        union(ids[0], item)

labels, keys = collections.defaultdict(set), collections.defaultdict(set)
for item in types['source_net'] + types['source_port']:
    identity = item.get('source_net_id', item.get('source_port_id'))
    owner = root(identity)
    if item['type'] == 'source_net':
        labels[owner].add(item['name'])
    if item.get('subcircuit_connectivity_map_key'):
        keys[item['subcircuit_connectivity_map_key']].add(owner)

def trace_owner(item):
    trace = traces[item['source_trace_id']] if item['type'] == 'pcb_trace' else item
    ids = trace.get('connected_source_port_ids', []) + trace.get('connected_source_net_ids', [])
    return root(ids[0])

via_aliases, conflicts, ghost_alias_count = {}, [], 0
for via in types['pcb_via']:
    owner_candidates = []
    if via.get('source_net_id'):
        owner_candidates.append(root(via['source_net_id']))
    if via.get('pcb_trace_id'):
        owner_candidates.append(trace_owner(pcb_traces[via['pcb_trace_id']]))
    if via.get('subcircuit_connectivity_map_key'):
        owner_candidates.extend(keys[via['subcircuit_connectivity_map_key']])
    if len(set(owner_candidates)) != 1:
        conflicts.append({'id': via['pcb_via_id'], 'kind': 'via_owner_conflict', 'owners': owner_candidates})
        continue
    owner = owner_candidates[0]
    for p in via.get('pcb_port_ids', []):
        source = ports[pcb_ports[p]['source_port_id']]
        source_owner = root(source['source_port_id'])
        # Manual-via terminal aliases can have no direct source trace. Their
        # electrically explicit barrel owner resolves that missing logical edge.
        if source_owner != owner:
            if source.get('source_component_id', '').startswith('source_manually_placed_via_') and not labels[source_owner]:
                ghost_alias_count += 1
            else:
                conflicts.append({'id': via['pcb_via_id'], 'kind': 'via_terminal_net_conflict', 'port': p})
        via_aliases[p] = owner

def port_owner(p):
    return via_aliases.get(p, root(pcb_ports[p]['source_port_id']))

connects_types = collections.Counter()
for trace in types['pcb_trace']:
    owner = trace_owner(trace)
    for p in trace.get('connectsTo', []):
        if p in pcb_ports:
            other = port_owner(p)
            connects_types['pcb_port'] += 1
        elif p in traces:
            other = trace_owner(traces[p])
            connects_types['source_trace_placeholder'] += 1
        else:
            conflicts.append({'id': trace['pcb_trace_id'], 'kind': 'unknown_connectsTo', 'target': p})
            continue
        if owner != other:
            conflicts.append({'id': trace['pcb_trace_id'], 'kind': 'cross_net_connectsTo', 'target': p})
    for point in trace['route']:
        for field in ('start_pcb_port_id', 'end_pcb_port_id'):
            if point.get(field) and port_owner(point[field]) != owner:
                conflicts.append({'id': trace['pcb_trace_id'], 'kind': 'cross_net_route_anchor', 'target': point[field]})

ambiguous_keys = {key: sorted(values) for key, values in keys.items() if len(values) != 1}
merged_nets = {owner: sorted(names) for owner, names in labels.items() if len(names) > 1}
electrical_pads = [p for p in types['pcb_smtpad'] + types['pcb_plated_hole'] if p.get('pcb_port_id')]
for pad in electrical_pads:
    port_owner(pad['pcb_port_id'])
for pour in types['pcb_copper_pour']:
    if not pour.get('source_net_id'):
        conflicts.append({'id': pour['pcb_copper_pour_id'], 'kind': 'unowned_pour'})

specific = []
for trace_id in ('source_trace_44', 'source_trace_45', 'source_trace_64', 'source_trace_65', 'source_trace_675', 'source_trace_728'):
    trace = traces[trace_id]
    specific.append({'sourceTraceId': trace_id, 'name': trace.get('name'), 'displayName': trace.get('display_name'), 'declaredSourceNetIds': trace.get('connected_source_net_ids', []), 'resolvedNames': sorted(labels[trace_owner(trace)])})

result = {
    'circuitSha256': hashlib.sha256(raw).hexdigest(),
    'algorithm': 'Union only explicit source_trace connected_source_port_ids and connected_source_net_ids; resolve manual-via terminal aliases exclusively through that barrel explicit source_net_id/pcb_trace_id and unique connectivity key; independently cross-check all trace endpoints and ownership channels.',
    'declaredNetCount': len(types['source_net']),
    'pcbTraceCount': len(types['pcb_trace']),
    'viaCount': len(types['pcb_via']),
    'pourCount': len(types['pcb_copper_pour']),
    'electricalPadCount': len(electrical_pads),
    'electricalPadLogicalNetCount': len({port_owner(p['pcb_port_id']) for p in electrical_pads}),
    'ambiguousConnectivityKeys': ambiguous_keys,
    'mergedDistinctDeclaredNets': merged_nets,
    'ownershipConflicts': conflicts,
    'connectsToReferenceTypes': dict(connects_types),
    'manualViaTerminalAliasesResolvedByBarrel': ghost_alias_count,
    'screenshotSpecificNetChecks': specific,
    'pass': not conflicts and not ambiguous_keys and not merged_nets,
}
OUT.write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({key: value for key, value in result.items() if key not in ('screenshotSpecificNetChecks',)}, indent=2))
