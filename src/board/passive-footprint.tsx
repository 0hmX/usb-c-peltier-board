export function passiveFootprint(size: string) {
  const dimensions = size === "0402" ? [0.45, 0.5, 0.6, 1.9, 1.1]
    : size === "0603" ? [0.75, 0.8, 0.9, 2.8, 1.6]
      : size === "1206" ? [1.75, 1.4, 1.9, 5.4, 2.7] : undefined
  if (!dimensions) return undefined
  const [offset, width, height, courtyardWidth, courtyardHeight] = dimensions
  return <footprint>
    <smtpad shape="rect" pcbX={-offset!} width={width!} height={height!} portHints={["pin1"]} solderMaskMargin={0.05} />
    <smtpad shape="rect" pcbX={offset!} width={width!} height={height!} portHints={["pin2"]} solderMaskMargin={0.05} />
    <courtyardrect width={courtyardWidth!} height={courtyardHeight!} />
  </footprint>
}
